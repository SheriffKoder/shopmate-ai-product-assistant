/**
 * Document Content Component
 * 
 * Purpose: Content preview with overflow hidden (~257px height)
 * Used in: DocumentPreview component
 * Why: Shows artifact content preview in message list
 */

'use client';

import { useArtifact } from '../hooks/use-artifact';
import { MarkdownText } from '@/features/ai-assistant/components/ui/markdown-text';
import { Table } from '../sheet/components/table-non-edit';
import { ChartRenderer } from '../chart/components/chart-renderer';
import { cn } from '@/lib/utils';

interface DocumentContentProps {
  document: {
    title: string;
    kind: 'text' | 'code' | 'sheet' | 'chart';
    content: string;
    id: string;
  };
}

/**
 * Document Content Component
 * 
 * Displays the artifact content preview with overflow hidden
 */
export function DocumentContent({ document }: DocumentContentProps) {
  const { artifact } = useArtifact();

  const containerClassName = cn(
    'h-[257px] rounded-b-2xl border border-t-0 dark:border-zinc-700 dark:bg-muted',
    {
      'p-4 sm:px-14 sm:py-16': document.kind === 'text',
      'p-0': document.kind === 'code' || document.kind === 'sheet' || document.kind === 'chart',
      'overflow-y-auto': document.kind !== 'sheet' && document.kind !== 'chart'
    }
  );

  return (
    <div className={containerClassName}>
      {document.kind === 'text' ? (
        <div className="prose prose-sm max-w-none dark:prose-invert min-h-full">
          <MarkdownText>{document.content || ''}</MarkdownText>
        </div>
      ) : document.kind === 'code' ? (
        <pre className="p-4 text-sm">
          <code>{document.content || ''}</code>
        </pre>
      ) : document.kind === 'sheet' ? (
        <Table 
          csvContent={document.content || ''} 
          isPreview={true} 
          isStreaming={artifact.status === 'streaming'} 
        />
      ) : document.kind === 'chart' ? (
        <ChartRenderer jsonContent={document.content || artifact.content || ''} isPreview />
      ) : null}
    </div>
  );
}
