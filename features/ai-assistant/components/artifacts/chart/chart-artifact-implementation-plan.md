# Chart Artifact Implementation Plan

## Overview

This plan outlines the implementation of chart artifacts in the AI assistant, allowing the AI to create and stream live line chart visualizations that users can view in real-time. **This implementation follows the same pattern as text and sheet artifacts but uses JSON data format for chart configuration and renders using the existing LineChart component.**

**Key Features**:
- ✅ Display line charts with real-time data streaming
- ✅ Preview component with chart thumbnail (same chart, smaller size)
- ✅ Panel displays title and left side message list (like text/sheet artifacts)
- ✅ Real-time streaming via DataStream pattern
- ✅ Database persistence via Supabase
- ✅ SWR-based fetching for client-side data management
- ✅ Uses existing `LineChart` component from `app/development/dashboard-grid/sections/line-chart/components/LineChart.tsx`

**Related Documentation**: 
- See `text-artifact-implementation-plan.md` for the foundational pattern
- See `sheet-artifact-implementation-plan.md` for the sheet-specific pattern (this builds on both)
- See `artifact-database-swr-supabase-implementation.md` for database integration details

---

## UI Architecture

The chart artifact follows the **same UI architecture as text and sheet artifacts**:

### 1. Message List Preview/Button (Conditional Rendering)
- **Location**: Inside message list, shown when artifacts are created/updated
- **Component**: `DocumentPreview` - Conditionally renders based on `artifact.isVisible`
  - **When panel CLOSED** (`artifact.isVisible === false`):
    - Shows **preview card** with:
      - Document header (icon, title, expand icon)
      - **Chart preview** (smaller chart, ~257px height) - **Same chart as panel, just smaller**
  - **When panel OPEN** (`artifact.isVisible === true`):
    - Shows **small button**: `DocumentToolCall` or `DocumentToolResult`
- **Purpose**: Preview card shows chart preview, button shows compact view when panel is open

### 2. Split-Screen Artifact Panel (Full Screen)
- **Location**: Full-screen overlay when artifact is visible
- **Layout**: Split 50/50
  - **Left Side**: Chat messages (`ArtifactMessages` component)
  - **Right Side**: Chart artifact content (`ChartArtifactContent` component)
- **Component**: `ArtifactPanel` - Container for split-screen layout

### 3. Chart Artifact Content (Right Side)
- **Location**: Right side of split-screen panel
- **Components**:
  - `ChartArtifactContent` - Renders line chart from JSON data
  - `ArtifactCloseButton` - Closes the artifact panel
- **Purpose**: Displays the actual line chart visualization

### Flow:
```
1. AI calls createDocument tool with kind='chart'
   ↓
2. Tool generates document ID and streams metadata to UI
   ↓
3. DocumentPreview appears in message list:
   - If panel CLOSED: Shows preview card with chart (smaller size)
   - If panel OPEN: Shows "Creating..." button
   ↓
4. Chart JSON data streams to artifact state (updates preview card in real-time)
   - DataStreamHandler processes data-chartDelta events
   - Artifact state updates in real-time
   - Chart re-renders as data streams in
   ↓
5. After streaming completes:
   - Server saves complete JSON content to Supabase
   - Document persisted with same ID as streamed to UI
   ↓
6. User clicks preview card OR content reaches threshold
   ↓
7. ArtifactPanel opens (split-screen)
   ↓
8. Left: Chat messages, Right: Chart content
   - Component fetches document from Supabase via SWR (if available)
   - Falls back to artifact.content if fetch fails or during streaming
   ↓
9. DocumentPreview switches to button mode (compact view)
   ↓
10. User can close artifact panel (preview card reappears)
```

---

## Current State

✅ **Already Implemented (from text/sheet artifacts):**
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

✅ **Existing LineChart Component:**
- Located at: `app/development/dashboard-grid/sections/line-chart/components/LineChart.tsx`
- Already installed dependencies: `chart.js`, `react-chartjs-2`, `chartjs-plugin-datalabels`
- Fully functional with extensive customization options

**Note**: The infrastructure is already in place! We just need to add chart-specific components and handlers.

---

## Data Format

### Chart JSON Structure

The chart artifact will store **only chart data** (not styling) as JSON in the `content` field. All styling will be applied in code using theme-aware colors (foreground).

**Important**: We only stream data, not styling configs. Styling is handled in the component code.

