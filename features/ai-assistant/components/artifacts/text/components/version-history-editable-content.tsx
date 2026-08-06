/**
 * Editable Content Component
 * 
 * Purpose: Editable markdown content area for text artifacts
 * Used in: TextArtifactContent component
 * Why: Allows users to edit document content with preview mode
 * 
 * Features:
 * - Textarea for editing markdown
 * - Preview mode toggle (Edit/Preview button)
 * - Triggers debounce on change
 * - Auto-resize textarea
 * - Monospace font for editing
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { MarkdownText } from '@/features/ai-assistant/components/ui/markdown-text';
import { Button } from '@/components/ui/button';
import { Eye, Edit } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface EditableContentProps {
  content: string;
  onContentChange: (newContent: string) => void;
  onPreviewModeChange?: (isPreview: boolean) => void;
  className?: string;
}

/**
 * Editable Content Component
 * 
 * Allows editing of markdown content with optional preview mode.
 * Triggers onContentChange callback when content changes (for debounce).
 * 
 * Features:
 * - Edit mode: Textarea with monospace font for markdown editing
 * - Preview mode: Rendered markdown preview
 * - Toggle button: Switch between edit and preview modes
 * - Auto-resize: Textarea grows with content
 * - Real-time updates: Changes trigger debounce immediately
 * 
 * @param content - Current content value
 * @param onContentChange - Callback when content changes (triggers debounce)
 * @param className - Optional additional CSS classes
 * 
 * @example
 * ```typescript
 * <EditableContent
 *   content={documentContent}
 *   onContentChange={(newContent) => {
 *     setContent(newContent);
 *     triggerDebounce(); // Trigger auto-save debounce
 *   }}
 * />
 * ```
 */
export function EditableContent({
  content,
  onContentChange,
  onPreviewModeChange,
  className,
}: EditableContentProps) {
  const [editValue, setEditValue] = useState(content);
  const [isPreview, setIsPreview] = useState(true); // Start in preview mode, not edit mode
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isUserEditingRef = useRef(false);
  const lastSyncedContentRef = useRef(content);

  // Notify parent when preview mode changes
  useEffect(() => {
    if (onPreviewModeChange) {
      onPreviewModeChange(isPreview);
    }
  }, [isPreview, onPreviewModeChange]);

  // Update editValue when content prop changes (e.g., from version navigation)
  // But only if user is not currently editing and content actually changed
  useEffect(() => {
    // Only sync if:
    // 1. Content actually changed (not just a re-render)
    // 2. User is not currently editing
    if (content !== lastSyncedContentRef.current && !isUserEditingRef.current) {
      setEditValue(content);
      lastSyncedContentRef.current = content;
    }
  }, [content]);

  // Auto-resize textarea to fit content (no max-height, let container scroll)
  useEffect(() => {
    if (textareaRef.current && !isPreview) {
      // Reset height to auto to get accurate scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set height to scrollHeight to fit all content (container will scroll if needed)
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editValue, isPreview]);

  /**
   * Handle content change in textarea
   * Updates local state and triggers debounce via callback
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    isUserEditingRef.current = true; // Mark that user is editing
    setEditValue(newValue);
    onContentChange(newValue); // Trigger debounce
    
    // Reset editing flag after a delay to allow sync on version change
    // Use a longer delay to ensure typing is complete
    setTimeout(() => {
      isUserEditingRef.current = false;
    }, 500);
  };

  return (
    <div className={cn('relative', className)}>
      {/* Toggle Preview Button */}
      <div className="absolute top-0 right-0 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsPreview(!isPreview)}
          className="gap-2"
          type="button"
          aria-label={isPreview ? 'Switch to edit mode' : 'Switch to preview mode'}
        >
          {isPreview ? (
            <>
              <Edit size={14} />
              Edit
            </>
          ) : (
            <>
              <Eye size={14} />
              Preview
            </>
          )}
        </Button>
      </div>

      {/* Edit Mode */}
      {!isPreview && (
        <Textarea
          ref={textareaRef}
          value={editValue}
          onChange={handleChange}
          className="w-full font-mono text-sm resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
          placeholder="Start typing your markdown content..."
          style={{ minHeight: '100%' }}
        />
      )}

      {/* Preview Mode - No border/padding, matches read-only view */}
      {isPreview && (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <MarkdownText>{editValue}</MarkdownText>
        </div>
      )}
    </div>
  );
}

