/**
 * Document Header Component
 * 
 * Purpose: Header of preview card (icon, title)
 * Used in: DocumentPreview component
 * Why: Displays artifact metadata in preview card header
 */

'use client';

import { File, Loader2 } from 'lucide-react';
import { memo } from 'react';
import { useAssistantStyleConfig } from '@/features/ai-assistant/providers/assistant-style-context';

interface DocumentHeaderProps {
  title: string;
  kind: 'text' | 'code' | 'sheet' | 'chart';
  isStreaming: boolean;
}

/**
 * Document Header Component
 * 
 * Displays the artifact header with icon and title
 */
const PureDocumentHeader = ({
  title,
  kind,
  isStreaming,
}: DocumentHeaderProps) => {
  const styles = useAssistantStyleConfig();
  return (
  <div className={styles.artifacts?.previewHeaderClassName}>
    <div className="flex flex-row items-start gap-3 sm:items-center">
      <div className="text-muted-foreground">
        {isStreaming ? (
          <div className="animate-spin">
            <Loader2 size={16} />
          </div>
        ) : (
          <File size={16} />
        )}
      </div>
      <div className="-translate-y-1 font-semibold sm:translate-y-0">{title}</div>
    </div>
    <div className="w-8" />
  </div>
  );
};

export const DocumentHeader = memo(PureDocumentHeader, (prevProps, nextProps) => {
  if (prevProps.title !== nextProps.title) {
    return false;
  }
  if (prevProps.isStreaming !== nextProps.isStreaming) {
    return false;
  }
  return true;
});