```typescript
interface ChartData {
  // Required: Chart data only
  datasets: Array<{
    data: number[];  // Array of numeric values
    label?: string;   // Dataset label (e.g., "RTC Payments")
  }>;
  labels: string[];  // X-axis labels (e.g., ["Jan", "Feb", "Mar"])
}
```

**Example JSON** (data only):
```json
{
  "datasets": [
    {
      "data": [1000, 1500, 1200, 1800, 2000, 1700],
      "label": "RTC Payments"
    }
  ],
  "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
}
```

**Styling**: All styling (colors, opacity, grid, etc.) is applied in the `ChartRenderer` component using theme-aware colors (foreground) and hardcoded defaults.

---

## Database Migration (Required Before Implementation)

### Step 0.1: Update Document Table Constraint

**File**: `lib/supabase/migrations/004_add_chart_to_document_kind.sql`

**Purpose**: Add 'chart' to the Document table's kind constraint to allow chart artifacts to be saved.

**Why**: The original migration (`001_create_document_table.sql`) only allows `'text'`, `'code'`, and `'sheet'` in the kind constraint. Chart artifacts will fail to save without this migration.

**Migration SQL**:
```sql
-- Drop the existing constraint
ALTER TABLE "Document" 
  DROP CONSTRAINT IF EXISTS "Document_kind_check";

-- Add new constraint that includes 'chart'
ALTER TABLE "Document" 
  ADD CONSTRAINT "Document_kind_check" 
  CHECK ("kind" IN ('text', 'code', 'sheet', 'chart'));

-- Update comment to reflect chart support
COMMENT ON COLUMN "Document"."kind" IS 'Artifact type: text, code, sheet, or chart';
```

**How to Apply**:
1. Open Supabase Dashboard → SQL Editor
2. Run the migration file: `lib/supabase/migrations/004_add_chart_to_document_kind.sql`
3. Verify the constraint was updated (check table constraints in Supabase)

**Status**: ⚠️ **REQUIRED** - Chart artifacts will not save to Supabase without this migration.

---

## Phase 1: Foundation (Data Types & Stream Processing)

### Step 1.1: Add Chart Delta Type to Stream

**File**: `features/ai-assistant/types/stream.ts`

**Changes**: Add `chartDelta` type for streaming JSON chart data

```typescript
export type ShopMateUIDataTypes = {
  // ... existing types ...
  
  // Artifact types
  textDelta: string;              // Text content chunks
  sheetDelta: string;              // CSV content chunks
  chartDelta: string;              // Chart JSON content chunks (NEW)
  artifactId: string;              // Artifact document ID
  artifactTitle: string;           // Artifact title
  artifactKind: 'text' | 'code' | 'sheet' | 'chart'; // Artifact type (UPDATED)
  artifactStatus: 'idle' | 'streaming' | 'complete'; // Artifact status
  artifactClear: null;             // Clear artifact signal
};
```

**Why**: Defines the data structure for chart artifact streaming

**Status**: ⏳ To Do

---

### Step 1.2: Update useArtifact Hook for Chart Kind

**File**: `features/ai-assistant/artifacts/hooks/use-artifact.ts`

**Changes**: Update `UIArtifact` interface to include `'chart'` in kind type

```typescript
export interface UIArtifact {
  documentId: string;
  title: string;
  content: string; // JSON string for chart artifacts
  kind: 'text' | 'code' | 'sheet' | 'chart'; // UPDATED
  status: 'idle' | 'streaming' | 'complete';
  isVisible: boolean;
  boundingBox: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}
```

**Why**: Allows artifact state to recognize chart artifacts

**Status**: ⏳ To Do

---

### Step 1.3: Update DataStreamHandler for Chart Deltas

**File**: `features/ai-assistant/data-stream/data-stream-handler.tsx`

**Changes**: Add processing for `data-chartDelta` events

```typescript
case "data-chartDelta":
  setArtifact(prev => ({ 
    ...prev, 
    content: prev.content + delta.data, // JSON content accumulates
    status: "streaming",
  }));
  break;
```

**Why**: Processes chart JSON data from stream and updates artifact state

**Status**: ⏳ To Do

---

## Phase 2: Server-Side (Tool & Handler)

### Step 2.1: Update createDocument Tool for Chart Kind

**File**: `features/ai-assistant/artifacts/text/tool/create-document-tool.ts` (or wherever the tool is located)

**Changes**: Update the `kind` enum to include `'chart'`

```typescript
parameters: z.object({
  title: z.string().describe("The title of the document"),
  kind: z.enum(["text", "code", "sheet", "chart"]).default("text").describe("The type of document"),
}),
```

