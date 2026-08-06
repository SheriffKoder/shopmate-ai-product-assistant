# Artifact Editing & Version History Implementation Plan

## Overview

This plan outlines the implementation of editing functionality for artifacts with automatic version history. Users can edit artifact titles and content, with changes automatically saved as new versions after a 5-second debounce period. The implementation is designed to be reusable across different artifact types (text, code, sheet).

**Key Features**:
- ✅ Edit title and content in real-time
- ✅ Debounced auto-save (5 seconds after last edit)
- ✅ Countdown indicator during debounce period
- ✅ Version count display in artifact header
- ✅ Version history support (same ID, different createdAt)
- ✅ Reusable across artifact types

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│          Artifact Editing & Version History Flow            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  EDITING PHASE:                                            │
│  1. User edits title/content in TextArtifactContent        │
│     ↓                                                       │
│  2. version-history-debounce hook detects changes          │
│     ↓                                                       │
│  3. Countdown timer starts (5 seconds)                     │
│     ↓                                                       │
│  4. Countdown indicator shows remaining time                │
│     ↓                                                       │
│  5. User continues editing → timer resets                  │
│     ↓                                                       │
│  6. 5 seconds pass without edits                           │
│     ↓                                                       │
│  7. version-history-save hook triggers save                │
│     ↓                                                       │
│  8. POST /api/document?id={documentId} creates new version │
│     ↓                                                       │
│  9. SWR cache invalidated → version count updated          │
│     ↓                                                       │
│  10. Countdown indicator hides, "Saved" indicator shows     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Components**:
- `version-history-debounce.ts` - Reusable debounce hook
- `version-history-save.ts` - Reusable save hook
- `version-history-header.tsx` - Header with version count
- `text-artifact-content.tsx` - Editable text artifact component

---

## Phase 1: Reusable Version History Hooks

### Step 1.1: Create Debounce Hook

**File**: `features/ai-assistant/artifacts/version-history-debounce.ts`

**Purpose**: Reusable debounce hook with countdown indicator for any artifact type

**Features**:
- ✅ Configurable debounce delay (default: 5000ms)
- ✅ Countdown timer state
- ✅ Callback when debounce completes
- ✅ Reset on new changes

```typescript
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseDebounceOptions {
  delay?: number; // Default: 5000ms (5 seconds)
  onDebounceComplete?: () => void;
}

interface UseDebounceReturn {
  isDebouncing: boolean;
  countdown: number; // Remaining seconds (0-5)
  resetDebounce: () => void;
  triggerDebounce: () => void;
}

/**
 * Reusable debounce hook with countdown indicator
 *

 * @param options - Debounce configuration
 * @returns Debounce state and controls
 *

 * Usage:
 * ```typescript
 * const { isDebouncing, countdown, resetDebounce, triggerDebounce } = useDebounce({
 *   delay: 5000,
 *   onDebounceComplete: () => saveDocument(),
 * });
 *

 * // Call triggerDebounce() when user edits content
 * // Hook will automatically call onDebounceComplete after delay
 * ```
 */
export function useVersionHistoryDebounce({
  delay = 5000,
  onDebounceComplete,
}: UseDebounceOptions = {}): UseDebounceReturn {
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const resetDebounce = useCallback(() => {
    // Clear existing timeout and countdown
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }


    setIsDebouncing(false);
    setCountdown(0);
    startTimeRef.current = null;
  }, []);

  const triggerDebounce = useCallback(() => {
    // Reset any existing debounce
    resetDebounce();

    // Start new debounce
    setIsDebouncing(true);
    setCountdown(Math.ceil(delay / 1000)); // Convert to seconds
    startTimeRef.current = Date.now();

    // Start countdown interval (update every second)
    countdownIntervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, Math.ceil((delay - elapsed) / 1000));
        setCountdown(remaining);

        if (remaining === 0) {
          clearInterval(countdownIntervalRef.current!);
          countdownIntervalRef.current = null;
        }
      }
    }, 1000);

    // Set timeout for debounce completion
    timeoutRef.current = setTimeout(() => {
      setIsDebouncing(false);
      setCountdown(0);
      startTimeRef.current = null;


      if (onDebounceComplete) {
        onDebounceComplete();
      }
    }, delay);
  }, [delay, onDebounceComplete, resetDebounce]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetDebounce();
    };
  }, [resetDebounce]);

  return {
    isDebouncing,
    countdown,
    resetDebounce,
    triggerDebounce,
  };
}
```

