# Sheet Artifact Implementation Plan

## Overview

This plan outlines the implementation of sheet artifacts in ShopMate, allowing the AI to create and stream live spreadsheet/table documents that users can view in real-time. **This implementation follows the same pattern as text artifacts but uses CSV data format and table rendering.**

**Key Features**:
- ✅ Display tables/spreadsheets
- ✅ Preview component with overflow scroll (same table, scrollable)
- ✅ Panel displays title and left side message list (like text artifacts)
- ⏳ Version history (future - not in this phase)
- ✅ Real-time streaming via DataStream pattern
- ✅ Database persistence via Supabase
- ✅ SWR-based fetching for client-side data management

**Related Documentation**:

- See `text-artifact-implementation-plan.md` for the foundational pattern
- See `artifact-database-swr-supabase-implementation.md` for database integration details

---

## UI Architecture

The sheet artifact follows the **same UI architecture as text artifacts**:

### 1. Message List Preview/Button (Conditional Rendering)
- **Location**: Inside message list, shown when artifacts are created/updated
- **Component**: `DocumentPreview` - Conditionally renders based on `artifact.isVisible`
  - **When panel CLOSED** (`artifact.isVisible === false`):
    - Shows **preview card** with:
      - Document header (icon, title, expand icon)
      - **Table preview** (overflow scroll, ~257px height) - **Same table as panel, just scrollable**
  - **When panel OPEN** (`artifact.isVisible === true`):
    - Shows **small button**: `DocumentToolCall` or `DocumentToolResult`
- **Purpose**: Preview card shows table preview, button shows compact view when panel is open

### 2. Split-Screen Artifact Panel (Full Screen)
- **Location**: Full-screen overlay when artifact is visible
- **Layout**: Split 50/50
  - **Left Side**: Chat messages (`ArtifactMessages` component)
  - **Right Side**: Sheet artifact content (`SheetArtifactContent` component)
- **Component**: `ArtifactPanel` - Container for split-screen layout

### 3. Sheet Artifact Content (Right Side)
- **Location**: Right side of split-screen panel
- **Components**:
  - `SheetArtifactContent` - Renders table from CSV data
  - `ArtifactCloseButton` - Closes the artifact panel
- **Purpose**: Displays the actual table/spreadsheet content

### Flow:
```
1. AI calls createDocument tool with kind='sheet'
   ↓
2. Tool generates document ID and streams metadata to UI
   ↓
3. DocumentPreview appears in message list:
   - If panel CLOSED: Shows preview card with table (overflow scroll)
   - If panel OPEN: Shows "Creating..." button
   ↓
4. CSV content streams to artifact state (updates preview card in real-time)
   - DataStreamHandler processes data-sheetDelta events
   - Artifact state updates in real-time
   ↓
5. After streaming completes:
   - Server saves complete CSV content to Supabase
   - Document persisted with same ID as streamed to UI
   ↓
6. User clicks preview card OR content reaches threshold
   ↓
7. ArtifactPanel opens (split-screen)
   ↓
8. Left: Chat messages, Right: Sheet content
   - Component fetches document from Supabase via SWR (if available)
   - Falls back to artifact.content if fetch fails or during streaming
   ↓
9. DocumentPreview switches to button mode (compact view)
   ↓
10. User can close artifact panel (preview card reappears)
```

---

## Current State

✅ **Already Implemented (from text artifacts):**
- DataStream pattern (DataStreamProvider, DataStreamHandler)
- Custom data types infrastructure
- SWR setup
- API routes structure
- Supabase integration (database client, types, API routes)
- Document persistence (saves to Supabase after streaming)
- SWR document fetching (`useDocument` hook)
- Artifact state management (useArtifact hook with SWR)
- Artifact creation tool (with ID synchronization)
- Artifact UI components (DocumentPreview, ArtifactPanel, etc.)
- DataStreamHandler artifact processing
- Document fetching via SWR

✅ **Completed for Text Artifacts:**
- Artifact data types in stream
- Artifact creation tool (supports `kind: 'sheet'`)
- Artifact UI components (reusable for all artifact types)
- Document fetching via SWR

**Note**: The infrastructure is already in place! We just need to add sheet-specific components and handlers.

