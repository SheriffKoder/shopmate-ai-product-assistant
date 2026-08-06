/**
 * Artifact Copy Button Component
 * 
 * Purpose: Reusable button to copy artifact content to clipboard
 * Used in: Text, sheet, and other artifact content components
 * Why: Provides unified copy functionality across all artifact types
 * 
 * Features:
 * - Copies content based on artifact kind (CSV for sheets, markdown for text)
 * - Shows success feedback when copied
 * - Handles copy errors gracefully
 * - Works with all artifact types
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { parse, unparse } from 'papaparse';
import type { DocumentKind } from '@/features/ai-assistant/model/artifact-document';

interface ArtifactCopyButtonProps {
  /** Content to copy (CSV for sheets, markdown for text) */
  content: string;
  /** Artifact kind to determine copy format */
  kind?: DocumentKind;
  /** Optional className */
  className?: string;
  /** Optional size prop */
  size?: 'sm' | 'lg' | 'icon' | 'default';
  /** Optional variant */
  variant?: 'default' | 'outline' | 'ghost';
}

/**
 * Artifact Copy Button Component
 * 
 * Copies artifact content to clipboard based on artifact kind.
 * 
 * @param content - Content to copy (CSV for sheets, markdown for text)
 * @param kind - Artifact kind (sheet, text, code, etc.)
 * @param className - Optional additional CSS classes
 * @param size - Button size
 * @param variant - Button variant
 * 
 * @example
 * ```typescript
 * <ArtifactCopyButton
 *   content={csvContent}
 *   kind="sheet"
 * />
 * ```
 */
export function ArtifactCopyButton({
  content,
  kind = 'text',
  className,
  size = 'sm',
  variant = 'outline',
}: ArtifactCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!content || !content.trim()) {
      return;
    }

    let contentToCopy = content;

    // For sheet artifacts, format as TSV (tab-separated) for Excel compatibility
    // Excel recognizes tabs as column separators when pasting
    if (kind === 'sheet') {
      try {
        // Parse CSV to clean and format it
        const parsed = parse<string[]>(content, { 
          skipEmptyLines: false,
          header: false,
        });

        // Filter out completely empty rows (rows where all cells are empty)
        const nonEmptyRows = parsed.data.filter((row) =>
          row.some((cell) => cell && cell.trim() !== '')
        ) as string[][];

        if (nonEmptyRows.length > 0) {
          // Convert to TSV (tab-separated values) for Excel paste compatibility
          // Excel automatically recognizes tabs as column separators when pasting
          contentToCopy = nonEmptyRows
            .map((row) => row.map((cell) => cell || '').join('\t'))
            .join('\n');
        }
      } catch (error) {
        console.error('[ArtifactCopyButton] Error processing CSV:', error);
        // Fall back to original content if parsing fails
      }
    }

    try {
      await navigator.clipboard.writeText(contentToCopy);
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('[ArtifactCopyButton] Error copying to clipboard:', error);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = contentToCopy;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (fallbackError) {
        console.error('[ArtifactCopyButton] Fallback copy failed:', fallbackError);
      }
    }
  };

  return (
    <Button
      id={`artifact-copy-${kind}`}
      variant={variant}
      size={size}
      onClick={handleCopy}
      disabled={!content || !content.trim()}
      className={cn('gap-2 rounded bg-foreground text-background hover:bg-foreground/90 hover:text-background', className)}
      aria-label={`Copy ${kind} content to clipboard`}
      title={`Copy ${kind} content`}
    >
      {copied ? (
        <>
          <Check size={14} />
          Copied!
        </>
      ) : (
        <>
          <Copy size={14} />
          Copy
        </>
      )}
    </Button>
  );
}
