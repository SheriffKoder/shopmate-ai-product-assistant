/**
 * Document Tool Call Component (Artifact utton appearing in the messages list when the panel is open -- Loading state)
 * 
 * Purpose: Small button shown when artifact panel is open (while creating)
 * Used in: DocumentPreview component
 * Why: Shows compact view when artifact panel is visible
 */

'use client';

import { memo } from 'react';
import { useArtifact } from '../hooks/use-artifact';
import { File, Loader2, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFullscreen } from '@/features/ai-assistant/providers/fullscreen-context';

interface DocumentToolCallProps {
  type: 'create' | 'update';
  args: { title?: string; description?: string; kind?: 'text' | 'code' | 'sheet' };
  isReadonly?: boolean;
}

/**
 * Document Tool Call Component
 * 
 * Shows "Creating 'title'..." button with loading spinner
 */
const PureDocumentToolCall = ({
  type,
  args,
  isReadonly,
}: DocumentToolCallProps) => {
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
      ...currentArtifact,
      isVisible: true,
      boundingBox: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      },
    }));
  };

  const actionText = type === 'create' ? 'Creating' : 'Updating';
  const titleText = args.title || args.description || 'document';

  return (
    <Button
      variant="outline"
      className="flex w-fit cursor-pointer flex-row items-start gap-3 rounded-xl px-3 py-2"
      onClick={handleClick}
      type="button"
      disabled={isReadonly}
    >
      <div className="mt-1 text-muted-foreground">
        {args.kind === 'sheet' ? (
          <FileSpreadsheet size={16} />
        ) : (
          <File size={16} />
        )}
      </div>
      <div className="text-left">
        {`${actionText} "${titleText}"`}
      </div>
      <div className="mt-1 animate-spin">
        <Loader2 size={16} />
      </div>
    </Button>
  );
};

export const DocumentToolCall = memo(PureDocumentToolCall, () => true);