**Why**: Reusable across all artifact types, provides countdown state for UI

---

### Step 1.2: Create API Endpoint Utility

**File**: `features/ai-assistant/artifacts/utils/artifact-api-endpoint.ts`

**Purpose**: Centralized utility for managing API endpoints for different artifact types

**Features**:
- ✅ Maps artifact kinds to API endpoints
- ✅ Helper function to build URLs with query parameters
- ✅ Easy to extend for future artifact types
- ✅ Backward compatible (defaults to '/api/document')

**Why**: Makes it easy to support different API endpoints for different artifact types (text, code, sheet, image, etc.) without hardcoding endpoints in hooks.

**Status**: ✅ Implemented

---

### Step 1.3: Create Save Hook

**File**: `features/ai-assistant/artifacts/hooks/version-history-save.ts`

**Purpose**: Reusable hook for saving artifact versions to Supabase

**Features**:
- ✅ Generic save function (works with any artifact kind)
- ✅ Creates new version (same ID, new createdAt)
- ✅ SWR cache invalidation
- ✅ Error handling
- ✅ Loading state

```typescript
'use client';

import { useState, useCallback } from 'react';
import { useDocument } from './use-document';
import type { DocumentKind } from '@/shared/infrastructure/supabase/types';
import { logger } from '@/features/ai-assistant/lib/logger';
import { buildArtifactApiUrl } from '../utils/artifact-api-endpoint';

interface SaveVersionParams {
  documentId: string;
  title: string;
  content: string;
  kind: DocumentKind;
}

interface UseVersionHistorySaveReturn {
  saveVersion: (params: SaveVersionParams) => Promise<void>;
  isSaving: boolean;
  error: Error | null;
  lastSavedAt: Date | null;
}

/**
 * Reusable hook for saving artifact versions
 *

 * Creates a new version of the document (same ID, new createdAt)
 * and invalidates SWR cache to refresh version count.
 *

 * @param documentId - Document ID to save
 * @returns Save function and state
 *

 * Usage:
 * ```typescript
 * const { saveVersion, isSaving, error } = useVersionHistorySave();
 *

 * await saveVersion({
 *   documentId: 'abc-123',
 *   title: 'My Document',
 *   content: 'Document content...',
 *   kind: 'text',
 * });
 * ```
 */
export function useVersionHistorySave(documentId: string | null): UseVersionHistorySaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const { mutate: mutateDocument } = useDocument(documentId);

  const saveVersion = useCallback(async ({
    documentId: id,
    title,
    content,
    kind,
  }: SaveVersionParams) => {
    if (!id) {
      logger.warn('[Version History Save] No documentId provided');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      logger.debug('[Version History Save] Saving document version', {
        documentId: id,
        title,
        contentLength: content.length,
        kind,
      });

      // Use artifact-specific API endpoint
      const apiUrl = buildArtifactApiUrl(kind, { id });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          kind,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to save document: ${response.statusText}`);
      }

      const savedDocument = await response.json();


      logger.info('[Version History Save] Successfully saved document version', {
        documentId: id,
        createdAt: savedDocument.createdAt,
        titleLength: savedDocument.title?.length || 0,
        contentLength: savedDocument.content?.length || 0,
      });

      setLastSavedAt(new Date());

      // Invalidate SWR cache to refresh version count
      // Use revalidate: true to force immediate refetch
      await mutateDocument(undefined, { revalidate: true });

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      logger.error('[Version History Save] Error saving document version', error);
      setError(error);
      throw error; // Re-throw so caller can handle
    } finally {
      setIsSaving(false);
    }
  }, [mutateDocument]);

  return {
    saveVersion,
    isSaving,
    error,
    lastSavedAt,
  };
}
```

**Why**: Reusable save logic that works with any artifact kind

---

## Phase 2: Version History Header Component

### Step 2.1: Create Version History Header

**File**: `features/ai-assistant/artifacts/version-history-header.tsx`

**Purpose**: Header component that displays version count and save status

**Features**:
- ✅ Version count display
- ✅ Countdown indicator (during debounce)
- ✅ "Saving..." indicator (during save)
- ✅ "Saved" indicator (after save)
- ✅ Timestamp of last save

```typescript
'use client';

