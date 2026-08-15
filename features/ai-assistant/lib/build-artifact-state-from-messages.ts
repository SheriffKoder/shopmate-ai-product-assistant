/**
 * @file features/ai-assistant/lib/build-artifact-state-from-messages.ts
 * Pure builder: persisted message parts → UIArtifact seed state.
 * Used in: use-chat-messages when loading / switching chats.
 * Used for: Restoring artifact panel content without keeping hydrate logic in the hook.
 *
 * Function Index:
 * buildArtifactStateFromMessages: Find data-artifactContent and map it to UIArtifact.
 *
 * Steps:
 * 1. Scan message parts for the first data-artifactContent payload.
 * 2. Map id/title/kind/content onto initialArtifactData.
 * 3. Return null when no usable artifact payload exists.
 */

import type { UIMessage } from 'ai';
import {
  initialArtifactData,
  type UIArtifact,
} from '../components/artifacts/hooks/use-artifact';
import { getArtifactContentPart } from './artifact-content-part';

/**
 * Build a complete UIArtifact from persisted chat messages.
 * Returns null when the conversation has no artifact content part.
 *
 * @example
 * buildArtifactStateFromMessages([
 *   { id: '1', role: 'assistant', parts: [{ type: 'data-artifactContent', data: { documentId: 'd1', title: 'Sheet', kind: 'sheet', content: 'a,b' } }] },
 * ])
 */
export function buildArtifactStateFromMessages(
  messages: UIMessage[],
): UIArtifact | null {
  // 1. Prefer the first persisted artifact content part in the conversation.
  const artifactPart = messages
    .flatMap((message) => message.parts || [])
    .map((part) => getArtifactContentPart(part))
    .find((part) => part !== null);

  if (!artifactPart) return null;

  // 2. Seed from the default idle artifact so isVisible / boundingBox stay reset.
  return {
    ...initialArtifactData,
    documentId: artifactPart.id || initialArtifactData.documentId,
    title: artifactPart.title || initialArtifactData.title,
    kind: artifactPart.kind || initialArtifactData.kind,
    content: artifactPart.content ?? initialArtifactData.content,
    status: 'complete',
  };
}
