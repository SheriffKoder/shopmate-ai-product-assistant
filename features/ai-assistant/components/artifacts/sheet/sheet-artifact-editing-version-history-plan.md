# Sheet Artifact Editing & Version History Implementation Plan

## Overview

This plan outlines the implementation of editing functionality for sheet artifacts with automatic version history. Users can edit individual table cells, with changes automatically saved as new versions after a 5-second debounce period. The implementation follows the same pattern as text artifacts but adapted for CSV/table data.

**Key Features**:
- ✅ Edit individual table cells inline (Excel-like)
- ✅ Edit title (reuse existing editable title component)
- ✅ Debounced auto-save (5 seconds after last edit)
- ✅ Countdown indicator during debounce period
- ✅ Version count display in artifact header
- ✅ Version history support (same ID, different createdAt)
- ✅ CSV format preservation
- ✅ Reuses existing version history infrastructure

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│       Sheet Artifact Editing & Version History Flow         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  EDITING PHASE:                                            │
│  1. User clicks cell → enters edit mode                    │
│     ↓                                                       │
│  2. User types in cell → updates local CSV state           │
│     ↓                                                       │
│  3. version-history-debounce hook detects changes          │
│     ↓                                                       │
│  4. Countdown timer starts (5 seconds)                     │
│     ↓                                                       │
│  5. Countdown indicator shows remaining time                │
│     ↓                                                       │
│  6. User continues editing → timer resets                  │
│     ↓                                                       │
│  7. 5 seconds pass without edits                           │
│     ↓                                                       │
│  8. version-history-save hook triggers save                │
│     ↓                                                       │
│  9. POST /api/document?id={documentId} creates new version │
│     ↓                                                       │
│  10. SWR cache invalidated → version count updated          │
│     ↓                                                       │
│  11. Countdown indicator hides, "Saved" indicator shows     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Components**:
- `version-history-debounce.ts` - ✅ Already exists (reusable)
- `version-history-save.ts` - ✅ Already exists (reusable)
- `version-history-header.tsx` - ✅ Already exists (reusable)
- `editable-table.tsx` - NEW: Editable table component with cell editing
- `sheet-artifact-content.tsx` - Updated with editing support

---

## Phase 1: Editable Table Component

### Step 1.1: Create Editable Table Component

**File**: `features/ai-assistant/artifacts/sheet/components/editable-table.tsx`

**Purpose**: Editable table component that allows inline cell editing

**Features**:
- ✅ Inline cell editing (click to edit, Enter to save, Escape to cancel)
- ✅ CSV parsing and serialization
- ✅ Cell-by-cell updates
- ✅ Triggers debounce on cell change
- ✅ Maintains table structure (headers, rows, columns)
- ✅ Handles empty cells
- ✅ Keyboard navigation (Tab, Enter, Arrow keys)

**Implementation**:

```typescript
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { parse, unparse } from 'papaparse';
import { cn } from '@/shared/lib/utils';

interface EditableTableProps {
  /** CSV string to render */
  csvContent: string;
  /** Callback when CSV content changes (triggers debounce) */
  onContentChange: (newCsv: string) => void;
  /** Additional CSS classes */
  className?: string;
  /** If true, table is read-only */
  isReadonly?: boolean;
}

/**
 * Editable Table Component
 *

 * Renders CSV data as an editable HTML table.
 * Allows inline cell editing with automatic CSV serialization.
 *

 * Features:
 * - Click cell to edit
 * - Enter to save, Escape to cancel
 * - Tab to move to next cell
 * - Arrow keys for navigation
 * - Auto-saves changes via onContentChange callback
 */
export function EditableTable({
  csvContent,
  onContentChange,
  className,
  isReadonly = false,
}: EditableTableProps) {
  // Parse CSV into 2D array (rows and columns)
  const [tableData, setTableData] = useState<string[][]>(() => {
    if (!csvContent || !csvContent.trim()) {
      return [['Column 1', 'Column 2', 'Column 3', 'Column 4']]; // Placeholder headers
    }


    try {
      const result = parse<string[]>(csvContent, {
        skipEmptyLines: false,
        header: false,
      });
      return result.data || [];
    } catch (error) {
      console.error('[EditableTable] Error parsing CSV:', error);
      return [];
    }
  });

  // Track which cell is being edited
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync tableData with csvContent prop (when navigating versions)
  useEffect(() => {
    if (!csvContent || !csvContent.trim()) {
      return;
    }

    try {
      const result = parse<string[]>(csvContent, {
        skipEmptyLines: false,
        header: false,
      });
      const newData = result.data || [];


      // Only update if data actually changed (avoid overwriting user edits)
      const currentCsv = unparse(tableData);
      if (currentCsv !== csvContent) {
        setTableData(newData);
      }
    } catch (error) {
      console.error('[EditableTable] Error syncing CSV:', error);
    }
  }, [csvContent]);

  // Serialize tableData to CSV and trigger onChange
  const serializeAndNotify = useCallback((newData: string[][]) => {
    try {
      const csv = unparse(newData);
      onContentChange(csv);
    } catch (error) {
      console.error('[EditableTable] Error serializing CSV:', error);
    }
  }, [onContentChange]);

  // Start editing a cell
  const startEditing = useCallback((row: number, col: number) => {
    if (isReadonly) return;


    setEditingCell({ row, col });
    setEditValue(tableData[row]?.[col] || '');
  }, [tableData, isReadonly]);

  // Save cell edit
  const saveCell = useCallback(() => {
    if (!editingCell) return;

    const { row, col } = editingCell;
    const newData = [...tableData];


    // Ensure row exists
    if (!newData[row]) {
      newData[row] = [];
    }


    // Ensure column exists (pad with empty strings if needed)
    const maxCols = Math.max(
      ...newData.map(r => r.length),
      col + 1
    );


    // Pad all rows to maxCols
    newData.forEach((r, idx) => {
      while (r.length < maxCols) {
        r.push('');
      }
    });


    // Update cell value
    newData[row][col] = editValue;


    setTableData(newData);
    setEditingCell(null);
    serializeAndNotify(newData);
  }, [editingCell, editValue, tableData, serializeAndNotify]);

  // Cancel cell edit
  const cancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!editingCell) return;

    const { row, col } = editingCell;
    const maxRows = tableData.length;
    const maxCols = Math.max(...tableData.map(r => r.length));

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        saveCell();
        // Move to cell below (or next row if at end)
        if (row + 1 < maxRows) {
          setTimeout(() => startEditing(row + 1, col), 0);
        }
        break;


      case 'Escape':
        e.preventDefault();
        cancelEdit();
        break;


      case 'Tab':
        e.preventDefault();
        saveCell();
        // Move to next cell (or next row if at end of row)
        if (col + 1 < maxCols) {
          setTimeout(() => startEditing(row, col + 1), 0);
        } else if (row + 1 < maxRows) {
          setTimeout(() => startEditing(row + 1, 0), 0);
        }
        break;


      case 'ArrowUp':
        e.preventDefault();
        saveCell();
        if (row > 0) {
          setTimeout(() => startEditing(row - 1, col), 0);
        }
        break;


      case 'ArrowDown':
        e.preventDefault();
        saveCell();
        if (row + 1 < maxRows) {
          setTimeout(() => startEditing(row + 1, col), 0);
        }
        break;


      case 'ArrowLeft':
        e.preventDefault();
        if (inputRef.current?.selectionStart === 0 && col > 0) {
          saveCell();
          setTimeout(() => startEditing(row, col - 1), 0);
        }
        break;


      case 'ArrowRight':
        e.preventDefault();
        const input = inputRef.current;
        if (input && input.selectionStart === input.value.length && col + 1 < maxCols) {
          saveCell();
          setTimeout(() => startEditing(row, col + 1), 0);
        }
        break;
    }
  }, [editingCell, tableData, saveCell, cancelEdit, startEditing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  // Determine max columns for consistent table structure
  const maxColumns = Math.max(
    ...tableData.map(row => row.length),
    1 // Minimum 1 column
  );

  // Header row (first row)
  const headerRow = tableData[0] || [];
  const dataRows = tableData.slice(1);

  return (
    <div className={cn('w-full overflow-auto', className)}>
      <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        {/* Header Row */}
        {headerRow.length > 0 && (
          <thead>
            <tr>
              {Array.from({ length: maxColumns }, (_, index) => (
                <th
                  key={index}
                  className="border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-left font-semibold text-sm sticky top-0 z-10"
                >
                  {headerRow[index] || `Column ${index + 1}`}
                </th>
              ))}
            </tr>
          </thead>
        )}

        {/* Data Rows */}
        <tbody>
          {dataRows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: maxColumns }, (_, colIndex) => {
                const cellValue = row[colIndex] || '';
                const isEditing = editingCell?.row === rowIndex + 1 && editingCell?.col === colIndex;

                return (
                  <td
                    key={colIndex}
                    className={cn(
                      'border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm relative',
                      {
                        'bg-blue-50 dark:bg-blue-900/20': isEditing,
                        'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50': !isReadonly && !isEditing,
                      }
                    )}
                    onClick={() => !isReadonly && startEditing(rowIndex + 1, colIndex)}
                  >
                    {isEditing ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveCell}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent border-none outline-none text-sm"
                        autoFocus
                      />
                    ) : (
                      <span className="block min-h-[1.5rem]">
                        {cellValue || <span className="text-muted-foreground opacity-50">—</span>}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Why**: Provides Excel-like inline cell editing with CSV serialization

---

### Step 1.2: Update Table Component Export

**File**: `features/ai-assistant/artifacts/sheet/components/index.ts`

**Changes**: Export EditableTable component

```typescript
export { Table } from './table';
export { EditableTable } from './editable-table';
export { SheetArtifactContent } from './sheet-artifact-content';
```

---

## Phase 2: Sheet Artifact Content with Editing

### Step 2.1: Update Sheet Artifact Content Component

**File**: `features/ai-assistant/artifacts/sheet/components/sheet-artifact-content.tsx`

**Changes**: Add editing functionality with debounce and version history

**Key Changes**:
- ✅ Import editable components (EditableTable, EditableTitle from text artifacts)
- ✅ Use debounce hook (reuse existing)
- ✅ Use save hook (reuse existing)
- ✅ Add version history header (reuse existing)
- ✅ Replace static table with editable table
- ✅ Use refs to capture latest CSV values (avoid closure stale values)
- ✅ Wait for SWR refetch before switching to new version
- ✅ Add race condition prevention with `justSavedRef` flag

**Implementation**:

```typescript
'use client';