**Why**: Allows AI to create chart artifacts via tool calls

**Status**: ⏳ To Do

---

### Step 2.2: Create Chart Artifact Handler

**File**: `features/ai-assistant/artifacts/chart/server.ts`

**Purpose**: Generates chart JSON configuration, streams it to the artifact, and saves to Supabase

**Key Features**:
- ✅ Uses `streamObject` to generate structured chart JSON data
- ✅ Streams content in real-time via `data-chartDelta`
- ✅ Saves complete JSON content to Supabase after streaming
- ✅ Uses `documentId` parameter for persistence
- ✅ Non-blocking: If save fails, user still sees content (from streaming)

**Implementation**:

```typescript
import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod/v3';
import type { UIMessageStreamWriter } from 'ai';
import { supabaseAdmin } from '@/lib/supabase/client';
import { logger } from '@/features/ai-assistant/lib/logger';
import { generateUUID } from '@/features/ai-assistant/lib/utils';

interface CreateChartDocumentParams {
  title: string;
  dataStream: UIMessageStreamWriter<any>;
  documentId?: string; // Optional: ID for Supabase persistence
}

export async function createChartDocument({
  title,
  dataStream,
  documentId,
}: CreateChartDocumentParams): Promise<string> {
  let fullContent = '';

  logger.debug('[Chart Artifact] createChartDocument called', {
    title,
    documentId: documentId || 'NOT PROVIDED',
    hasDataStream: !!dataStream,
  });

  // ✅ PHASE 1: Get labels/ticks first and initialize with zeros
  // This allows the chart to render immediately with structure, then fill in data
  logger.debug('[Chart Artifact] Phase 1: Getting labels and structure...');
  
  const labelsSchema = z.object({
    labels: z.array(z.string()).describe('Array of labels for the x-axis (e.g., ["Jan", "Feb", "Mar"])'),
    datasetLabels: z.array(z.string()).optional().describe('Array of dataset labels (e.g., ["RTC Payments", "Other Payments"])'),
  });

  const { fullStream: labelsStream } = streamObject({
    model: openai('o3-mini'),
    system: `You are a helpful assistant that determines the structure for line charts.
Based on the user's request, determine:
1. The x-axis labels (time periods, categories, etc.)
2. The dataset labels (what data series will be shown)

Return ONLY the labels structure. Do NOT include any data values yet.
No explanations or markdown formatting.`,
    prompt: `${title}\n\nDetermine the x-axis labels and dataset labels needed for this chart.`,
    schema: labelsSchema,
  });

  let labels: string[] = [];
  let datasetLabels: string[] = [];
  let initialChartData: any = null;

  // Get labels first
  for await (const delta of labelsStream) {
    if (delta.type === 'object') {
      const { object } = delta;
      if (object) {
        labels = object.labels || [];
        datasetLabels = object.datasetLabels || ['Data'];
        
        // Create initial chart data with zeros
        initialChartData = {
          labels: labels,
          datasets: datasetLabels.map((label) => ({
            data: new Array(labels.length).fill(0), // Fill with zeros
            label: label,
          })),
        };

        // Send initial structure to UI (chart renders with zeros)
        const initialJson = JSON.stringify(initialChartData, null, 2);
        dataStream.write({
          type: 'data-chartDelta',
          data: initialJson,
          transient: true,
        });

        logger.debug('[Chart Artifact] Phase 1 complete: Labels initialized', {
          labelCount: labels.length,
          datasetCount: datasetLabels.length,
        });
      }
    }
  }

  // ✅ PHASE 2: Stream actual data values incrementally
  logger.debug('[Chart Artifact] Phase 2: Streaming data values...');
  
  const dataSchema = z.object({
    values: z.array(z.number()).describe('Array of numeric values for the current dataset. Length should match labels array.'),
    datasetIndex: z.number().optional().describe('Index of the dataset being updated (0-based). If not provided, updates first dataset.'),
  });

  const { fullStream: valuesStream } = streamObject({
    model: openai('o3-mini'),
    system: `You are a helpful assistant that generates data values for line charts.
Based on the user's request and the chart structure (labels: ${JSON.stringify(labels)}), generate the actual numeric values.
Return data values that correspond to each label in order.
Return only valid JSON with values array. No explanations or markdown formatting.