import { useDocument } from '../hooks/use-document';
import { Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface VersionHistoryHeaderProps {
  documentId: string | null;
  isDebouncing: boolean;
  countdown: number;
  isSaving: boolean;
  lastSavedAt: Date | null;
  className?: string;
}

/**
 * Version History Header Component
 *

 * Displays:
 * - Version count (from fetched documents)
 * - Countdown indicator (during debounce)
 * - Save status (saving/saved)
 * - Last saved timestamp
 */
export function VersionHistoryHeader({
  documentId,
  isDebouncing,
  countdown,
  isSaving,
  lastSavedAt,
  className,
}: VersionHistoryHeaderProps) {
  const { documents, isLoading } = useDocument(documentId);
  const versionCount = documents?.length || 0;

  return (
    <div className={cn('flex items-center gap-4 text-sm text-muted-foreground', className)}>
      {/* Version Count */}
      {!isLoading && versionCount > 0 && (
        <div className="flex items-center gap-1">
          <span>Version {versionCount}</span>
        </div>
      )}

      {/* Countdown Indicator */}
      {isDebouncing && countdown > 0 && (
        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
          <Clock size={14} />
          <span>Saving in {countdown}s...</span>
        </div>
      )}

      {/* Saving Indicator */}
      {isSaving && (
        <div className="flex items-center gap-1">
          <Loader2 size={14} className="animate-spin" />
          <span>Saving...</span>
        </div>
      )}

      {/* Saved Indicator */}
      {!isDebouncing && !isSaving && lastSavedAt && (
        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
          <CheckCircle2 size={14} />
          <span>Saved {formatLastSaved(lastSavedAt)}</span>
        </div>
      )}
    </div>
  );
}

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


  return date.toLocaleDateString();
}
```

**Why**: Reusable header component that works with any artifact type

---

## Phase 3: Text Artifact Editing Implementation

### Step 3.1: Create Editable Title Component

**File**: `features/ai-assistant/artifacts/text/version-history-editable-title.tsx`

**Purpose**: Editable title input for text artifacts

**Features**:
- ✅ Inline editing (click to edit)
- ✅ Auto-save on blur
- ✅ Triggers debounce on change

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Pencil } from 'lucide-react';

interface EditableTitleProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  className?: string;
}

/**
 * Editable Title Component
 *

 * Allows inline editing of document title.
 * Triggers onTitleChange callback when title changes.
 */
export function EditableTitle({
  title,
  onTitleChange,
  className,
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update editValue when title prop changes
  useEffect(() => {
    setEditValue(title);
  }, [title]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== title && editValue.trim()) {
      onTitleChange(editValue.trim());
    } else {
      setEditValue(title); // Reset if empty or unchanged
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setEditValue(title);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={className}
      />
    );
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex items-center gap-2 cursor-pointer group hover:bg-muted/50 rounded-md px-2 py-1 -mx-2 -my-1',
        className
      )}
    >
      <h1 className="text-2xl font-bold">{title}</h1>
      <Pencil size={16} className="opacity-0 group-hover:opacity-50 transition-opacity" />
    </div>
  );
}
```

**Why**: Reusable editable title component for text artifacts

---

### Step 3.2: Create Editable Content Component

**File**: `features/ai-assistant/artifacts/text/version-history-editable-content.tsx`

**Purpose**: Editable markdown content area for text artifacts

**Features**:
- ✅ Textarea for editing markdown
- ✅ Preview mode toggle (optional)
- ✅ Triggers debounce on change
- ✅ Auto-resize textarea

```typescript
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
  className?: string;
}

/**
 * Editable Content Component
 *

 * Allows editing of markdown content with optional preview mode.
 * Triggers onContentChange callback when content changes.
 */
export function EditableContent({
  content,
  onContentChange,
  className,
}: EditableContentProps) {
  const [editValue, setEditValue] = useState(content);
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update editValue when content prop changes
  useEffect(() => {
    setEditValue(content);
  }, [content]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && !isPreview) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editValue, isPreview]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setEditValue(newValue);
    onContentChange(newValue); // Trigger debounce
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
          className="min-h-[400px] font-mono text-sm resize-none"
          placeholder="Start typing your markdown content..."
        />
      )}

      {/* Preview Mode */}
      {isPreview && (
        <div className="prose prose-sm max-w-none dark:prose-invert min-h-[400px] p-4 border rounded-md">
          <MarkdownText>{editValue}</MarkdownText>
        </div>
      )}
    </div>
  );
}
```