---

## Phase 1: Foundation (Data Types & Stream Processing)

### Step 1.1: Add Sheet Delta Type to Stream

**File**: `features/ai-assistant/types/stream.ts`

**Changes**: Add `sheetDelta` type for streaming CSV data

```typescript
export type ShopMateUIDataTypes = {
  // ... existing types ...


  // Artifact types
  textDelta: string;              // Text content chunks
  sheetDelta: string;              // CSV content chunks (NEW)
  artifactId: string;              // Artifact document ID
  artifactTitle: string;           // Artifact title
  artifactKind: 'text' | 'code' | 'sheet'; // Artifact type
  artifactStatus: 'idle' | 'streaming' | 'complete'; // Artifact status
  artifactClear: null;             // Clear artifact signal
};
```

**Why**: Defines the data structure for sheet artifact streaming

**Status**: ⏳ To Do

---

### Step 1.2: Update DataStreamHandler for Sheet Deltas

**File**: `features/ai-assistant/data-stream/data-stream-handler.tsx`

**Changes**: Add processing for `data-sheetDelta` events

```typescript
case "data-sheetDelta":
  setArtifact(prev => ({

    ...prev,

    content: prev.content + delta.data, // CSV content accumulates
    status: "streaming",
  }));
  break;
```

**Why**: Processes sheet CSV data from stream and updates artifact state

**Status**: ⏳ To Do

---

## Phase 2: Server-Side (Tool & Handler)

### Step 2.1: Create Sheet Artifact Handler

**File**: `features/ai-assistant/artifacts/sheet/server.ts`

**Purpose**: Generates CSV table content, streams it to the artifact, and saves to Supabase

**Key Features**:
- ✅ Uses `streamObject` to generate structured CSV data
- ✅ Streams content in real-time via `data-sheetDelta`
- ✅ Saves complete CSV content to Supabase after streaming
- ✅ Uses `documentId` parameter for persistence
- ✅ Non-blocking: If save fails, user still sees content (from streaming)

**Implementation**:

```typescript
import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod/v3';
import type { UIMessageStreamWriter } from 'ai';
import { supabaseAdmin } from '@/shared/infrastructure/supabase/server/create-service-client';
import { logger } from '@/features/ai-assistant/lib/logger';
import { generateUUID } from '@/features/ai-assistant/lib/utils';

interface CreateSheetDocumentParams {
  title: string;
  dataStream: UIMessageStreamWriter<any>;
  documentId?: string; // Optional: ID for Supabase persistence
}

export async function createSheetDocument({
  title,
  dataStream,
  documentId,
}: CreateSheetDocumentParams): Promise<string> {
  let fullContent = '';

  logger.debug('[Sheet Artifact] createSheetDocument called', {
    title,
    documentId: documentId || 'NOT PROVIDED',
    hasDataStream: !!dataStream,
  });

  // Stream structured CSV generation using streamObject
  const { fullStream } = streamObject({
    model: openai('o3-mini'),
    system: `You are a helpful assistant that creates well-structured CSV data for spreadsheets.