Important:
- Return values as an array of numbers
- The array length should match the labels array length (${labels.length} values)
- You can return partial arrays if generating incrementally, but try to return complete arrays when possible`,
    prompt: `${title}\n\nGenerate data values for the chart. Labels are: ${JSON.stringify(labels)}`,
    schema: dataSchema,
  });

  let deltaCount = 0;
  let currentChartData = { ...initialChartData };

  // Stream data values incrementally
  for await (const delta of valuesStream) {
    if (delta.type === 'object') {
      const { object } = delta;
      
      if (object && object.values && Array.isArray(object.values)) {
        const datasetIndex = object.datasetIndex ?? 0;
        const newValues = object.values;

        // Update the specific dataset with new values
        // Merge new values into existing data (replace values at corresponding indices)
        if (currentChartData.datasets[datasetIndex]) {
          // Update values incrementally - merge new values into existing array
          newValues.forEach((value: number, index: number) => {
            if (index < currentChartData.datasets[datasetIndex].data.length) {
              currentChartData.datasets[datasetIndex].data[index] = value;
            }
          });

          // If new values array is longer, extend the data array
          if (newValues.length > currentChartData.datasets[datasetIndex].data.length) {
            currentChartData.datasets[datasetIndex].data = [
              ...currentChartData.datasets[datasetIndex].data,
              ...newValues.slice(currentChartData.datasets[datasetIndex].data.length),
            ];
          }
        }

        // Send updated chart data to UI
        const jsonContent = JSON.stringify(currentChartData, null, 2);
        fullContent = jsonContent; // Keep track of latest for saving
        deltaCount++;

        dataStream.write({
          type: 'data-chartDelta',
          data: jsonContent, // Send full updated JSON each time
          transient: true,
        });

        logger.debug('[Chart Artifact] Phase 2: Data delta received', {
          deltaNumber: deltaCount,
          datasetIndex,
          valueCount: newValues.length,
          updatedIndices: newValues.map((_: any, i: number) => i).slice(0, 5),
        });
      }
    }
  }

  logger.debug('[Chart Artifact] Streaming completed', {
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
      logger.info(`[Chart Artifact] Starting Supabase save operation`, {
        documentId,
        title,
        contentLength: fullContent.length,
        kind: 'chart',
      });

      const tempUserId = generateUUID(); // TODO: Replace with actual user ID
      const documentData = {
        id: documentId,
        title,
        content: fullContent,
        kind: 'chart',
        userId: tempUserId,
        createdAt: new Date().toISOString(),
      };

      logger.debug('[Chart Artifact] Supabase insert payload', documentData);

      const { error } = await supabaseAdmin
        .from('Document')
        .insert(documentData);

      if (error) {
        logger.error('[Chart Artifact] Supabase insert error', {
          documentId,
          error: error.message,
          errorCode: error.code,
          errorDetails: error.details,
          errorHint: error.hint,
        });
      } else {
        logger.info(`[Chart Artifact] Successfully saved document to Supabase: ${documentId}`);
      }
    } catch (error) {
      logger.error('[Chart Artifact] Unexpected error saving to Supabase:', error);
    }
  } else {
    logger.warn('[Chart Artifact] No documentId provided, skipping Supabase save', {
      title,
      contentLength: fullContent.length,
    });
  }

  return fullContent;
}
```

**Why**: 
- **Two-phase streaming**: First gets labels/ticks and renders chart with zeros, then streams actual values
- **Better UX**: Chart structure appears immediately, then data fills in progressively
- Handles the actual chart data generation and streaming (data only, no styling)
- **Saves to database for persistence** (after streaming completes)
- **Non-blocking**: Database save doesn't affect streaming experience
- Uses `streamObject` for structured JSON generation (better than text streaming for charts)
- **Simplified**: Only streams data (labels, values), styling is handled in component code

**Status**: ⏳ To Do

**⚠️ Implementation Notes**:

1. **Two-Phase Approach**: 
   - Phase 1 gets labels first and initializes chart with zeros
   - Phase 2 streams actual values incrementally
   - This provides better UX as chart structure appears immediately

2. **Data Merging**:
   - Values are merged incrementally into the existing data array
   - If AI returns partial arrays, values are merged at corresponding indices
   - If AI returns longer arrays, they extend the existing data

3. **Alternative Approach** (if two-phase is too complex):
   - Could use single `streamObject` call that generates labels first, then fills in values
   - Would require custom prompt engineering to ensure labels come first
   - Simpler but less control over the streaming experience

4. **Performance Considerations**:
   - Chart re-renders on each delta update
   - Consider debouncing if updates are too frequent
   - LineChart component should handle updates efficiently

---

### Step 2.3: Integrate Chart Handler in Agent

**File**: `features/ai-assistant/agents/dashboard-static-message/agent.ts` (or relevant agent)

