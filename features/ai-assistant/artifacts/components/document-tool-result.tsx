/**
 * Document Tool Result Component (Artifact utton appearing in the messages list when the panel is open -- Finished state)
 * 
 * Purpose: Small button shown when artifact panel is open (after creation)
 * Used in: DocumentPreview component
 * Why: Shows compact view when artifact panel is visible
 */

'use client';

import { memo } from 'react';
import { useArtifact } from '../hooks/use-artifact';
import { File, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFullscreen } from '@/features/ai-assistant/providers/fullscreen-context';

interface DocumentToolResultProps {
  type: 'create' | 'update';
  result: {
    id: string;
    title: string;
    kind: 'text' | 'code' | 'sheet';
  };
  isReadonly?: boolean;
}

/**
 * Document Tool Result Component
 * 
 * Shows "Created 'title'" button (completed)
 */
const PureDocumentToolResult = ({
  type,
  result,
  isReadonly,
}: DocumentToolResultProps) => {
  const { setArtifact } = useArtifact();
  const { isFullScreen } = useFullscreen();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isReadonly) return;
    
    // Only open artifact panel if in fullscreen mode
    if (!isFullScreen) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();

    setArtifact((currentArtifact) => ({
      documentId: result.id,
      kind: result.kind,
      content: currentArtifact.content,
      title: result.title,
      isVisible: true,
      status: 'idle',
      boundingBox: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      },
    }));
  };

  const actionText = type === 'create' ? 'Created' : 'Updated';

  return (
    <Button
      variant="outline"
      className="flex w-fit cursor-pointer flex-row items-start gap-3 rounded-xl px-3 py-2"
      onClick={handleClick}
      type="button"
      disabled={isReadonly}
    >
      <div className="mt-1 text-muted-foreground">
        {result.kind === 'sheet' ? (
          <FileSpreadsheet size={16} />
        ) : (
          <File size={16} />
        )}
      </div>
      <div className="text-left">
        {`${actionText} "${result.title}"`}
      </div>
    </Button>
  );
};

export const DocumentToolResult = memo(PureDocumentToolResult, () => true);