import { useArtifact } from '../../hooks/use-artifact';
import { useDocument } from '../../hooks/use-document';
import { useVersionHistoryDebounce } from '../../hooks/version-history-debounce';
import { useVersionHistorySave } from '../../hooks/version-history-save';
import { useVersionHistoryNavigation } from '../../hooks/version-history-navigation';
import { VersionHistoryHeader } from '../../components/version-history-header';
import { VersionHistoryManagementButtons } from '../../components/version-history-management-buttons';
import { EditableTable } from './editable-table';
import { EditableTitle } from '../../text/components/version-history-editable-title';
import { useEffect, useState, useRef } from 'react';
import { logger } from '@/features/ai-assistant/lib/logger';

/**
 * Sheet Artifact Content Component
 *

 * Displays the sheet artifact content with table editing support.
 *

 * Features:
 * - Editable title (via EditableTitle)
 * - Editable table cells (via EditableTable)
 * - Auto-save with 5-second debounce
 * - Version history tracking
 * - Streaming support (editing disabled during streaming)
 * - Smart content priority: streaming > fetched > artifact state
 *

 * Editing Flow:
 * 1. User edits cell or title
 * 2. Changes trigger debounce timer (5 seconds)
 * 3. Countdown indicator shows remaining time
 * 4. After 5 seconds of inactivity, save is triggered
 * 5. New version created in Supabase (same ID, new createdAt)
 * 6. Version count updates automatically
 */