**Changes**: 
- Import `createChartDocument`
- Handle `kind === 'chart'` in `onStepFinish` callback
- Pass `documentId` to `createChartDocument` for Supabase persistence

**Key Points**:
- ✅ **ID Synchronization**: Tool and agent use shared ID via closure (same as text/sheet artifacts)
- ✅ **Persistence**: Agent passes `documentId` to handler for Supabase save
- ✅ **Timing**: Handler called in `onStepFinish` (after tool executes)

```typescript
import { createChartDocument } from '@/features/ai-assistant/artifacts/chart/server';

// In onStepFinish callback:
for (const toolCall of toolCalls) {
  if (toolCall.toolName === 'createDocument') {
    const input = 'input' in toolCall ? toolCall.input : undefined;
    if (!input) continue;

    const { title, kind } = input as { title: string; kind?: 'text' | 'code' | 'sheet' | 'chart' };
    
    // Use shared ID that tool set (ensures sync)
    const documentId = sharedDocumentId || generateUUID();
    
    if (kind === 'chart') {
      await createChartDocument({
        title,
        dataStream,
        documentId, // Pass for Supabase persistence
      });
    } else if (kind === 'sheet') {
      // ... existing sheet handler ...
    } else if (kind === 'text' || !kind) {
      // ... existing text handler ...
    }
    
    sharedDocumentId = null; // Reset for next call
  }
}
```

**Why**: 
- Makes the chart handler available when AI creates chart artifacts
- **Ensures ID sync** between tool and agent
- **Enables persistence** by passing documentId to handler

**Status**: ⏳ To Do

---

## Phase 3: Client-Side (UI Components)

### Step 3.1: Create Chart Component Wrapper (Reusable)

**File**: `features/ai-assistant/artifacts/chart/components/chart-renderer.tsx`

**Purpose**: Reusable chart component that renders LineChart from JSON data with theme-aware styling

**Features**:
- ✅ Parses JSON string into chart data (data only, no styling)
- ✅ Applies theme-aware styling using foreground colors
- ✅ Renders using existing `LineChart` component
- ✅ Handles invalid JSON gracefully
- ✅ Responsive design
- ✅ `isPreview` prop to control sizing (preview vs. panel)

**Implementation**:

```typescript
'use client';

import { useMemo } from 'react';
import { LineChart } from '@/app/development/dashboard-grid/sections/line-chart/components/LineChart';
import { cn } from '@/lib/utils';

interface ChartRendererProps {
  jsonContent: string;
  isPreview?: boolean; // If true, applies preview styling (smaller height)
  className?: string;
}

/**
 * Chart Renderer Component
 * 
 * Renders a line chart from JSON data with theme-aware styling.
 * Used in both preview card and artifact panel.
 * 
 * @param jsonContent - JSON string containing chart data (data only, no styling)
 * @param isPreview - If true, applies preview styling (smaller height)
 * @param className - Additional CSS classes
 */
export function ChartRenderer({ jsonContent, isPreview = false, className }: ChartRendererProps) {
  // Get theme-aware foreground color from CSS variables
  // Use HSL format directly: hsl(var(--foreground))
  // This will automatically adapt to light/dark mode
  const foregroundColor = 'hsl(var(--foreground))';

  // Parse JSON into chart data
  const chartData = useMemo(() => {
    if (!jsonContent || !jsonContent.trim()) {
      return null;
    }

    try {
      const parsed = JSON.parse(jsonContent);
      
      // Validate required fields
      if (!parsed.datasets || !Array.isArray(parsed.datasets) || parsed.datasets.length === 0) {
        console.warn('[Chart Renderer] Invalid chart data: missing or empty datasets');
        return null;
      }
      
      if (!parsed.labels || !Array.isArray(parsed.labels) || parsed.labels.length === 0) {
        console.warn('[Chart Renderer] Invalid chart data: missing or empty labels');
        return null;
      }
      
      return parsed;
    } catch (error) {
      console.error('[Chart Renderer] Error parsing JSON:', error);
      return null;
    }
  }, [jsonContent]);

  if (!chartData) {
    return (
      <div className={cn('flex items-center justify-center p-8 text-muted-foreground', className)}>
        <p>Generating data...</p>
      </div>
    );
  }

  // Apply styling in code - use theme-aware foreground color
  // Map datasets to include styling props
  const styledDatasets = chartData.datasets.map((dataset, index) => ({
    ...dataset,
    // Apply theme-aware colors
    lineColor: foregroundColor,
    fillColor: foregroundColor,
    shadowColor: foregroundColor,
    // Default styling values
    fill: true,
    fillOpacity: 0.2,
    showPoints: false,
  }));

  return (
    <div
      className={cn(
        'w-full',
        {
          'h-[257px]': isPreview, // Preview: fixed height
          'h-full': !isPreview, // Panel: full height
        },
        className
      )}
    >
      <LineChart
        datasets={styledDatasets}
        labels={chartData.labels}
        height={isPreview ? 257 : '100%'}
        // Apply theme-aware styling
        lineColor={foregroundColor}
        shadowColor={foregroundColor}
        labelColor={foregroundColor}
        tickColor={foregroundColor}
        titleColor={foregroundColor}
        subtitleColor={foregroundColor}
        fillColor={foregroundColor}
        // Default styling values
        showNeonShadow={true}
        showGrid={false}
        showXAxisLine={false}
        showYAxisLine={false}
        showLabel={false}
        showTooltip={true}
        lineTension={0.4}
        lineWidth={2}
        showTicks={true}
        showPoints={false}
        fill={true}
        fillOpacity={0.2}
        gradientToTransparent={true}
        gradientStopPercentage={1.0}
        showXGrid={false}
        showYGrid={false}
      />
    </div>
  );
}
```

