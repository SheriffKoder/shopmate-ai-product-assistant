/**
 * Artifact Download Library
 *
 * Purpose: Creates browser downloads for generated artifact content.
 * Used in: ArtifactDownloadButton.
 */

import type { DocumentKind } from '@/features/ai-assistant/model/artifact-document';

const artifactFileTypes: Record<DocumentKind, { extension: string; mimeType: string }> = {
  text: { extension: 'md', mimeType: 'text/markdown;charset=utf-8' },
  code: { extension: 'txt', mimeType: 'text/plain;charset=utf-8' },
  sheet: { extension: 'csv', mimeType: 'text/csv;charset=utf-8' },
  chart: { extension: 'json', mimeType: 'application/json;charset=utf-8' },
};

/** Downloads artifact content using a filename and format appropriate to its kind. */
export function downloadArtifact({
  content,
  kind,
  title,
}: {
  content: string;
  kind: DocumentKind;
  title: string;
}) {
  const fileType = artifactFileTypes[kind];
  const safeTitle = title.trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'artifact';
  const blob = new Blob([content], { type: fileType.mimeType });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = objectUrl;
  link.download = `${safeTitle}.${fileType.extension}`;
  link.click();
  URL.revokeObjectURL(objectUrl);
}
