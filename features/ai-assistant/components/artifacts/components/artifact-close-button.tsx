/**
 * Artifact Close Button Component
 * 
 * Purpose: Button to close the artifact panel
 * Used in: ArtifactPanel component
 * Why: Allows users to close the artifact panel and return to full chat view
 * 
 * Behavior:
 * - If artifact is streaming: Just hides the panel (preserves state)
 * - If artifact is complete: Resets to initial state
 */

'use client';

import { memo } from 'react';
import { useArtifact } from '../hooks/use-artifact';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useFullscreen } from '@/features/ai-assistant/providers/fullscreen-context';

/**
 * Artifact Close Button Component
 * 
 * Closes the artifact panel with smart behavior:
 * - Streaming artifacts: Just hide panel (preserve streaming state)
 * - Completed artifacts: Reset to initial state
 */
function PureArtifactCloseButton() {
  const { setArtifact } = useArtifact();
  const { setIsFullScreen } = useFullscreen();

  const handleClose = () => {
    setArtifact((currentArtifact) => {
      // Artifact integration: restore the assistant mode that existed before opening the panel.
      if (!currentArtifact.wasFullscreenBeforeOpening) setIsFullScreen(false);

      return {
        ...currentArtifact,
        isVisible: false,
        // Preserve all content - don't reset to initial state
        // This allows the preview card to show content when panel is closed
      };
    });
  };

  return (
    <Button
      id="artifact-panel-close"
      variant="outline"
      size="icon"
      className="absolute top-4 right-4 z-50 h-fit rounded bg-foreground text-background p-2 hover:bg-foreground/90 cursor-pointer"
      onClick={handleClose}
      aria-label="Close artifact panel"
      data-testid="artifact-close-button"
    >
      <X size={18} />
    </Button>
  );
}

export const ArtifactCloseButton = memo(PureArtifactCloseButton, () => true);