**Why**: 
- Reusable component for both preview and panel
- Handles JSON parsing and validation
- **Applies theme-aware styling** using foreground color from CSS variables
- **No hardcoded colors** - uses theme system (foreground, not text-black/bg-white)
- Responsive and accessible
- Uses existing LineChart component

**Status**: ⏳ To Do

---

### Step 3.2: Update DocumentContent for Chart Preview

**File**: `features/ai-assistant/artifacts/components/document-content.tsx`

**Changes**: Add chart rendering case

```typescript
import { ChartRenderer } from '../chart/components/chart-renderer';

export function DocumentContent({ document }: DocumentContentProps) {
  const { artifact } = useArtifact();

  const containerClassName = cn(
    'h-[257px] overflow-y-auto rounded-b-2xl border border-t-0 dark:border-zinc-700 dark:bg-muted',
    {
      'p-4 sm:px-14 sm:py-16': document.kind === 'text',
      'p-0': document.kind === 'code' || document.kind === 'sheet' || document.kind === 'chart', // Chart: no padding, chart fills container
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
      ) : document.kind === 'chart' ? (
        <ChartRenderer jsonContent={document.content || ''} isPreview={true} />
      ) : null}
    </div>
  );
}
```

**Why**: 
- Adds chart rendering to preview card
- Uses reusable `ChartRenderer` component with `isPreview={true}` for smaller size

**Status**: ⏳ To Do

---

### Step 3.3: Create Chart Artifact Content Component

**File**: `features/ai-assistant/artifacts/chart/components/chart-artifact-content.tsx`

**Purpose**: Renders the actual chart artifact content on the right side of the panel

**Features**:
- ✅ Fetches document from Supabase via SWR
- ✅ Falls back to streaming content during streaming or if fetch fails
- ✅ Displays title
- ✅ Renders chart using reusable `ChartRenderer` component
- ✅ Shows streaming status indicator

**Implementation**:

```typescript
'use client';

import { useArtifact } from '../../hooks/use-artifact';
import { useDocument } from '../../hooks/use-document-swr';
import { ChartRenderer } from './chart-renderer';

/**
 * Chart Artifact Content Component
 * 
 * Displays the chart artifact content with line chart rendering.
 * 
 * Features:
 * - Fetches document from Supabase via SWR
 * - Falls back to streaming content during streaming or if fetch fails
 * - Displays title
 * - Renders chart from JSON data
 * - Shows streaming status indicator
 */
export function ChartArtifactContent() {
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

  const title = fetchedDocument?.title || artifact.title || 'Untitled Chart';

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

      {/* Chart Content */}
      <div className="flex-1 overflow-auto p-6">
        <ChartRenderer jsonContent={content} isPreview={false} />
      </div>
    </div>
  );
}
```

**Why**: 
- Displays the chart artifact content with line chart rendering
- **Fetches from Supabase** via SWR for persistence
- **Falls back to streaming content** during streaming or if fetch fails
- **Smart priority**: Streaming content > Fetched content > Artifact content

**Status**: ⏳ To Do

---

### Step 3.4: Integrate Chart Content in ArtifactPanel

**File**: `features/ai-assistant/artifacts/components/artifact-panel.tsx`

**Changes**: Add chart content rendering with proper kind fallback

