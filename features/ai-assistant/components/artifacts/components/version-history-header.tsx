/**
 * Version History Header Component - shared component for artifacts in panel view to handle title editing and version history
 * 
 * Purpose: Header component that displays editable title, version count, and save status
 * Used in: Text, code, and sheet artifact editing components
 * Why: Provides unified header with title editing and visual feedback for version history
 * 
 * Features:
 * - Editable title (works with any artifact type)
 * - Version count display (from fetched documents)
 * - Countdown indicator (during debounce period)
 * - "Saving..." indicator (during save operation)
 * - "Saved" indicator (after successful save)
 * - Last saved timestamp (formatted relative time)
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useDocument } from '../hooks/use-document-swr';
import { Clock, CheckCircle2, Loader2, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/shared/lib/utils';

interface VersionHistoryHeaderProps {
  documentId: string | null;
  title: string;
  onTitleChange?: (newTitle: string) => void;
  isDebouncing: boolean;
  countdown: number;
  isSaving: boolean;
  lastSavedAt: Date | null;
  isStreaming?: boolean;
  canEdit?: boolean;
  className?: string;
  currentVersionIndex?: number; // Current version index (0-based)
  totalVersions?: number; // Total number of versions
}

/**
 * Version History Header Component
 * 
 * Unified header component that displays:
 * - Editable title (works with any artifact type)
 * - Version count (from fetched documents via SWR)
 * - Countdown indicator (during debounce period)
 * - Save status (saving/saved)
 * - Last saved timestamp (formatted as relative time)
 * 
 * @param documentId - Document ID to fetch version count for
 * @param title - Current title value
 * @param onTitleChange - Callback when title changes (triggers debounce)
 * @param isDebouncing - Whether debounce timer is active
 * @param countdown - Remaining seconds in countdown (0-5)
 * @param isSaving - Whether save operation is in progress
 * @param lastSavedAt - Timestamp of last successful save
 * @param isStreaming - Whether artifact is currently streaming (disables editing)
 * @param canEdit - Whether editing is enabled (default: true if not streaming and onTitleChange provided)
 * @param className - Optional additional CSS classes
 * 
 * @example
 * ```typescript
 * <VersionHistoryHeader
 *   documentId={documentId}
 *   title={title}
 *   onTitleChange={(newTitle) => {
 *     setTitle(newTitle);
 *     triggerDebounce();
 *   }}
 *   isDebouncing={isDebouncing}
 *   countdown={countdown}
 *   isSaving={isSaving}
 *   lastSavedAt={lastSavedAt}
 * />
 * ```
 */
export function VersionHistoryHeader({
  documentId,
  title,
  onTitleChange,
  isDebouncing,
  countdown,
  isSaving,
  lastSavedAt,
  isStreaming = false,
  canEdit: canEditProp,
  className,
  currentVersionIndex,
  totalVersions,
}: VersionHistoryHeaderProps) {
  const { documents, isLoading } = useDocument(documentId);
  const versionCount = documents?.length || 0;
  
  // Use provided totalVersions or fallback to versionCount
  const totalVersionsDisplay = totalVersions ?? versionCount;
  
  // Calculate current version number (1-based) from index
  const currentVersionNumber = currentVersionIndex !== undefined && currentVersionIndex >= 0
    ? currentVersionIndex + 1
    : totalVersionsDisplay; // If no index provided, assume latest

  // Editable title state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState(title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Determine if editing is enabled
  const canEdit = canEditProp ?? (!isStreaming && !!onTitleChange);

  // Update editTitleValue when title prop changes
  useEffect(() => {
    setEditTitleValue(title);
  }, [title]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Handle title click to enter edit mode
  const handleTitleClick = () => {
    if (canEdit) {
      setIsEditingTitle(true);
    }
  };

  // Handle title blur - save changes if valid
  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (editTitleValue !== title && editTitleValue.trim() && onTitleChange) {
      // Don't trim - preserve user's exact input (including trailing spaces if they want them)
      // Only trim if the entire value is whitespace
      const valueToSave = editTitleValue.trim() === '' ? editTitleValue.trim() : editTitleValue;
      onTitleChange(valueToSave);
    } else {
      setEditTitleValue(title); // Reset if empty or unchanged
    }
  };

  // Handle title keyboard shortcuts
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur(); // Triggers handleTitleBlur
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditTitleValue(title); // Revert to original
      setIsEditingTitle(false);
    }
  };

  return (
    <div className={cn('mb-6', className)}>
      {/* Title Section */}
      <div className="mb-2">
        {isEditingTitle && canEdit ? (
          <Input
            ref={titleInputRef}
            value={editTitleValue}
            onChange={(e) => setEditTitleValue(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="text-2xl font-bold h-auto py-2"
          />
        ) : (
          <div
            onClick={handleTitleClick}
            className={cn(
              'flex items-center gap-2 cursor-pointer group transition-colors',
              canEdit && 'hover:bg-muted/50 rounded-md px-2 py-1 -mx-2 -my-1',
              !canEdit && 'cursor-default'
            )}
            role={canEdit ? 'button' : undefined}
            tabIndex={canEdit ? 0 : undefined}
            onKeyDown={canEdit ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTitleClick();
              }
            } : undefined}
            aria-label={canEdit ? 'Click to edit title' : undefined}
          >
            <h1 className="text-2xl font-bold">{title}</h1>
            {canEdit && (
              <Pencil 
                size={16} 
                className="opacity-0 group-hover:opacity-50 transition-opacity text-muted-foreground" 
                aria-hidden="true"
              />
            )}
          </div>
        )}
      </div>

      {/* Status Indicators Row */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {/* Version Display: "Version X / Y" */}
        {!isLoading && totalVersionsDisplay > 0 && (
          <div className="flex items-center gap-1">
            <span>Version {currentVersionNumber} / {totalVersionsDisplay}</span>
          </div>
        )}

        {/* Streaming Indicator */}
        {isStreaming && (
          <div className="flex items-center gap-1">
            <Loader2 size={14} className="animate-spin" />
            <span>Generating...</span>
          </div>
        )}

        {/* Countdown Indicator */}
        {!isStreaming && isDebouncing && countdown > 0 && (
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <Clock size={14} />
            <span>Saving in {countdown}s...</span>
          </div>
        )}

        {/* Saving Indicator */}
        {!isStreaming && isSaving && (
          <div className="flex items-center gap-1">
            <Loader2 size={14} className="animate-spin" />
            <span>Saving...</span>
          </div>
        )}

        {/* Saved Indicator */}
        {!isStreaming && !isDebouncing && !isSaving && lastSavedAt && (
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <CheckCircle2 size={14} />
            <span>Saved {formatLastSaved(lastSavedAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Format last saved timestamp as relative time
 * 
 * Examples:
 * - "just now" (less than 10 seconds)
 * - "15s ago" (less than 60 seconds)
 * - "5m ago" (less than 60 minutes)
 * - "2h ago" (less than 24 hours)
 * - "12/5/2024" (more than 24 hours)
 * 
 * @param date - Date to format
 * @returns Formatted relative time string
 */
function formatLastSaved(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);

  if (diffSec < 10) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  
  // More than 24 hours - show date
  return date.toLocaleDateString();
}