**Why**: Reusable editable content component for text artifacts

---

### Step 3.3: Update Text Artifact Content Component

**File**: `features/ai-assistant/artifacts/text/text-artifact-content.tsx`

**Changes**: Add editing functionality with debounce and version history

**Key Changes**:
- ✅ Import editable components
- ✅ Use debounce hook
- ✅ Use save hook
- ✅ Add version history header
- ✅ Replace static title/content with editable components
- ✅ Use refs to capture latest values (avoid closure stale values)
- ✅ Wait for SWR refetch before switching to new version
- ✅ Add race condition prevention with `justSavedRef` flag
- ✅ Enhanced logging for debugging

```typescript
'use client';

import { useArtifact } from '../hooks/use-artifact';
import { useDocument } from '../hooks/use-document';
import { useVersionHistoryDebounce } from '../version-history-debounce';
import { useVersionHistorySave } from '../version-history-save';
import { VersionHistoryHeader } from '../version-history-header';
import { EditableTitle } from './version-history-editable-title';
import { EditableContent } from './version-history-editable-content';
import { useEffect, useState } from 'react';

export function TextArtifactContent() {
  const { artifact, setArtifact } = useArtifact();
  const documentId = artifact.documentId !== 'init' ? artifact.documentId : null;

  // Fetch document from Supabase
  const { document: fetchedDocument } = useDocument(documentId);

  // Local state for editing (separate from artifact state)
  const [localTitle, setLocalTitle] = useState(
    fetchedDocument?.title || artifact.title || 'Untitled Document'
  );
  const [localContent, setLocalContent] = useState(
    artifact.status === 'streaming'
      ? artifact.content
      : (fetchedDocument?.content || artifact.content || '')
  );

  // Use refs to store latest values to avoid closure stale values
  const latestTitleRef = useRef(localTitle);
  const latestContentRef = useRef(localContent);


  // Keep refs in sync with state
  useEffect(() => {
    latestTitleRef.current = localTitle;
    latestContentRef.current = localContent;
  }, [localTitle, localContent]);

  // Sync with fetched document
  useEffect(() => {
    if (fetchedDocument) {
      setLocalTitle(fetchedDocument.title);
      setLocalContent(fetchedDocument.content || '');
    }
  }, [fetchedDocument]);

  // Save hook
  const { saveVersion, isSaving, error, lastSavedAt } = useVersionHistorySave(documentId);

  // Fetch documents with mutate function for manual refetch
  const { documents, document: latestDocument, mutate: mutateDocuments } = useDocument(documentId);

  // Debounce hook
  const { isDebouncing, countdown, triggerDebounce } = useVersionHistoryDebounce({
    delay: 5000,
    onDebounceComplete: async () => {
      if (documentId) {
        try {
          // Use refs to get the absolute latest values (avoid closure stale values)
          const titleToSave = latestTitleRef.current;
          const contentToSave = latestContentRef.current;


          logger.debug('[Text Artifact] Saving with values', {
            titleLength: titleToSave.length,
            contentLength: contentToSave.length,
            titlePreview: titleToSave.substring(0, 30),
            contentPreview: contentToSave.substring(0, 50),
          });


          await saveVersion({
            documentId,
            title: titleToSave,
            content: contentToSave,
            kind: 'text',
          });


          // Wait for SWR to refetch and update documents array
          await mutateDocuments(undefined, { revalidate: true });
          await new Promise(resolve => setTimeout(resolve, 300)); // Wait for refetch


          // Reset to latest version to show the newly saved version
          resetToLatest();
        } catch (err) {
          console.error('[Text Artifact] Error saving version:', err);
          // Error is already handled by save hook
        }
      }
    },
  });

  // Handle title change
  const handleTitleChange = (newTitle: string) => {
    setLocalTitle(newTitle);
    setArtifact((prev) => ({ ...prev, title: newTitle }));
    triggerDebounce(); // Start debounce timer
  };

  // Handle content change
  const handleContentChange = (newContent: string) => {
    setLocalContent(newContent);
    setArtifact((prev) => ({ ...prev, content: newContent }));
    triggerDebounce(); // Start debounce timer
  };

  // Don't allow editing during streaming
  const isStreaming = artifact.status === 'streaming';
  const canEdit = !isStreaming && documentId !== null;

  return (
    <div className="h-full overflow-auto p-6 text-black">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-2">
          {canEdit ? (
            <EditableTitle
              title={localTitle}
              onTitleChange={handleTitleChange}
              className="flex-1"
            />
          ) : (
            <h1 className="text-2xl font-bold">{localTitle}</h1>
          )}
        </div>

        {/* Version History Header */}
        {canEdit && (
          <VersionHistoryHeader
            documentId={documentId}
            isDebouncing={isDebouncing}
            countdown={countdown}
            isSaving={isSaving}
            lastSavedAt={lastSavedAt}
          />
        )}

        {isStreaming && (
          <div className="mt-2 text-sm text-muted-foreground">
            Generating...
          </div>
        )}

        {error && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-400">
            Error saving: {error.message}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="prose prose-sm max-w-none dark:prose-invert">
        {canEdit ? (
          <EditableContent
            content={localContent}
            onContentChange={handleContentChange}
          />
        ) : (
          <MarkdownText>{localContent}</MarkdownText>
        )}
      </div>
    </div>
  );
}
```