```typescript
import { ChartArtifactContent } from '../chart/components/chart-artifact-content';

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

{artifactKind === 'chart' && (
  <ChartArtifactContent />
)}

{artifactKind === 'code' && (
  <div className="p-6">
    <pre className="p-4 text-sm overflow-auto bg-muted rounded-lg">
      <code>{artifact.content}</code>
    </pre>
  </div>
)}
```

**Why**: Integrates chart artifact content into the artifact panel

**Status**: ⏳ To Do

**⚠️ Important Fix**: The artifact panel must use `fetchedDocument?.kind` first, then fall back to `artifact.kind`. This prevents the chart from rendering incorrectly when the artifact state's kind defaults to `'text'` during streaming.

---

## Phase 4: Testing & Validation

### Step 4.1: Test Chart Creation

**Test Cases**:
- [ ] AI can create chart artifacts via tool call with `kind: 'chart'`
- [ ] JSON content streams in real-time to artifact panel
- [ ] Chart displays correctly in preview card
- [ ] Chart displays correctly in artifact panel
- [ ] Preview card has smaller chart (257px height)
- [ ] Panel chart is full height

---

### Step 4.2: Test JSON Parsing

**Test Cases**:
- [ ] Valid JSON parses correctly
- [ ] Invalid JSON shows error message gracefully
- [ ] Missing required fields (datasets, labels) shows error message
- [ ] Empty datasets array shows error message
- [ ] Empty labels array shows error message
- [ ] Chart re-renders as JSON streams in (incremental updates)

---

### Step 4.3: Test Persistence

**Test Cases**:
- [ ] Chart saves to Supabase after streaming completes
- [ ] Chart fetches from Supabase when panel opens
- [ ] Falls back to streaming content if fetch fails
- [ ] Multiple charts can be created
- [ ] Chart persists across sessions

---

## Implementation Checklist

### Prerequisites
- [ ] **Step 0.1: Run database migration** - Update Document table constraint to include 'chart' (see Step 0.1 above)
  - ⚠️ **REQUIRED**: Chart artifacts will not save to Supabase without this migration

### Phase 1: Foundation
- [ ] Step 1.1: Add `chartDelta` type to stream.ts
- [ ] Step 1.2: Update useArtifact hook for chart kind
- [ ] Step 1.3: Update DataStreamHandler for chart deltas

### Phase 2: Server-Side
- [ ] Step 2.1: Update createDocument tool for chart kind
- [ ] Step 2.2: Create `chart/server.ts` handler
- [ ] Step 2.3: Integrate chart handler in agents

### Phase 3: Client-Side
- [ ] Step 3.1: Create `chart/components/chart-renderer.tsx` (reusable)
- [ ] Step 3.2: Update DocumentContent for chart preview
- [ ] Step 3.3: Create `chart/components/chart-artifact-content.tsx`
- [ ] Step 3.4: Integrate ChartArtifactContent in ArtifactPanel

### Phase 4: Testing
- [ ] Step 4.1: Test chart creation
- [ ] Step 4.2: Test JSON parsing
- [ ] Step 4.3: Test persistence

---

## File Structure

```
features/ai-assistant/artifacts/
├── chart/
│   ├── server.ts                    # Chart handler (JSON generation)
│   └── components/
│       ├── chart-renderer.tsx       # Reusable chart component
│       └── chart-artifact-content.tsx  # Panel content component
├── components/
│   ├── document-content.tsx         # Updated for chart preview
│   └── artifact-panel.tsx           # Updated for chart content
└── ... (existing files)
```

---

## Dependencies

### Required:
- ✅ `ai` package (already installed) - for `streamObject`
- ✅ `zod` (already installed) - for schema validation
- ✅ `@supabase/supabase-js` (already installed) - for database operations
- ✅ `swr` (already installed) - for data fetching
- ✅ `chart.js` (already installed) - for chart rendering
- ✅ `react-chartjs-2` (already installed) - for React Chart.js integration
- ✅ `chartjs-plugin-datalabels` (already installed) - for data labels

**All dependencies are already installed!** ✅

---

## Key Design Decisions

1. **JSON Format**: 
   - Charts are stored as JSON strings in the database
   - **Contains only data** (datasets with data/labels, x-axis labels)
   - **No styling** - all styling applied in component code
   - Easy to parse and render
   - Allows for incremental updates during streaming

2. **Reusable Chart Component**:
   - Single `ChartRenderer` component used in both preview and panel
   - `isPreview` prop controls sizing (257px vs. full height)
   - Keeps code DRY and maintainable

