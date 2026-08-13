/**
 * Version History Management Buttons Component - used in the history-header, history management buttons
 * 
 * Purpose: Provides undo/redo/keep buttons for version navigation
 * Used in: TextArtifactContent and other artifact components
 * Why: Centralized UI for version history management
 * 
 * Features:
 * - Undo button (navigate to previous version)
 * - Redo button (navigate to next version)
 * - Keep button (delete all versions after current, only shown when not at latest)
 * - Disabled states based on version position
 * - Loading states for keep operation
 */

'use client';

import { Button } from '@/components/ui/button';
import { Undo2, Redo2, Scissors } from 'lucide-react';
import { useVersionHistoryKeep } from '../hooks/version-history-keep';
import { logger } from '@/features/ai-assistant/lib/logger';
import { cn } from '@/shared/lib/utils';
import type { DocumentKind } from '@/features/ai-assistant/model/artifact-document';

interface VersionHistoryManagementButtonsProps {
  /** Document ID */
  documentId: string | null;
  
  /** Current version timestamp (ISO string) */
  currentVersionTimestamp: string | null;
  
  /** Whether undo is available */
  canUndo: boolean;
  
  /** Whether redo is available */
  canRedo: boolean;
  
  /** Whether navigation is available (more than 1 version) */
  canNavigate: boolean;
  
  /** Whether currently at latest version */
  isAtLatest: boolean;
  
  /** Undo handler */
  onUndo: () => void;
  
  /** Redo handler */
  onRedo: () => void;
  
  /** Optional className for container */
  className?: string;
  
  /** Optional message to display when viewing old version */
  viewingOldVersionMessage?: string | null;
  
  /** Artifact kind (for API endpoint selection) */
  kind?: DocumentKind;
}

/**
 * Version History Management Buttons Component
 * 
 * Renders undo/redo/keep buttons for version navigation.
 * 
 * Button States:
 * - Undo: Disabled if at first version or only 1 version
 * - Redo: Disabled if at last version or only 1 version
 * - Keep: Only shown if not at latest version, disabled during operation
 * 
 * @example
 * ```typescript
 * <VersionHistoryManagementButtons
 *   documentId={documentId}
 *   currentVersionTimestamp={currentVersion?.createdAt || null}
 *   canUndo={canUndo}
 *   canRedo={canRedo}
 *   canNavigate={canNavigate}
 *   isAtLatest={isAtLatest}
 *   onUndo={undo}
 *   onRedo={redo}
 * />
 * ```
 */
export function VersionHistoryManagementButtons({
  documentId,
  currentVersionTimestamp,
  canUndo,
  canRedo,
  canNavigate,
  isAtLatest,
  onUndo,
  onRedo,
  className,
  viewingOldVersionMessage,
  kind = 'text', // Default to 'text' for backward compatibility
}: VersionHistoryManagementButtonsProps) {
  const { keepVersion, isKeeping, error: keepError } = useVersionHistoryKeep({
    documentId,
    timestamp: currentVersionTimestamp,
    kind,
  });

  const handleKeep = async () => {
    if (!currentVersionTimestamp) {
      logger.warn('[Version History Buttons] Cannot keep: no timestamp');
      return;
    }

    try {
      await keepVersion();
      // After keeping, we should be at the latest version
      // The navigation hook will update automatically via SWR cache invalidation
    } catch (err) {
      logger.error('[Version History Buttons] Error keeping version', err);
      // Error is already handled by the hook
    }
  };

  // Don't render if navigation is not available
  if (!canNavigate) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-2 w-full', className)}>
      {/* Buttons Container */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Undo Button */}
        <Button
          id="artifact-version-undo"
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          className="gap-2 rounded bg-foreground text-background cursor-pointer hover:opacity-80 hover:bg-foreground/90 hover:text-background"
          aria-label="Undo (previous version)"
          title="Previous version"
        >
          <Undo2 size={14} />
          Undo
        </Button>

        {/* Redo Button */}
        <Button
          id="artifact-version-redo"
          variant="outline"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          className="gap-2 rounded bg-foreground text-background cursor-pointer hover:opacity-80 hover:bg-foreground/90 hover:text-background"
          aria-label="Redo (next version)"
          title="Next version"
        >
          <Redo2 size={14} />
          Redo
        </Button>

        {/* Keep Button - Only show if not at latest version */}
        {!isAtLatest && (
          <Button
            id="artifact-version-keep"
            variant="outline"
            size="sm"
            onClick={handleKeep}
            disabled={isKeeping || !currentVersionTimestamp}
            className="gap-2 rounded bg-foreground text-background cursor-pointer hover:opacity-80 hover:bg-foreground/90 hover:text-background"
            aria-label="Keep this version and delete all after it"
            title="Keep this version (delete all versions after this)"
          >
            <Scissors size={14} />
            {isKeeping ? 'Keeping...' : 'Keep'}
          </Button>
        )}

        {/* Keep Error Display */}
        {keepError && (
          <span className="text-xs text-red-600 dark:text-red-400" title={keepError.message}>
            Keep failed
          </span>
        )}
      </div>

      {/* Viewing Old Version Message - Takes remaining width and wraps */}
      {viewingOldVersionMessage && (
        <div className="flex-1 min-w-0 ml-2">
          <p className="text-xs text-amber-600 dark:text-amber-400 break-words" title={viewingOldVersionMessage}>
            {viewingOldVersionMessage}
          </p>
        </div>
      )}
    </div>
  );
}
