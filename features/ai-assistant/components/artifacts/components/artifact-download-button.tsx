/**
 * Artifact Download Button Component
 *
 * Purpose: Provides a consistent download action for artifact content.
 * Used in: Text, sheet, and chart artifact content headers.
 */

'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DocumentKind } from '@/features/ai-assistant/model/artifact-document';
import { downloadArtifact } from '../lib/download-artifact';

interface ArtifactDownloadButtonProps {
  content: string;
  kind: DocumentKind;
  title: string;
}

/** Downloads the current artifact version when clicked. */
export function ArtifactDownloadButton({ content, kind, title }: ArtifactDownloadButtonProps) {
  return (
    <Button
      id={`artifact-download-${kind}`}
      variant="outline"
      size="sm"
      onClick={function handleDownload() { downloadArtifact({ content, kind, title }); }}
      disabled={!content.trim()}
      className="gap-2 rounded bg-foreground text-background hover:bg-foreground/90 hover:text-background"
      aria-label={`Download ${kind} artifact`}
      title={`Download ${kind} artifact`}
    >
      <Download size={14} />
      Download
    </Button>
  );
}