Generate CSV data based on the user's request. The CSV should be properly formatted with headers.
Return only valid CSV data, no explanations or markdown formatting.`,
    prompt: title,
    schema: z.object({
      csv: z.string().describe('CSV data with headers. Use commas as delimiters, newlines for rows.'),
    }),
  });

  logger.debug('[Sheet Artifact] Starting CSV generation stream...');
  let deltaCount = 0;

  // Stream CSV deltas to UI (real-time)
  for await (const delta of fullStream) {
    if (delta.type === 'object') {
      const { object } = delta;
      const { csv } = object;

      if (csv) {
        // Calculate the new content (replace previous content, not append)
        // streamObject sends full object each time, so we use the latest
        fullContent = csv;
        deltaCount++;

        dataStream.write({
          type: 'data-sheetDelta',
          data: csv, // Send full CSV each time (streamObject replaces, not appends)
          transient: true,
        });
      }
    }
  }

  logger.debug('[Sheet Artifact] Streaming completed', {
    totalDeltas: deltaCount,
    contentLength: fullContent.length,
    documentId: documentId || 'NOT PROVIDED',
  });

  // Signal completion
  dataStream.write({
    type: 'data-artifactStatus',
    data: 'complete',
    transient: true,
  });

  // Save to Supabase AFTER streaming completes (non-blocking)
  if (documentId) {
    try {
      logger.info(`[Sheet Artifact] Starting Supabase save operation`, {
        documentId,
        title,
        contentLength: fullContent.length,
        kind: 'sheet',
      });

      const tempUserId = generateUUID(); // TODO: Replace with actual user ID
      const documentData = {
        id: documentId,
        title,
        content: fullContent,
        kind: 'sheet',
        userId: tempUserId,
        createdAt: new Date().toISOString(),
      };

      logger.debug('[Sheet Artifact] Supabase insert payload', documentData);

      const { error } = await supabaseAdmin
        .from('Document')
        .insert(documentData);

      if (error) {
        logger.error('[Sheet Artifact] Supabase insert error', {
          documentId,
          error: error.message,
          errorCode: error.code,
          errorDetails: error.details,
          errorHint: error.hint,
        });
      } else {
        logger.info(`[Sheet Artifact] Successfully saved document to Supabase: ${documentId}`);
      }
    } catch (error) {
      logger.error('[Sheet Artifact] Unexpected error saving to Supabase:', error);
    }
  } else {
    logger.warn('[Sheet Artifact] No documentId provided, skipping Supabase save', {
      title,
      contentLength: fullContent.length,
    });
  }

  return fullContent;
}
```

**Why**:

- Handles the actual CSV generation and streaming
- **Saves to database for persistence** (after streaming completes)
- **Non-blocking**: Database save doesn't affect streaming experience
- Uses `streamObject` for structured CSV generation (better than text streaming for tables)

**Status**: ⏳ To Do

---

### Step 2.2: Integrate Sheet Handler in Agent

**File**: `features/ai-assistant/agents/technical-discussion/agent.ts` and `recommendation/agent.ts`

**Changes**:

- Import `createSheetDocument`
- Handle `kind === 'sheet'` in `onStepFinish` callback
- Pass `documentId` to `createSheetDocument` for Supabase persistence

**Key Points**:
- ✅ **ID Synchronization**: Tool and agent use shared ID via closure (same as text artifacts)
- ✅ **Persistence**: Agent passes `documentId` to handler for Supabase save
- ✅ **Timing**: Handler called in `onStepFinish` (after tool executes)

```typescript
import { createSheetDocument } from '@/features/ai-assistant/artifacts/sheet/server';

// In onStepFinish callback:
for (const toolCall of toolCalls) {
  if (toolCall.toolName === 'createDocument') {
    const input = 'input' in toolCall ? toolCall.input : undefined;
    if (!input) continue;

    const { title, kind } = input as { title: string; kind?: 'text' | 'code' | 'sheet' };


    // Use shared ID that tool set (ensures sync)
    const documentId = sharedDocumentId || generateUUID();


    if (kind === 'sheet') {
      await createSheetDocument({
        title,
        dataStream,
        documentId, // Pass for Supabase persistence
      });
    } else if (kind === 'text' || !kind) {
      // ... existing text handler ...
    }


    sharedDocumentId = null; // Reset for next call
  }
}
```

**Why**:

- Makes the sheet handler available when AI creates sheet artifacts
- **Ensures ID sync** between tool and agent
- **Enables persistence** by passing documentId to handler

**Status**: ⏳ To Do

---

## Phase 3: Client-Side (UI Components)

### Step 3.1: Create Table Component (Reusable)

**File**: `features/ai-assistant/artifacts/sheet/components/table.tsx`

**Purpose**: Reusable table component that renders CSV data as HTML table

**Features**:
- ✅ Parses CSV string into rows/columns
- ✅ Renders as HTML table
- ✅ Handles empty cells
- ✅ Responsive design
- ✅ `isPreview` prop to control styling (preview vs. panel)

**Implementation**:

```typescript
'use client';

import { useMemo } from 'react';
import { parse } from 'papaparse';
import { cn } from '@/shared/lib/utils';

interface TableProps {
  csvContent: string;
  isPreview?: boolean; // If true, applies preview styling (overflow scroll)
  className?: string;
}

/**
 * Table Component
 *

 * Renders CSV data as an HTML table.
 * Used in both preview card and artifact panel.
 *

 * @param csvContent - CSV string to render
 * @param isPreview - If true, applies preview styling (overflow scroll, fixed height)
 * @param className - Additional CSS classes
 */
export function Table({ csvContent, isPreview = false, className }: TableProps) {
  // Parse CSV into rows and columns using papaparse
  const rows = useMemo(() => {
    if (!csvContent || !csvContent.trim()) {
      return [];
    }

    // Use papaparse for robust CSV parsing
    // Handles: quotes, escaped quotes, commas in fields, etc.
    const result = parse<string[]>(csvContent, {
      skipEmptyLines: false, // Keep empty rows for table structure
      header: false, // Return as array of arrays
    });

    return result.data || [];
  }, [csvContent]);

  if (rows.length === 0) {
    return (
      <div className={cn('flex items-center justify-center p-8 text-muted-foreground', className)}>
        <p>No data available</p>
      </div>
    );
  }

  const headerRow = rows[0] || [];
  const dataRows = rows.slice(1);

  return (
    <div
      className={cn(
        'w-full',
        {
          'h-[257px] overflow-auto': isPreview, // Preview: fixed height, scrollable
          'overflow-auto': !isPreview, // Panel: full height, scrollable
        },
        className
      )}
    >
      <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        {/* Header Row */}
        {headerRow.length > 0 && (
          <thead>
            <tr>
              {headerRow.map((header, index) => (
                <th
                  key={index}
                  className="border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-left font-semibold text-sm"
                >
                  {header || `Column ${index + 1}`}
                </th>
              ))}
            </tr>
          </thead>
        )}

        {/* Data Rows */}
        <tbody>
          {dataRows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headerRow.map((_, colIndex) => (
                <td
                  key={colIndex}
                  className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm"
                >
                  {row[colIndex] || ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Why**:

- Reusable component for both preview and panel
- Handles CSV parsing
- Responsive and accessible

**Status**: ⏳ To Do

---

### Step 3.2: Update DocumentContent for Sheet Preview

**File**: `features/ai-assistant/artifacts/components/document-content.tsx`

**Changes**: Add sheet rendering case

```typescript
import { Table } from '../sheet/components/table';

export function DocumentContent({ document }: DocumentContentProps) {
  const { artifact } = useArtifact();

  const containerClassName = cn(
    'h-[257px] overflow-y-auto rounded-b-2xl border border-t-0 dark:border-zinc-700 dark:bg-muted',
    {
      'p-4 sm:px-14 sm:py-16': document.kind === 'text',
      'p-0': document.kind === 'code' || document.kind === 'sheet', // Sheet: no padding, table fills container
    }
  );

  return (
    <div className={containerClassName}>
      {document.kind === 'text' ? (
        <div className="prose prose-sm max-w-none dark:prose-invert min-h-full">
          <MarkdownText>{document.content || ''}</MarkdownText>
        </div>
      ) : document.kind === 'code' ? (
        <pre className="p-4 text-sm overflow-auto">
          <code>{document.content || ''}</code>
        </pre>
      ) : document.kind === 'sheet' ? (
        <Table csvContent={document.content || ''} isPreview={true} />
      ) : null}
    </div>
  );
}
```

**Why**:

- Adds sheet rendering to preview card
- Uses reusable `Table` component with `isPreview={true}` for overflow scroll

**Status**: ⏳ To Do

---

### Step 3.3: Create Sheet Artifact Content Component

**File**: `features/ai-assistant/artifacts/sheet/components/sheet-artifact-content.tsx`

**Purpose**: Renders the actual sheet artifact content on the right side of the panel

**Features**:
- ✅ Fetches document from Supabase via SWR
- ✅ Falls back to streaming content during streaming or if fetch fails
- ✅ Displays title
- ✅ Renders table using reusable `Table` component
- ✅ Shows streaming status indicator

**Implementation**:

```typescript
'use client';

import { useArtifact } from '../../hooks/use-artifact';
import { useDocument } from '../../hooks/use-document';
import { Table } from './table';