**Why**: Integrates all editing components with debounce and version history

---

## Phase 4: Testing & Validation

### Step 4.1: Test Editing Functionality

**Test Cases**:
- [ ] Title can be edited inline
- [ ] Content can be edited in textarea
- [ ] Preview mode works correctly
- [ ] Changes trigger debounce timer
- [ ] Countdown indicator shows correct time
- [ ] Save happens after 5 seconds of inactivity
- [ ] Multiple edits reset timer correctly

---

### Step 4.2: Test Version History

**Test Cases**:
- [ ] New version created on save (same ID, new createdAt)
- [ ] Version count updates correctly
- [ ] Version count displayed in header
- [ ] Multiple versions can be created
- [ ] SWR cache invalidates correctly

---

### Step 4.3: Test Error Handling

**Test Cases**:
- [ ] Error message shown if save fails
- [ ] Editing still works after error
- [ ] Network errors handled gracefully
- [ ] Invalid document ID handled

---

## Phase 5: Future Enhancements

### Step 5.1: Version Navigation (Future)

**Action**: Add UI for navigating between versions

**Components**:
- Version selector dropdown
- Previous/Next version buttons
- Version diff view

**Status**: 🔮 Future

---

### Step 5.2: Edit History (Future)

**Action**: Show edit history with timestamps

**Features**:
- List of all edits
- Timestamp for each edit
- Ability to revert to previous version

**Status**: 🔮 Future

---

## Implementation Checklist

### Phase 1: Reusable Hooks & Utilities
- [x] Step 1.1: Create `version-history-debounce.ts`
- [x] Step 1.2: Create `artifact-api-endpoint.ts` utility
- [x] Step 1.3: Create `version-history-save.ts`

### Phase 2: Header Component
- [ ] Step 2.1: Create `version-history-header.tsx`

### Phase 3: Text Artifact Editing
- [ ] Step 3.1: Create `version-history-editable-title.tsx`
- [ ] Step 3.2: Create `version-history-editable-content.tsx`
- [ ] Step 3.3: Update `text-artifact-content.tsx`

### Phase 4: Testing
- [ ] Step 4.1: Test editing functionality
- [ ] Step 4.2: Test version history
- [ ] Step 4.3: Test error handling

---

## File Structure

```
features/ai-assistant/artifacts/
├── utils/
│   └── artifact-api-endpoint.ts         # API endpoint utility (NEW)
├── hooks/
│   ├── version-history-debounce.ts      # Reusable debounce hook
│   ├── version-history-save.ts          # Reusable save hook
│   ├── version-history-keep.ts          # Keep version hook
│   ├── version-history-navigation.ts    # Version navigation hook
│   └── use-document.ts                  # Document fetching hook
├── components/
│   ├── version-history-header.tsx        # Header with version count
│   └── version-history-management-buttons.tsx  # Undo/redo/keep buttons
└── text/
    ├── components/
    │   ├── version-history-editable-content.tsx  # Editable content component
    │   └── text-artifact-content.tsx     # Updated with editing
    └── tool/
        └── create-document-tool.ts       # AI tool for creating documents
```

---

## Key Design Decisions

1. **Reusability**: All version history logic is in reusable hooks/components
   - Can be used for code artifacts, sheet artifacts, etc.
   - Text-specific components are in `artifacts/text/` folder

2. **Debounce Strategy**: 5-second delay after last edit
   - Prevents excessive saves during typing
   - Countdown indicator provides user feedback
   - Timer resets on each edit

