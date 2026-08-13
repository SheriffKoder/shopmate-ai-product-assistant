/**
 * @file features/ai-assistant/lib/artifact-content-part.ts
 * Pure helpers for persisted artifact content message parts.
 * Used in: MessagePartRenderer and shop-assistant stream hydration.
 * Used for: Mounting DocumentPreview from data-artifactContent without a fake createDocument tool call.
 *
 * Function Index:
 * isDocumentKind: Narrow unknown values to a supported artifact kind.
 * getArtifactContentPart: Read id/title/kind/content from a data-artifactContent part.
 * hasCreateDocumentPreviewForId: Detect an existing createDocument card for the same document.
 *
 * Steps:
 * 1. Ignore parts that are not data-artifactContent or have no object payload.
 * 2. Map documentId or id, title, kind, and content when they are valid strings.
 * 3. Let callers decide whether id/title/kind are enough to mount a preview.
 */

import type { DocumentKind } from '@/features/ai-assistant/model/artifact-document';

const DOCUMENT_KINDS: readonly DocumentKind[] = ['text', 'code', 'sheet', 'chart'];

/** Parsed payload from a persisted data-artifactContent part. */
export interface ArtifactContentPart {
  id?: string;
  title?: string;
  kind?: DocumentKind;
  content?: string;
}

/**
 * Narrow unknown values to a supported artifact kind.
 *
 * @example
 * isDocumentKind('sheet')
 */
export function isDocumentKind(value: unknown): value is DocumentKind {
  return typeof value === 'string' && DOCUMENT_KINDS.includes(value as DocumentKind);
}

/**
 * Read artifact preview fields from a persisted data-artifactContent part.
 * Returns null for unknown or empty payloads so callers can ignore them safely.
 *
 * @example
 * getArtifactContentPart({ type: 'data-artifactContent', data: { documentId: '1', title: 'Catalog', kind: 'sheet' } })
 */
export function getArtifactContentPart(part: unknown): ArtifactContentPart | null {
  // 1. Only persisted artifact content parts carry a chat preview payload.
  if (!part || typeof part !== 'object') return null;

  const typed = part as { type?: unknown; data?: unknown };
  if (typed.type !== 'data-artifactContent' || !typed.data || typeof typed.data !== 'object') {
    return null;
  }

  const data = typed.data as {
    documentId?: unknown;
    id?: unknown;
    title?: unknown;
    kind?: unknown;
    content?: unknown;
  };

  // 2. Prefer documentId from artifact handlers; accept id as a fallback alias.
  const id = typeof data.documentId === 'string' && data.documentId.trim()
    ? data.documentId
    : typeof data.id === 'string' && data.id.trim()
      ? data.id
      : undefined;
  const title = typeof data.title === 'string' && data.title.trim() ? data.title : undefined;
  const kind = isDocumentKind(data.kind) ? data.kind : undefined;
  const content = typeof data.content === 'string' ? data.content : undefined;

  if (!id && !title && !kind && content === undefined) return null;

  return { id, title, kind, content };
}

/**
 * True when a createDocument tool part already previews this document id.
 * Used so technical-discussion cards are not duplicated by data-artifactContent.
 *
 * @example
 * hasCreateDocumentPreviewForId([{ type: 'dynamic-tool', toolName: 'createDocument', output: { id: '1' } }], '1')
 */
export function hasCreateDocumentPreviewForId(
  parts: unknown[] | undefined,
  documentId: string,
): boolean {
  if (!parts?.length || !documentId) return false;

  return parts.some((part) => {
    if (!part || typeof part !== 'object') return false;

    const typed = part as {
      type?: unknown;
      toolName?: unknown;
      output?: { id?: unknown };
    };

    return typed.type === 'dynamic-tool'
      && typed.toolName === 'createDocument'
      && typed.output?.id === documentId;
  });
}