3. **Streaming Strategy (Two-Phase)**:
   - **Phase 1**: Get labels/ticks first and initialize chart with zeros
     - Chart structure appears immediately
     - User sees the chart framework right away
   - **Phase 2**: Stream actual data values incrementally
     - Values fill in progressively as they're generated
     - Chart updates in real-time as data arrives
   - Uses `streamObject` for structured JSON generation
   - **Streams only data** (labels, values) - no styling
   - Sends full JSON each time (streamObject replaces, not appends)
   - Better than text streaming for structured data
   - Chart re-renders as JSON updates

4. **Styling Strategy**:
   - **All styling applied in component code** (not streamed)
   - Uses theme-aware colors (foreground from CSS variables)
   - No hardcoded colors like text-black, bg-white
   - Consistent with theme system

5. **Preview vs. Panel**:
   - Preview: Fixed height (257px), smaller chart
   - Panel: Full height, larger chart
   - Same component, different height prop

6. **Error Handling**:
   - Graceful handling of invalid JSON
   - Error messages for missing required fields
   - Fallback to "No chart data available" message

---

## Success Criteria

✅ **Minimum Viable Product:**
- AI can create chart artifacts via tool call
- JSON content streams in real-time to artifact panel
- Chart displays correctly in preview card (with smaller size)
- Chart displays correctly in artifact panel (full height)
- User can close artifact panel

✅ **Enhanced Version:**
- ✅ Chart auto-shows when content threshold reached
- ✅ Chart persists across sessions (via Supabase)
- ✅ Multiple charts supported (via database)
- ✅ Chart re-renders as data streams in (incremental updates)

---

## Future Enhancements

1. **Version History**: Add version tracking for charts (same as text/sheet artifacts)
2. **Chart Editing**: Allow users to edit chart configuration
3. **Advanced Features**: 
   - Multiple chart types (bar, pie, etc.)
   - Chart export (PNG, SVG, PDF)
   - Chart sharing
4. **Better Data Handling**: 
   - Support for larger datasets
   - Data aggregation options
   - Real-time data updates

---

## Reference for Future Artifacts

This plan serves as a **template for adding new artifact types**. When adding a new artifact type (e.g., `image`, `code`):

### Pattern to Follow:

1. **Phase 1: Foundation**
   - Add delta type to `stream.ts` (e.g., `imageDelta`, `codeDelta`)
   - Update `useArtifact` hook to include new kind
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

### Issue: Chart Artifact Renders as Text Instead of Chart

**Symptoms**:
- Chart artifact content appears as JSON text
- No chart visualization displayed
- LineChart component not rendering

**Root Cause**:
The artifact panel was only checking `artifact.kind` to determine which component to render. If `artifact.kind` defaults to `'text'` (from `initialArtifactData`) or isn't set during streaming, the panel would render `TextArtifactContent` instead of `ChartArtifactContent`.

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
   {artifactKind === 'chart' && (
     <ChartArtifactContent />
   )}
   ```

**Verification**:
1. Refresh the page or close/reopen the artifact panel
2. Check the browser console — you should see chart rendering
3. The chart should now render as a proper line chart instead of JSON text

**Expected Behavior**:
- Chart artifacts should render as line charts using the LineChart component
- Chart should be properly formatted with data points and labels
- JSON data should be parsed and displayed as a visual chart

**Files Modified**:
- `features/ai-assistant/artifacts/components/artifact-panel.tsx`

### Issue: Chart Not Updating During Streaming

**Symptoms**:
- Chart appears but doesn't update as JSON streams in
- Chart shows initial data but remains static

**Root Cause**:
The chart component may not be re-rendering when the JSON content updates during streaming.

**Solution**:
1. Ensure `ChartRenderer` component uses `useMemo` with `jsonContent` as a dependency
2. Ensure `ChartArtifactContent` uses the streaming content during `artifact.status === 'streaming'`
3. Verify that `DataStreamHandler` is updating `artifact.content` correctly

---

## Key Principles:

- ✅ **Reuse existing infrastructure**: Use same DataStream pattern, SWR, Supabase
- ✅ **Follow same UI architecture**: Preview card + split-screen panel
- ✅ **Consistent patterns**: Same tool, same agent integration, same persistence
- ✅ **Leverage existing components**: Use existing LineChart component
- ✅ **Incremental enhancement**: Add version history, editing, etc. in future phases

---

**Status**: 📋 Plan Ready

**Next**: Start with Phase 1 (Foundation)