export function SheetArtifactContent() {
  const { artifact, setArtifact } = useArtifact();
  const documentId = artifact.documentId !== 'init' ? artifact.documentId : null;

  // Fetch all document versions from Supabase
  const { documents, document: latestDocument, mutate: mutateDocuments } = useDocument(documentId);

  // Version navigation hook
  const {
    currentVersion,
    currentIndex,
    canUndo,
    canRedo,
    canNavigate,
    undo,
    redo,
    resetToLatest,
    totalVersions,
  } = useVersionHistoryNavigation({
    documents,
  });

  // Determine which document to use: currentVersion (if navigating) or latestDocument
  const activeDocument = currentVersion || latestDocument;

  // Local state for editing (separate from artifact state for immediate UI updates)
  const [localTitle, setLocalTitle] = useState(
    activeDocument?.title || artifact.title || 'Untitled Sheet'
  );
  const [localCsv, setLocalCsv] = useState(
    artifact.status === 'streaming'
      ? artifact.content
      : (activeDocument?.content || artifact.content || '')
  );

  // Use refs to store latest values to avoid closure stale values
  const latestTitleRef = useRef(localTitle);
  const latestCsvRef = useRef(localCsv);


  // Keep refs in sync with state
  useEffect(() => {
    latestTitleRef.current = localTitle;
    latestCsvRef.current = localCsv;
  }, [localTitle, localCsv]);

  // Track if we just saved to prevent sync race condition
  const justSavedRef = useRef(false);
  const isUserEditingRef = useRef(false);
  const lastSyncedDocumentIdRef = useRef<string | null>(null);
  const lastSyncedCreatedAtRef = useRef<string | null>(null);

  // Sync with active document (when navigating versions)
  useEffect(() => {
    if (justSavedRef.current) {
      return; // Don't sync immediately after save
    }

    if (
      activeDocument &&
      artifact.status !== 'streaming' &&
      !isUserEditingRef.current &&
      (lastSyncedDocumentIdRef.current !== documentId ||
       lastSyncedCreatedAtRef.current !== activeDocument.createdAt)
    ) {
      setLocalTitle(activeDocument.title);
      setLocalCsv(activeDocument.content || '');
      lastSyncedDocumentIdRef.current = documentId || null;
      lastSyncedCreatedAtRef.current = activeDocument.createdAt || null;
    }
  }, [activeDocument, artifact.status, documentId]);

  // Save hook
  const { saveVersion, isSaving, error, lastSavedAt } = useVersionHistorySave(documentId);

  // Debounce hook - triggers save after 5 seconds of inactivity
  const { isDebouncing, countdown, triggerDebounce } = useVersionHistoryDebounce({
    delay: 5000,
    onDebounceComplete: async () => {
      if (documentId) {
        try {
          // Use refs to get the absolute latest values (avoid closure stale values)
          const titleToSave = latestTitleRef.current;
          const csvToSave = latestCsvRef.current;


          logger.debug('[Sheet Artifact] Saving with values', {
            titleLength: titleToSave.length,
            csvLength: csvToSave.length,
            title: titleToSave,
            csvPreview: csvToSave.substring(0, 100),
          });


          // Mark that we're saving to prevent sync race condition
          justSavedRef.current = true;


          await saveVersion({
            documentId,
            title: titleToSave,
            content: csvToSave,
            kind: 'sheet',
          });


          // Wait for SWR to refetch and update documents array
          await mutateDocuments(undefined, { revalidate: true });
          await new Promise(resolve => setTimeout(resolve, 300)); // Wait for refetch


          // Reset to latest version
          resetToLatest();


          // Clear the flag after a delay
          setTimeout(() => {
            justSavedRef.current = false;
          }, 2000);
        } catch (err) {
          logger.error('[Sheet Artifact] Error saving version:', err);
        }
      }
    },
  });

  // Handle title change
  const handleTitleChange = (newTitle: string) => {
    isUserEditingRef.current = true;
    setLocalTitle(newTitle);
    setArtifact((prev) => ({ ...prev, title: newTitle }));
    triggerDebounce();


    setTimeout(() => {
      isUserEditingRef.current = false;
    }, 500);
  };

  // Handle CSV content change (from cell edits)
  const handleCsvChange = (newCsv: string) => {
    isUserEditingRef.current = true;
    setLocalCsv(newCsv);
    setArtifact((prev) => ({ ...prev, content: newCsv }));
    triggerDebounce();


    setTimeout(() => {
      isUserEditingRef.current = false;
    }, 500);
  };

  // Don't allow editing during streaming
  const isStreaming = artifact.status === 'streaming';
  const isAtLatest = currentIndex === null || currentIndex === totalVersions - 1;
  const canEdit = !isStreaming && documentId !== null && isAtLatest;

  return (
    <div className="h-full flex flex-col text-black">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background border-b p-6 pb-4">
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

        {/* Version Management Buttons */}
        {canNavigate && documents && documents.length > 0 && (
          <VersionHistoryManagementButtons
            documentId={documentId}
            currentVersionTimestamp={activeDocument?.createdAt || null}
            canUndo={canUndo}
            canRedo={canRedo}
            canNavigate={canNavigate}
            isAtLatest={isAtLatest}
            onUndo={undo}
            onRedo={redo}
            kind="sheet"
          />
        )}

        {isStreaming && (
          <div className="text-sm text-muted-foreground mt-2">
            Generating...
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 mt-2">
            Error saving: {error.message}
          </div>
        )}
      </div>

      {/* Table Content - Scrollable */}
      <div className="flex-1 overflow-auto p-6">
        {canEdit ? (
          <EditableTable
            csvContent={localCsv}
            onContentChange={handleCsvChange}
            isReadonly={false}
          />
        ) : (
          <Table csvContent={localCsv} isPreview={false} isStreaming={isStreaming} />
        )}
      </div>
    </div>
  );
}
```

**Why**: Integrates all editing components with debounce and version history for sheet artifacts

---

## Phase 3: Testing & Validation

### Step 3.1: Test Cell Editing

**Test Cases**:
- [ ] Click cell to enter edit mode
- [ ] Type in cell updates value
- [ ] Enter key saves and moves to cell below
- [ ] Escape key cancels edit
- [ ] Tab key saves and moves to next cell
- [ ] Arrow keys navigate between cells
- [ ] Changes trigger debounce timer
- [ ] Countdown indicator shows correct time
- [ ] Save happens after 5 seconds of inactivity
- [ ] Multiple cell edits reset timer correctly

---

### Step 3.2: Test CSV Serialization

**Test Cases**:
- [ ] Cell edits correctly serialize to CSV
- [ ] CSV with quotes handled correctly
- [ ] CSV with commas in cells handled correctly
- [ ] Empty cells preserved in CSV
- [ ] New rows can be added (future enhancement)
- [ ] New columns can be added (future enhancement)

---

### Step 3.3: Test Version History

**Test Cases**:
- [ ] New version created on save (same ID, new createdAt)
- [ ] Version count updates correctly
- [ ] Version count displayed in header
- [ ] Multiple versions can be created
- [ ] SWR cache invalidates correctly
- [ ] Version navigation works (undo/redo)
- [ ] Only latest version can be edited
- [ ] Old versions show read-only table

---

### Step 3.4: Test Error Handling

**Test Cases**:
- [ ] Error message shown if save fails
- [ ] Editing still works after error
- [ ] Network errors handled gracefully
- [ ] Invalid CSV handled gracefully
- [ ] Invalid document ID handled

---

## Implementation Checklist

### Phase 1: Editable Table Component
- [ ] Step 1.1: Create `editable-table.tsx` with cell editing
- [ ] Step 1.2: Update `index.ts` to export EditableTable

### Phase 2: Sheet Artifact Content
- [ ] Step 2.1: Update `sheet-artifact-content.tsx` with editing support

### Phase 3: Testing
- [ ] Step 3.1: Test cell editing
- [ ] Step 3.2: Test CSV serialization
- [ ] Step 3.3: Test version history
- [ ] Step 3.4: Test error handling

---

## File Structure

```
features/ai-assistant/artifacts/
├── hooks/
│   ├── version-history-debounce.ts      # ✅ Reuse (already exists)
│   ├── version-history-save.ts          # ✅ Reuse (already exists)
│   ├── version-history-navigation.ts    # ✅ Reuse (already exists)
│   └── use-document.ts                  # ✅ Reuse (already exists)
├── components/
│   ├── version-history-header.tsx        # ✅ Reuse (already exists)
│   └── version-history-management-buttons.tsx  # ✅ Reuse (already exists)
├── text/
│   └── components/
│       └── version-history-editable-title.tsx  # ✅ Reuse (already exists)
└── sheet/
    └── components/
        ├── table.tsx                     # ✅ Already exists (read-only)
        ├── editable-table.tsx            # NEW: Editable table with cell editing
        └── sheet-artifact-content.tsx    # UPDATE: Add editing support