3. **Version History**: Same ID, different createdAt
   - Enables version tracking
   - Composite primary key supports multiple versions
   - Version count shown in header

4. **State Management**:
   - Local state for editing (immediate UI updates)
   - Artifact state synced on change
   - SWR for fetching and cache invalidation

5. **Error Handling**:
   - Errors shown to user
   - Editing continues to work after error
   - Network errors handled gracefully

6. **Flexible API Endpoints**:
   - Centralized endpoint mapping in `artifact-api-endpoint.ts`
   - Easy to add new artifact types with different endpoints
   - All hooks automatically use correct endpoint based on artifact kind
   - Backward compatible (defaults to '/api/document')

---

## Dependencies

### Required:
- ✅ `swr` (already installed)
- ✅ `@supabase/supabase-js` (already installed)
- ✅ `lucide-react` (for icons - already installed)
- ✅ `@/components/ui/*` (shadcn components - already installed)

### No new dependencies needed! ✅

---

## Success Criteria

✅ **Minimum Viable Product:**
- Users can edit title and content
- Changes auto-save after 5 seconds
- Countdown indicator shows remaining time
- Version count displayed in header
- New versions created on save

✅ **Enhanced Version:**
- Preview mode for content
- Version navigation
- Edit history
- Conflict resolution

---

**Status**: 📋 Plan Ready
**Next**: Start with Phase 1 (Reusable Hooks)

## Extras:

### Can't Write Issue — Fixed
**Problem**: The useEffect was overwriting user edits by syncing with activeDocument on every render.

**Solution**:
- Added a useRef to track when the user is editing
- Only sync with activeDocument when the document ID or createdAt changes (version navigation), not on every render
- Set the editing flag when the user types, preventing the effect from overwriting edits

### 1. Only Latest Version Can Be Edited
- Updated canEdit logic: `canEdit = !isStreaming && documentId !== null && isAtLatest`
- Editing is only enabled when at the latest version
- Old versions show read-only markdown

### 2. Edit Mode Disables Undo/Redo
- Added `isInEditMode` state to track when user is in edit mode (not preview)
- Updated VersionHistoryManagementButtons to disable undo/redo when isInEditMode is true:
  - `canUndo={canUndo && !isInEditMode}`
  - `canRedo={canRedo && !isInEditMode}`

### 3. Preview Mode Re-enables Undo/Redo
- Added `onPreviewModeChange` callback to EditableContent component
- When user switches to preview mode (isPreview = true), isInEditMode becomes false
- When user switches back to edit mode (isPreview = false), isInEditMode becomes true

### 4. Auto-Reset on Version Navigation
- Added useEffect to reset isInEditMode to false when navigating to an old version
- Ensures undo/redo are enabled when viewing old versions (read-only mode)

### 5. Incomplete Text Save Issue — Fixed ✅
**Problem**: When saving, the debounce callback was capturing stale closure values instead of the latest user input. For example, typing "1 and 2" would only save "1 and" because the closure captured an older value.

**Solution**:
- Added refs (`latestTitleRef` and `latestContentRef`) to store the absolute latest values
- Keep refs in sync with state using useEffect
- In the debounce callback, use `latestTitleRef.current` and `latestContentRef.current` instead of `localTitle` and `localContent`
- This ensures we always capture the most recent user input, not stale closure values

**Implementation**:
```typescript
// Use refs to store latest values to avoid closure stale values
const latestTitleRef = useRef(localTitle);
const latestContentRef = useRef(localContent);

// Keep refs in sync with state
useEffect(() => {
  latestTitleRef.current = localTitle;
  latestContentRef.current = localContent;
}, [localTitle, localContent]);

// In debounce callback:
const titleToSave = latestTitleRef.current; // Always latest value
const contentToSave = latestContentRef.current; // Always latest value
```

### 6. Not Switching to New Version After Save — Fixed ✅
**Problem**: After saving a new version, the UI would stay at the old version (e.g., 2/3) instead of automatically switching to the new version (3/3). The version count would update correctly, but the user would still be viewing the old version.

**Solution**:
- Wait for SWR to refetch after save completes
- Manually trigger a refetch with `mutateDocuments(undefined, { revalidate: true })`
- Wait 300ms for the refetch to complete and documents array to update
- Then call `resetToLatest()` to explicitly switch to the new version
- The navigation hook's useEffect will also handle this when `totalVersions` changes, but we explicitly call it to ensure immediate switch