/**
 * Sheet Artifact Content Component
 *

 * Displays the sheet artifact content with table rendering.
 *

 * Features:
 * - Fetches document from Supabase via SWR
 * - Falls back to streaming content during streaming or if fetch fails
 * - Displays title
 * - Renders table from CSV data
 * - Shows streaming status indicator
 */
export function SheetArtifactContent() {
  const { artifact } = useArtifact();
  const documentId = artifact.documentId !== 'init' ? artifact.documentId : null;

  // Fetch document from Supabase
  const { document: fetchedDocument } = useDocument(
    documentId && artifact.status !== 'streaming' ? documentId : null
  );

  // Smart content priority:
  // - During streaming: Use artifact.content (real-time updates)
  // - After streaming: Use fetchedDocument.content (persisted version)
  // - Fallback: Use artifact.content if fetched document unavailable
  const content =
    artifact.status === 'streaming'
      ? artifact.content // During streaming, always use real-time artifact content
      : fetchedDocument?.content || artifact.content || ''; // After streaming, prefer fetched, then artifact

  const title = fetchedDocument?.title || artifact.title || 'Untitled Sheet';

  return (
    <div className="h-full flex flex-col text-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b p-6 pb-4">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        {artifact.status === 'streaming' && (
          <div className="text-sm text-muted-foreground">
            Generating...
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto p-6">
        <Table csvContent={content} isPreview={false} />
      </div>
    </div>
  );
}
```

**Why**:

- Displays the sheet artifact content with table rendering
- **Fetches from Supabase** via SWR for persistence
- **Falls back to streaming content** during streaming or if fetch fails
- **Smart priority**: Streaming content > Fetched content > Artifact content

**Status**: ⏳ To Do

---

### Step 3.4: Integrate Sheet Content in ArtifactPanel

**File**: `features/ai-assistant/artifacts/components/artifact-panel.tsx`

**Changes**: Add sheet content rendering with proper kind fallback

```typescript
import { SheetArtifactContent } from '../sheet/components/sheet-artifact-content';

// In ArtifactPanel component:
// IMPORTANT: Use fetchedDocument.kind first, then artifact.kind as fallback
// This ensures correct component renders even if artifact state's kind isn't set during streaming
const artifactKind = fetchedDocument?.kind || artifact.kind;

// Sync artifact kind with fetched document
useEffect(() => {
  if (fetchedDocument) {
    setArtifact((currentArtifact) => ({
      ...currentArtifact,
      content: fetchedDocument.content || currentArtifact.content,
      title: fetchedDocument.title || currentArtifact.title,
      kind: fetchedDocument.kind || currentArtifact.kind, // Sync kind to ensure correct component renders
    }));
  }
}, [fetchedDocument, setArtifact]);

// In render:
{artifactKind === 'text' && (
  <TextArtifactContent />
)}

{artifactKind === 'sheet' && (
  <SheetArtifactContent />
)}

{artifactKind === 'code' && (
  <div className="p-6">
    <pre className="p-4 text-sm overflow-auto bg-muted rounded-lg">
      <code>{artifact.content}</code>
    </pre>
  </div>
)}
```

**Why**: Integrates sheet artifact content into the artifact panel

**Status**: ✅ Complete

**⚠️ Important Fix**: The artifact panel must use `fetchedDocument?.kind` first, then fall back to `artifact.kind`. This prevents the sheet from rendering as markdown text (via `TextArtifactContent`) when the artifact state's kind defaults to `'text'` during streaming.

---

## Phase 4: Testing & Validation

### Step 4.1: Test Sheet Creation

**Test Cases**:
- [ ] AI can create sheet artifacts via tool call with `kind: 'sheet'`
- [ ] CSV content streams in real-time to artifact panel
- [ ] Table displays correctly in preview card
- [ ] Table displays correctly in artifact panel
- [ ] Preview card has overflow scroll (fixed height)
- [ ] Panel table is scrollable (full height)

---

### Step 4.2: Test CSV Parsing

**Test Cases**:
- [ ] Simple CSV (no quotes) parses correctly
- [ ] CSV with quoted fields parses correctly
- [ ] CSV with escaped quotes (`""`) parses correctly
- [ ] CSV with commas inside quoted fields parses correctly
- [ ] CSV with newlines inside quoted fields parses correctly
- [ ] Empty cells handled correctly
- [ ] Empty rows handled correctly
- [ ] Empty CSV shows "No data available" message
- [ ] Large CSV files parse efficiently

---

### Step 4.3: Test Persistence

**Test Cases**:
- [ ] Sheet saves to Supabase after streaming completes
- [ ] Sheet fetches from Supabase when panel opens
- [ ] Falls back to streaming content if fetch fails
- [ ] Multiple sheets can be created
- [ ] Sheet persists across sessions

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Step 1.1: Add `sheetDelta` type to stream.ts
- [ ] Step 1.2: Update DataStreamHandler for sheet deltas

### Phase 2: Server-Side
- [ ] Step 2.1: Create `sheet/server.ts` handler
- [ ] Step 2.2: Integrate sheet handler in agents

### Phase 3: Client-Side
- [ ] Step 3.1: Create `sheet/components/table.tsx` (reusable)
- [ ] Step 3.2: Update DocumentContent for sheet preview
- [ ] Step 3.3: Create `sheet/components/sheet-artifact-content.tsx`
- [ ] Step 3.4: Integrate SheetArtifactContent in ArtifactPanel

### Phase 4: Testing
- [ ] Step 4.1: Test sheet creation
- [ ] Step 4.2: Test CSV parsing
- [ ] Step 4.3: Test persistence

---

## File Structure

```
features/ai-assistant/artifacts/
├── sheet/
│   ├── server.ts                    # Sheet handler (CSV generation)
│   └── components/
│       ├── table.tsx                # Reusable table component
│       └── sheet-artifact-content.tsx  # Panel content component
├── components/
│   ├── document-content.tsx         # Updated for sheet preview
│   └── artifact-panel.tsx           # Updated for sheet content
└── ... (existing files)
```

---

## Dependencies

### Required:
- ✅ `ai` package (already installed) - for `streamObject`
- ✅ `zod` (already installed) - for schema validation
- ✅ `@supabase/supabase-js` (already installed) - for database operations
- ✅ `swr` (already installed) - for data fetching
- ⏳ `papaparse` - **Needs to be installed** for CSV parsing
- ⏳ `@types/papaparse` - **Needs to be installed** (dev dependency)

**Installation**:
```bash
npm install papaparse
npm install --save-dev @types/papaparse
```

**Why `papaparse` is required**:
- CSV parsing is complex (handles quotes, escaped quotes, commas in fields, etc.)
- A simple parser will break on edge cases
- Reference project uses `papaparse` for all CSV operations
- Well-maintained, lightweight library (~50KB)
- Provides both `parse()` (CSV → array) and `unparse()` (array → CSV) functions

---

## Key Design Decisions

1. **CSV Format**:

   - Sheets are stored as CSV strings in the database
   - Simple and portable
   - Easy to parse and render

2. **Reusable Table Component**:
   - Single `Table` component used in both preview and panel
   - `isPreview` prop controls styling (overflow scroll vs. full height)
   - Keeps code DRY and maintainable

3. **Streaming Strategy**:
   - Uses `streamObject` for structured CSV generation
   - Sends full CSV each time (streamObject replaces, not appends)
   - Better than text streaming for structured data

4. **Preview vs. Panel**:
   - Preview: Fixed height (257px), overflow scroll, same table
   - Panel: Full height, scrollable, same table
   - Same component, different styling

5. **No Version History (This Phase)**:
   - Version history will be added in a future phase
   - Focus on core functionality first

---

## Success Criteria

✅ **Minimum Viable Product:**
- AI can create sheet artifacts via tool call
- CSV content streams in real-time to artifact panel
- Table displays correctly in preview card (with overflow scroll)
- Table displays correctly in artifact panel (full height)
- User can close artifact panel

✅ **Enhanced Version:**
- ✅ Sheet auto-shows when content threshold reached
- ✅ Sheet persists across sessions (via Supabase)
- ✅ Multiple sheets supported (via database)
- ⏳ Version history (future phase)
- ⏳ Sheet editing (future phase)

---

## Future Enhancements

1. **Version History**: Add version tracking for sheets (same as text artifacts)
2. **Sheet Editing**: Allow users to edit cells directly
3. **Advanced Features**:

   - Formula support
   - Cell formatting
   - Column/row resizing
   - Sorting and filtering
4. **Export Options**:

   - Export as CSV
   - Export as Excel
   - Copy to clipboard
5. **Better CSV Parser**: Use `papaparse` for more robust parsing

---

## Reference for Future Artifacts

This plan serves as a **template for adding new artifact types**. When adding a new artifact type (e.g., `code`, `image`):

### Pattern to Follow:

1. **Phase 1: Foundation**
   - Add delta type to `stream.ts` (e.g., `codeDelta`, `imageDelta`)
   - Update `DataStreamHandler` to process new delta type

2. **Phase 2: Server-Side**
   - Create `{artifact-type}/server.ts` handler
   - Use appropriate AI SDK function (`streamText`, `streamObject`, etc.)
   - Stream deltas via `data-{type}Delta`
   - Save to Supabase after streaming

3. **Phase 3: Client-Side**
   - Create reusable component for rendering (if needed)
   - Update `DocumentContent` for preview rendering
   - Create `{artifact-type}/components/{artifact-type}-artifact-content.tsx` for panel
   - Integrate in `ArtifactPanel`

4. **Phase 4: Testing**
   - Test creation, streaming, persistence
   - Test preview and panel rendering

---

## Troubleshooting

### Issue: Sheet Artifact Renders as Markdown Text Instead of Table

**Symptoms**:
- Sheet artifact content appears as markdown text in `<p>` tags
- No semantic HTML table elements (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`) in browser inspector
- CSV data is displayed as plain text instead of a formatted table

**Root Cause**:
The artifact panel was only checking `artifact.kind` to determine which component to render. If `artifact.kind` defaults to `'text'` (from `initialArtifactData`) or isn't set during streaming, the panel would render `TextArtifactContent` instead of `SheetArtifactContent`, causing CSV data to be displayed as markdown text.

**Solution**:
1. **Use fetched document's kind first**: The artifact panel now uses `fetchedDocument?.kind` first (from Supabase), then falls back to `artifact.kind`. This ensures the correct component renders even if the artifact state's kind isn't set during streaming.

2. **Sync kind in useEffect**: When fetching the document from Supabase, sync the `kind` property to the artifact state:
   ```typescript
   useEffect(() => {
     if (fetchedDocument) {
       setArtifact((currentArtifact) => ({
         ...currentArtifact,
         content: fetchedDocument.content || currentArtifact.content,
         title: fetchedDocument.title || currentArtifact.title,
         kind: fetchedDocument.kind || currentArtifact.kind, // Sync kind
       }));
     }
   }, [fetchedDocument, setArtifact]);
   ```

3. **Use artifactKind variable**: Create a variable that prioritizes fetched document kind:
   ```typescript
   const artifactKind = fetchedDocument?.kind || artifact.kind;
   ```

4. **Use artifactKind in conditional rendering**:
   ```typescript
   {artifactKind === 'sheet' && (
     <SheetArtifactContent />
   )}
   ```

**Verification**:
1. Refresh the page or close/reopen the artifact panel
2. Check the browser console — you should see `[DataStreamHandler] Artifact kind set: sheet`
3. The sheet should now render as a proper HTML table with semantic elements (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`) instead of markdown text
4. In the browser's element inspector, you should see table elements, not `<p>` tags with CSV text

**Expected Behavior**:
- Sheet artifacts should render as semantic HTML table elements
- Table should be properly formatted with headers and data rows
- CSV data should be parsed and displayed in a structured table format

**Files Modified**:
- `features/ai-assistant/artifacts/components/artifact-panel.tsx`

### Key Principles:

- ✅ **Reuse existing infrastructure**: Use same DataStream pattern, SWR, Supabase
- ✅ **Follow same UI architecture**: Preview card + split-screen panel
- ✅ **Consistent patterns**: Same tool, same agent integration, same persistence
- ✅ **Incremental enhancement**: Add version history, editing, etc. in future phases

---

**Status**: 📋 Plan Ready

**Next**: Start with Phase 1 (Foundation)