```

---

## Key Design Decisions

1. **Reuse Existing Infrastructure**:

   - All version history hooks are reusable
   - EditableTitle component can be reused
   - Only need to create EditableTable component

2. **CSV Format**:

   - Sheets stored as CSV strings in database
   - EditableTable handles CSV ↔ 2D array conversion
   - papaparse for robust parsing/serialization

3. **Cell Editing UX**:
   - Click to edit (Excel-like)
   - Enter to save and move down
   - Tab to save and move right
   - Escape to cancel
   - Arrow keys for navigation

4. **Debounce Strategy**:

   - Same 5-second delay as text artifacts
   - Triggers on any cell change
   - Timer resets on each edit

5. **Version History**:

   - Same pattern as text artifacts
   - Same ID, different createdAt
   - Only latest version editable

6. **State Management**:
   - Local state for editing (immediate UI updates)
   - Artifact state synced on change
   - SWR for fetching and cache invalidation
   - Refs to avoid closure stale values

---

## Dependencies

### Required:
- ✅ `papaparse` (already installed) - for CSV parsing/serialization
- ✅ `swr` (already installed)
- ✅ `@supabase/supabase-js` (already installed)
- ✅ `lucide-react` (for icons - already installed)
- ✅ `@/components/ui/*` (shadcn components - already installed)

### No new dependencies needed! ✅

---

## Future Enhancements

### Step 4.1: Add/Delete Rows and Columns (Future)

**Action**: Allow users to add/delete rows and columns

**Features**:
- Add row button
- Delete row button
- Add column button
- Delete column button
- Context menu for row/column operations

**Status**: 🔮 Future

---

### Step 4.2: Copy/Paste Support (Future)

**Action**: Support copying and pasting cells (Excel-like)

**Features**:
- Copy cell (Ctrl+C)
- Paste cell (Ctrl+V)
- Copy range of cells
- Paste range of cells

**Status**: 🔮 Future

---

### Step 4.3: Cell Formatting (Future)

**Action**: Add cell formatting options

**Features**:
- Number formatting
- Date formatting
- Text alignment
- Cell background color
- Text color

**Status**: 🔮 Future

---

## Success Criteria

✅ **Minimum Viable Product:**
- Users can edit individual table cells
- Users can edit title
- Changes auto-save after 5 seconds
- Countdown indicator shows remaining time
- Version count displayed in header
- New versions created on save
- Only latest version editable
- Version navigation works (undo/redo)

✅ **Enhanced Version:**
- Add/delete rows and columns
- Copy/paste support
- Cell formatting
- Formula support (future)

---

**Status**: 📋 Plan Ready
**Next**: Start with Phase 1 (Editable Table Component)



## Extras

## The debounce timer resets on every keystroke, and navigation/blur actions no longer trigger additional debounce calls.
in editable-table.tsx
Added handleInputChange() function — Updates the cell value on every keystroke and triggers debounce via serializeAndNotify()
Modified saveCell() function — Added shouldNotify parameter (default true):
When true: Saves cell and triggers debounce
When false: Saves cell but does not trigger debounce
Updated navigation handlers — All navigation keys call saveCell(false):
Enter → saveCell(false)
Tab → saveCell(false)
Arrow keys → saveCell(false)
Updated blur handler — Changed from onBlur={saveCell} to onBlur={() => saveCell(false)}
Updated input onChange — Changed from onChange={(e) => setEditValue(e.target.value)} to onChange={handleInputChange}

## Copy
TSV format for sheets: For sheet artifacts, the content is converted to TSV (tab-separated values) instead of CSV. Excel recognizes tabs as column separators when pasting, so columns are preserved.

## Fixes

// Reverting to version 1/1 caused an infinite loop:
tableData was in the dependency array (line 89)
When setTableData was called, it triggered the effect again
unparse(tableData) might produce CSV slightly different from csvContent (whitespace/formatting)
The comparison currentCsv !== csvContent would fail, causing the loop
The Fix:
Removed tableData from dependencies — only depend on csvContent
Added lastSyncedCsvRef to track the last synced CSV content
Only sync when csvContent actually changes from outside (version navigation), not from our own updates
Update the ref in serializeAndNotify so we don't trigger sync when our own CSV comes back as a prop
This prevents the infinite loop when navigating to version 1/1. The effect only runs when the csvContent prop changes from outside (e.g., version navigation), not when we update tableData internally.