**Implementation**:
```typescript
await saveVersion({ ... });

// Wait for SWR to refetch and update documents array
await mutateDocuments(undefined, { revalidate: true });
await new Promise(resolve => setTimeout(resolve, 300)); // Wait for refetch

// Now reset to latest version
resetToLatest();
```

**Additional Changes**:
- Updated `version-history-save.ts` to use `revalidate: true` for immediate refetch:
  ```typescript
  await mutateDocument(undefined, { revalidate: true });
  ```
- Added enhanced logging to track the save process and verify values being saved
- Added logging in save hook to track saved document details (title length, content length)

### 7. Race Condition Prevention — Enhanced ✅
**Problem**: After saving, there was a race condition where the sync useEffect would overwrite the newly saved content with stale cached data before the new version was available.

**Solution**:
- Use `justSavedRef` flag to prevent syncing immediately after save
- Clear the flag after 2 seconds to allow new version to be fetched and synced
- The flag prevents the sync useEffect from overwriting local state with stale data

**Implementation**:
```typescript
// Mark that we're saving to prevent sync race condition
justSavedRef.current = true;

await saveVersion({ ... });
await mutateDocuments(undefined, { revalidate: true });
await new Promise(resolve => setTimeout(resolve, 300));
resetToLatest();

// Clear the flag after a delay to allow new version to be fetched and synced
setTimeout(() => {
  justSavedRef.current = false;
}, 2000);
```

### 8. Enhanced Logging — Added ✅
- Added logging in `text-artifact-content.tsx` to track values being saved (title length, content length, previews)
- Added logging in `version-history-save.ts` to track saved document details
- Helps debug issues with incomplete saves or version switching

### 9. Flexible API Endpoints for Multiple Artifact Types — Added ✅
**Problem**: Both `version-history-save.ts` and `version-history-keep.ts` were using hardcoded `/api/document` endpoints, making it difficult to support different artifact types (code, sheet, image, etc.) with different API endpoints in the future.

**Solution**:
- Created a centralized utility `artifact-api-endpoint.ts` that maps artifact kinds to API endpoints
- Provides `getArtifactApiEndpoint(kind)` function to get the endpoint for a specific artifact type
- Provides `buildArtifactApiUrl(kind, params)` helper to build URLs with query parameters
- Updated both hooks to use the utility instead of hardcoded endpoints
- Made `kind` parameter optional in hooks (defaults to 'text' for backward compatibility)

**Implementation**:
```typescript
// features/ai-assistant/artifacts/utils/artifact-api-endpoint.ts
const ARTIFACT_API_ENDPOINTS: Record<DocumentKind, string> = {
  text: '/api/document',
  code: '/api/document', // Currently uses same endpoint, can be changed later
  sheet: '/api/document', // Currently uses same endpoint, can be changed later
};

export function getArtifactApiEndpoint(kind: DocumentKind): string {
  return ARTIFACT_API_ENDPOINTS[kind] || '/api/document';
}

export function buildArtifactApiUrl(
  kind: DocumentKind,
  params: Record<string, string | null | undefined>
): string {
  const baseUrl = getArtifactApiEndpoint(kind);
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      queryParams.append(key, value);
    }
  });
  const queryString = queryParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
```

**Updated Files**:
1. **`version-history-save.ts`**:

   - Uses `buildArtifactApiUrl(kind, { id })` instead of hardcoded `/api/document?id=${id}`
   - Automatically uses correct endpoint based on artifact kind

2. **`version-history-keep.ts`**:
   - Added optional `kind` parameter (defaults to 'text')
   - Uses `buildArtifactApiUrl(kind, { id, timestamp })` instead of hardcoded endpoint

3. **`version-history-management-buttons.tsx`**:
   - Added optional `kind` prop
   - Passes `kind` to `useVersionHistoryKeep` hook

4. **`text-artifact-content.tsx`**:
   - Passes `artifact.kind` to `VersionHistoryManagementButtons`

**Future Extensibility**:
When adding new artifact types (e.g., `'image'`), simply update the mapping:
```typescript
const ARTIFACT_API_ENDPOINTS: Record<DocumentKind, string> = {
  text: '/api/document',
  code: '/api/document',
  sheet: '/api/document',
  image: '/api/image-artifact', // New endpoint
};
```

All hooks and components will automatically use the correct endpoint without any code changes elsewhere.