# Text Artifact Implementation Plan

## Overview

This plan outlines the implementation of text artifacts in ShopMate, allowing the AI to create and stream live text documents that users can view and edit in real-time. **This implementation uses SWR for client-side data fetching and Supabase (PostgreSQL) for database persistence.**

**Related Documentation**: See `artifact-database-swr-supabase-implementation.md` for detailed database integration steps.

## UI Architecture

The artifact system has **three main UI components**:

### 1. Message List Preview/Button (Conditional Rendering)
- **Location**: Inside message list, shown when artifacts are created/updated
- **Component**: `DocumentPreview` - Conditionally renders based on `artifact.isVisible`
  - **When panel CLOSED** (`artifact.isVisible === false`):
    - Shows **preview card** with:
      - Document header (icon, title, expand icon)
      - Document content preview (overflow hidden, ~257px height)
      - Entire card is clickable
  - **When panel OPEN** (`artifact.isVisible === true`):
    - Shows **small button**:
      - `DocumentToolCall` - "Creating 'title'..." with spinner (while generating)
      - `DocumentToolResult` - "Created 'title'" (after completion)
- **Purpose**: Preview card shows content preview, button shows compact view when panel is open
- **When shown**: When AI calls `createDocument` or `updateDocument` tool

### 2. Split-Screen Artifact Panel (Full Screen)
- **Location**: Full-screen overlay when artifact is visible
- **Layout**: Split 50/50
  - **Left Side**: Chat messages (`ArtifactMessages` component)
  - **Right Side**: Artifact content (`TextArtifactContent` component)
- **Component**: `ArtifactPanel` - Container for split-screen layout
- **When shown**: When user clicks artifact button in message list OR when artifact is streaming and reaches threshold

### 3. Artifact Content (Right Side)
- **Location**: Right side of split-screen panel
- **Components**:
  - `TextArtifactContent` - Renders markdown text
  - `ArtifactCloseButton` - Closes the artifact panel
- **Purpose**: Displays the actual artifact content (text, code, etc.)

### Flow:
```
1. AI calls createDocument tool
   ↓
2. Tool generates document ID and streams metadata to UI
   ↓
3. DocumentPreview appears in message list:
   - If panel CLOSED: Shows preview card with content (overflow hidden)
   - If panel OPEN: Shows "Creating..." button
   ↓
4. Content streams to artifact state (updates preview card in real-time)
   - DataStreamHandler processes data-textDelta events
   - Artifact state updates in real-time
   ↓
5. After streaming completes:
   - Server saves complete content to Supabase
   - Document persisted with same ID as streamed to UI
   ↓
6. User clicks preview card OR content reaches threshold
   ↓
7. ArtifactPanel opens (split-screen)
   ↓
8. Left: Chat messages, Right: Artifact content
   - Component fetches document from Supabase via SWR (if available)
   - Falls back to artifact.content if fetch fails or during streaming
   ↓
9. DocumentPreview switches to button mode (compact view)
   ↓
10. User can close artifact panel (preview card reappears)
    - Document persists in Supabase
    - Can be fetched again later via SWR
```

## Current State

✅ **Already Implemented:**
- DataStream pattern (DataStreamProvider, DataStreamHandler)
- Custom data types infrastructure
- SWR setup (ready to use)
- API routes structure
- **Supabase integration** (database client, types, API routes)
- **Document persistence** (saves to Supabase after streaming)
- **SWR document fetching** (`useDocument` hook)

✅ **Completed:**
- Artifact data types in stream
- Artifact state management (useArtifact hook with SWR)
- Artifact creation tool (with ID synchronization)
- Artifact server handler (with Supabase persistence)
- Artifact UI components (DocumentPreview, ArtifactPanel, etc.)
- DataStreamHandler artifact processing
- Document fetching via SWR

**Note**: This implementation follows the database + SWR pattern. See `artifact-database-swr-supabase-implementation.md` for complete details.

---

## Phase 1: Foundation (Data Types & State)

### Step 1.1: Add Artifact Types to Stream

**File**: `features/ai-assistant/types/stream.ts`

**Changes**:
- Uncomment and define artifact types
- Add artifact metadata types

```typescript
export type ShopMateUIDataTypes = {
  // ... existing types ...


  // Artifact types
  textDelta: string;              // Text content chunks
  artifactId: string;              // Artifact document ID
  artifactTitle: string;           // Artifact title
  artifactKind: 'text' | 'code' | 'sheet'; // Artifact type
  artifactStatus: 'idle' | 'streaming' | 'complete'; // Artifact status
  artifactClear: null;             // Clear artifact signal
};
```

**Why**: Defines the data structure for artifact streaming

---

### Step 1.2: Create Artifact State Management

**Option A: Use SWR (Recommended - matches reference)**

**File**: `features/ai-assistant/hooks/use-artifact.ts`

```typescript
import useSWR from 'swr';

interface UIArtifact {
  documentId: string;
  title: string;
  content: string;
  kind: 'text' | 'code' | 'sheet';
  status: 'idle' | 'streaming' | 'complete';
  isVisible: boolean;
}

const initialArtifactData: UIArtifact = {
  documentId: "init",
  title: "",
  content: "",
  kind: "text",
  status: "idle",
  isVisible: false,
};

export function useArtifact() {
  const { data: artifact, mutate: setArtifact } = useSWR<UIArtifact>(
    "artifact",
    null, // No fetcher - manual updates
    {
      fallbackData: initialArtifactData,
    }
  );

  return {
    artifact: artifact || initialArtifactData,
    setArtifact,
  };
}
```

**Option B: Use React Context (Alternative - consistent with current patterns)**

**File**: `features/ai-assistant/hooks/use-artifact.ts`

```typescript
import { createContext, useContext, useState, useMemo } from 'react';

// Similar to DataStreamProvider pattern
// ... implementation
```

**Decision**: Use SWR (matches reference project, better for future persistence)

**Why**: Global state shared across components, easy to swap for database later

---

## Phase 2: Server-Side (Tool & Handler)

### Step 2.1: Create Artifact Creation Tool

**File**: `features/ai-assistant/tools/create-document/create-document-tool.ts`

**Purpose**: Tool that AI can call to create a text artifact

```typescript
import { dynamicTool, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod/v3';
import { generateUUID } from '@/features/ai-assistant/lib/utils';
import type { ShopMateUIDataTypes } from '../../types/stream';

export const createDocumentTool = (
  dataStream?: UIMessageStreamWriter<ShopMateUIDataTypes>
) => dynamicTool({
  description: "Create a text document for writing, editing, or content creation. Use this for substantial content (>10 lines) that users will likely save or reuse.",
  parameters: z.object({
    title: z.string().describe("The title of the document"),
    kind: z.enum(["text", "code", "sheet"]).default("text").describe("The type of document"),
  }),
  execute: async ({ title, kind = "text" }) => {
    const id = generateUUID();


    // Send artifact metadata to UI
    dataStream?.write({

      type: "data-artifactId",

      data: id,

      transient: true

    });
    dataStream?.write({

      type: "data-artifactTitle",

      data: title,

      transient: true

    });
    dataStream?.write({

      type: "data-artifactKind",

      data: kind,

      transient: true

    });
    dataStream?.write({

      type: "data-artifactStatus",

      data: "streaming",

      transient: true

    });
    dataStream?.write({

      type: "data-artifactClear",

      data: null,

      transient: true

    });


    // Trigger artifact handler (will be called separately)
    // For now, return success - handler will stream content


    return {
      id,
      title,
      kind,
      message: "Document created. Content will be generated and displayed in the artifact panel.",
    };
  },
});
```

**Why**: Allows AI to create artifacts via tool calls

---

### Step 2.2: Create Text Artifact Handler

**File**: `features/ai-assistant/artifacts/text/server.ts`

**Purpose**: Generates text content, streams it to the artifact, and saves to Supabase

**Key Features**:
- ✅ Streams content in real-time via `data-textDelta`
- ✅ Saves complete content to Supabase after streaming
- ✅ Uses `documentId` parameter for persistence
- ✅ Non-blocking: If save fails, user still sees content (from streaming)

```typescript
import { streamText, smoothStream } from 'ai';
import { openai } from '@ai-sdk/openai';
import type { UIMessageStreamWriter } from 'ai';
import { supabaseAdmin } from '@/shared/infrastructure/supabase/server/create-service-client';
import { logger } from '@/features/ai-assistant/lib/logger';
import { generateUUID } from '@/features/ai-assistant/lib/utils';

interface CreateTextDocumentParams {
  title: string;
  dataStream: UIMessageStreamWriter<any>;
  documentId?: string; // Optional: ID for Supabase persistence
}

export async function createTextDocument({
  title,
  dataStream,
  documentId,
}: CreateTextDocumentParams): Promise<string> {
  let fullContent = "";

  // Stream text generation
  const { fullStream } = streamText({
    model: openai('o3-mini'),
    system: "Write about the given topic. Markdown is supported. Use headings wherever appropriate. Be clear and concise.",
    experimental_transform: smoothStream({

      chunking: "word",
      delayInMs: 10,
    }),
    prompt: title,
  });

  // Stream text deltas to UI (real-time)
  for await (const delta of fullStream) {
    if (delta.type === "text-delta") {
      const text = delta.text;
      fullContent += text;

      dataStream.write({
        type: "data-textDelta",
        data: text,
        transient: true,
      });
    }
  }

  // Signal completion
  dataStream.write({
    type: "data-artifactStatus",
    data: "complete",
    transient: true,
  });

  // Save to Supabase AFTER streaming completes (non-blocking)
  if (documentId) {
    try {
      const tempUserId = generateUUID(); // TODO: Replace with actual user ID
      await supabaseAdmin.from('Document').insert({
        id: documentId,
        title,
        content: fullContent,
        kind: 'text',
        userId: tempUserId,
        createdAt: new Date().toISOString(),
      });
      logger.info(`[Text Artifact] Successfully saved document to Supabase: ${documentId}`);
    } catch (error) {
      logger.error('[Text Artifact] Supabase save error:', error);
      // Don't throw - user already sees content via streaming
    }
  }

  return fullContent;
}
```

**Why**:

- Handles the actual content generation and streaming
- **Saves to database for persistence** (after streaming completes)
- **Non-blocking**: Database save doesn't affect streaming experience

**Note**: See `artifact-database-swr-supabase-implementation.md` Phase 3.1 for complete implementation details.

---

### Step 2.3: Integrate Tool in Agent

**File**: `features/ai-assistant/agents/technical-discussion/agent.ts` and `recommendation/agent.ts`

**Changes**:
- Import `createDocumentTool` and `createTextDocument`
- Add to tools object with shared ID mechanism
- Handle artifact creation in `onStepFinish` callback
- Pass `documentId` to `createTextDocument` for Supabase persistence

**Key Points**:
- ✅ **ID Synchronization**: Tool and agent use shared ID via closure (see Issue 4 in `artifact-database-swr-supabase-implementation.md`)
- ✅ **Persistence**: Agent passes `documentId` to handler for Supabase save
- ✅ **Timing**: Handler called in `onStepFinish` (after tool executes)

```typescript
import { createDocumentTool } from '@/features/ai-assistant/artifacts/text/create-document-tool';
import { createTextDocument } from '@/features/ai-assistant/artifacts/text/server';
import { generateUUID } from '@/features/ai-assistant/lib/utils';

// Shared document ID storage for syncing tool and agent
let sharedDocumentId: string | null = null;

const result = streamText({
  // ... existing config ...
  tools: dataStream ? {
    createDocument: createDocumentTool(
      dataStream,
      () => sharedDocumentId, // Getter
      (id: string) => { sharedDocumentId = id; } // Setter
    ),
  } : undefined,

  onStepFinish: async ({ toolCalls }) => {
    if (!dataStream || !toolCalls) return;

    for (const toolCall of toolCalls) {
      if (toolCall.toolName === 'createDocument') {
        const input = 'input' in toolCall ? toolCall.input : undefined;
        if (!input) continue;

        const { title, kind } = input as { title: string; kind?: 'text' | 'code' | 'sheet' };


        // Use shared ID that tool set (ensures sync)
        const documentId = sharedDocumentId || generateUUID();


        if (kind === 'text' || !kind) {
          await createTextDocument({
            title,
            dataStream,
            documentId, // Pass for Supabase persistence
          });
        }


        sharedDocumentId = null; // Reset for next call
      }
    }
  },
});
```

**Why**:

- Makes the tool available to AI during conversations
- **Ensures ID sync** between tool and agent
- **Enables persistence** by passing documentId to handler

**Note**: See `artifact-database-swr-supabase-implementation.md` Phase 3.2 and Issue 4 for complete implementation details.

---

## Phase 3: Client-Side (UI & Processing)

### Step 3.1: Update DataStreamHandler

**File**: `features/ai-assistant/data-stream/data-stream-handler.tsx`

**Changes**: Add artifact processing logic

```typescript
import { useArtifact } from '../hooks/use-artifact';

export function DataStreamHandler() {
  const { dataStream, setDataStream } = useDataStream();
  const { artifact, setArtifact } = useArtifact();
  // ... existing hooks ...

  useEffect(() => {
    if (!dataStream?.length) return;


    const newDeltas = dataStream.slice();
    setDataStream([]);


    for (const delta of newDeltas) {
      switch (delta.type) {
        // ... existing cases ...


        // Artifact cases
        case "data-artifactId":
          setArtifact(prev => ({ ...prev, documentId: delta.data }));
          break;
        case "data-artifactTitle":
          setArtifact(prev => ({ ...prev, title: delta.data }));
          break;
        case "data-artifactKind":
          setArtifact(prev => ({ ...prev, kind: delta.data }));
          break;
        case "data-artifactStatus":
          setArtifact(prev => ({ ...prev, status: delta.data }));
          break;
        case "data-textDelta":
          setArtifact(prev => ({

            ...prev,

            content: prev.content + delta.data,
            status: "streaming",
          }));
          break;
        case "data-artifactClear":
          setArtifact({
            documentId: "init",
            title: "",
            content: "",
            kind: "text",
            status: "idle",
            isVisible: false,
          });
          break;
      }
    }
  }, [dataStream, setDataStream, setArtifact]);


  return null;
}
```

**Why**: Processes artifact data from stream and updates artifact state

---

### Step 3.2: Create Document Preview Component (Conditional Rendering)

**File**: `features/ai-assistant/artifacts/components/document-preview.tsx`

**Purpose**: Conditionally renders preview card (when panel closed) or button (when panel open)

**Key Behavior**:
- **When `artifact.isVisible === false`**: Shows preview card with content (overflow hidden, ~257px height)
- **When `artifact.isVisible === true`**: Shows small button (`DocumentToolResult` or `DocumentToolCall`)

```typescript
'use client';

import { useArtifact } from '@/features/ai-assistant/artifacts/hooks/use-artifact';
import { useDocument } from '@/features/ai-assistant/artifacts/hooks/use-document';
import { useMemo, useRef, useEffect } from 'react';
import { DocumentToolCall } from './document-tool-call';
import { DocumentToolResult } from './document-tool-result';
import { DocumentHeader } from './document-header';
import { DocumentContent } from './document-content';
import { DocumentSkeleton } from './document-skeleton';

interface DocumentPreviewProps {
  isReadonly?: boolean;
  result?: {
    id: string;
    title: string;
    kind: 'text' | 'code' | 'sheet';
  };
  args?: {
    title: string;
    kind: 'text' | 'code' | 'sheet';
  };
}

export function DocumentPreview({
  isReadonly = false,
  result,
  args,
}: DocumentPreviewProps) {
  const { artifact, setArtifact } = useArtifact();
  const hitboxRef = useRef<HTMLDivElement>(null);

  // Track bounding box for animation
  useEffect(() => {
    const boundingBox = hitboxRef.current?.getBoundingClientRect();
    if (artifact.documentId && boundingBox) {
      setArtifact((currentArtifact) => ({
        ...currentArtifact,
        boundingBox: {
          left: boundingBox.x,
          top: boundingBox.y,
          width: boundingBox.width,
          height: boundingBox.height,
        },
      }));
    }
  }, [artifact.documentId, setArtifact]);

  // When artifact panel is OPEN: show button only
  if (artifact.isVisible) {
    if (result) {
      return (
        <DocumentToolResult
          isReadonly={isReadonly}
          result={{ id: result.id, title: result.title, kind: result.kind }}
          type="create"
        />
      );
    }

    if (args) {
      return (
        <DocumentToolCall
          args={{ title: args.title, kind: args.kind }}
          isReadonly={isReadonly}
          type="create"
        />
      );
    }
  }

  // When artifact panel is CLOSED: show preview card
  // Priority: Fetched document (Supabase) > Artifact state (streaming) > Result/args
  const { document: fetchedDocument } = useDocument(
    result?.id && artifact.status !== 'streaming' ? result.id : null
  );

  const document = useMemo(() => {
    // Priority 1: Fetched document from Supabase (persisted)
    if (fetchedDocument) {
      return {
        title: fetchedDocument.title,
        kind: fetchedDocument.kind as 'text' | 'code' | 'sheet',
        content: fetchedDocument.content || '',
        id: fetchedDocument.id,
      };
    }

    // Priority 2: Artifact state (during streaming or if not fetched yet)
    if (artifact.content || artifact.title || artifact.documentId !== 'init') {
      return {
        title: artifact.title || result?.title || args?.title || 'Untitled Document',
        kind: artifact.kind || result?.kind || args?.kind || 'text',
        content: artifact.content || '', // Streaming content updates here
        id: artifact.documentId !== 'init' ? artifact.documentId : (result?.id || ''),
      };
    }

    // Priority 3: Result/args (tool call/result)
    if (result) {
      return {
        title: result.title || 'Untitled Document',
        kind: result.kind || 'text',
        content: '', // Content will come from artifact state or fetched document
        id: result.id,
      };
    }

    return null;
  }, [fetchedDocument, artifact, result, args]);

  if (!document) {
    return <LoadingSkeleton artifactKind={result?.kind ?? args?.kind ?? 'text'} />;
  }

  return (
    <div className="relative w-full cursor-pointer" ref={hitboxRef}>
      {/* Clickable hitbox layer - entire card is clickable */}
      <HitboxLayer
        hitboxRef={hitboxRef}
        result={result}
        setArtifact={setArtifact}
      />


      {/* Preview Card */}
      <DocumentHeader
        isStreaming={artifact.status === 'streaming'}
        kind={document.kind}
        title={document.title}
      />
      <DocumentContent document={document} />
    </div>
  );
}

// Hitbox layer - makes entire card clickable
function HitboxLayer({
  hitboxRef,
  result,
  setArtifact,
}: {
  hitboxRef: React.RefObject<HTMLDivElement>;
  result?: any;
  setArtifact: any;
}) {
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    const boundingBox = event.currentTarget.getBoundingClientRect();

    setArtifact((artifact: any) =>
      artifact.status === 'streaming'
        ? { ...artifact, isVisible: true }
        : {
            ...artifact,
            title: result?.title || artifact.title,
            documentId: result?.id || artifact.documentId,
            kind: result?.kind || artifact.kind,
            isVisible: true,
            boundingBox: {
              left: boundingBox.x,
              top: boundingBox.y,
              width: boundingBox.width,
              height: boundingBox.height,
            },
          }
    );
  };

  return (
    <div
      aria-hidden="true"
      className="absolute top-0 left-0 z-10 size-full rounded-xl"
      onClick={handleClick}
      ref={hitboxRef}
      role="presentation"
    >
      <div className="flex w-full items-center justify-end p-4">
        <div className="absolute top-[13px] right-[9px] rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700">
          <FullscreenIcon />
        </div>
      </div>
    </div>
  );
}
```

**File**: `features/ai-assistant/components/message/document-header.tsx`

**Purpose**: Header of preview card (icon, title, expand icon)

```typescript
'use client';

import { FileIcon, LoaderIcon } from 'lucide-react';

interface DocumentHeaderProps {
  title: string;
  kind: 'text' | 'code' | 'sheet';
  isStreaming: boolean;
}

export function DocumentHeader({ title, kind, isStreaming }: DocumentHeaderProps) {
  return (
    <div className="flex flex-row items-start justify-between gap-2 rounded-t-2xl border border-b-0 p-4 dark:border-zinc-700 dark:bg-muted">
      <div className="flex flex-row items-start gap-3 sm:items-center">
        <div className="text-muted-foreground">
          {isStreaming ? (
            <div className="animate-spin">
              <LoaderIcon size={16} />
            </div>
          ) : (
            <FileIcon size={16} />
          )}
        </div>
        <div className="font-medium">{title}</div>
      </div>
      <div className="w-8" />
    </div>
  );
}
```

**File**: `features/ai-assistant/components/message/document-content.tsx`

**Purpose**: Content preview with overflow hidden (~257px height)

```typescript
'use client';

import { useArtifact } from '@/features/ai-assistant/hooks/use-artifact';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/shared/lib/utils';

interface DocumentContentProps {
  document: {
    title: string;
    kind: 'text' | 'code' | 'sheet';
    content: string;
    id: string;
  };
}

export function DocumentContent({ document }: DocumentContentProps) {
  const { artifact } = useArtifact();

  const containerClassName = cn(
    'h-[257px] overflow-y-scroll rounded-b-2xl border border-t-0 dark:border-zinc-700 dark:bg-muted',
    {
      'p-4 sm:px-14 sm:py-16': document.kind === 'text',
      'p-0': document.kind === 'code',
    }
  );

  return (
    <div className={containerClassName}>
      {document.kind === 'text' ? (
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{document.content}</ReactMarkdown>
        </div>
      ) : document.kind === 'code' ? (
        <pre className="p-4">
          <code>{document.content}</code>
        </pre>
      ) : null}
    </div>
  );
}
```

**File**: `features/ai-assistant/components/message/document-tool-call.tsx`

**Purpose**: Small button shown when artifact panel is open (while creating)

```typescript
'use client';

import { useArtifact } from '@/features/ai-assistant/hooks/use-artifact';
import { FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoaderIcon } from '@/components/icons';

interface DocumentToolCallProps {
  type: 'create' | 'update';
  args: { title?: string; description?: string; kind?: string };
  isReadonly?: boolean;
}

export function DocumentToolCall({ type, args, isReadonly }: DocumentToolCallProps) {
  const { setArtifact } = useArtifact();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isReadonly) return;


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

  return (
    <Button
      variant="outline"
      className="flex w-fit cursor-pointer flex-row items-start gap-3 rounded-xl px-3 py-2"
      onClick={handleClick}
      type="button"
      disabled={isReadonly}
    >
      <div className="mt-1 text-muted-foreground">
        {type === 'create' ? <FileIcon size={16} /> : <PencilEditIcon size={16} />}
      </div>
      <div className="text-left">
        {type === 'create'

          ? `Creating "${args.title || 'document'}"`
          : `Updating "${args.description || 'document'}"`
        }
      </div>
      <div className="mt-1 animate-spin">
        <LoaderIcon size={16} />
      </div>
    </Button>
  );
}
```

**File**: `features/ai-assistant/components/message/document-tool-result.tsx`

**Purpose**: Small button shown when artifact panel is open (after creation)

```typescript
'use client';

import { useArtifact } from '@/features/ai-assistant/hooks/use-artifact';
import { FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocumentToolResultProps {
  type: 'create' | 'update';
  result: {
    id: string;
    title: string;
    kind: 'text' | 'code' | 'sheet';
  };
  isReadonly?: boolean;
}

export function DocumentToolResult({ type, result, isReadonly }: DocumentToolResultProps) {
  const { setArtifact } = useArtifact();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isReadonly) return;


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
        <FileIcon size={16} />
      </div>
      <div className="text-left">
        {`${actionText} "${result.title}"`}
      </div>
    </Button>
  );
}
```

**Why**:

- Preview card shows when panel is closed (with content preview, overflow hidden)
- Button shows when panel is open (compact view)
- Entire preview card is clickable to open artifact panel

---

### Step 3.3: Create Split-Screen Artifact Component

**File**: `features/ai-assistant/components/artifact/artifact-panel.tsx`

**Purpose**: Full-screen split view with chat on left, artifact on right

```typescript
'use client';

import { useArtifact } from '@/features/ai-assistant/hooks/use-artifact';
import { motion, AnimatePresence } from 'framer-motion';
import { ArtifactMessages } from './artifact-messages';
import { TextArtifactContent } from './text-artifact-content';
import { ArtifactCloseButton } from './artifact-close-button';

interface ArtifactPanelProps {
  chatId: string;
  messages: any[];
  status: any;
  // ... other chat props
}

export function ArtifactPanel({ chatId, messages, status, ...chatProps }: ArtifactPanelProps) {
  const { artifact, setArtifact } = useArtifact();

  if (!artifact.isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        animate={{ opacity: 1 }}
        className="fixed top-0 left-0 z-50 flex h-screen w-screen flex-row bg-background"
        exit={{ opacity: 0, transition: { delay: 0.4 } }}
        initial={{ opacity: 1 }}
      >
        {/* Left Side: Chat Messages */}
        <motion.div
          animate={{ width: '50%' }}
          className="flex h-full flex-col border-r bg-background"
          exit={{ width: '100%' }}
          initial={{ width: '100%' }}
        >
          <ArtifactMessages
            chatId={chatId}
            messages={messages}
            status={status}
            {...chatProps}
          />
        </motion.div>

        {/* Right Side: Artifact Content */}
        <motion.div
          animate={{ width: '50%' }}
          className="flex h-full flex-col bg-background"
          exit={{ width: 0 }}
          initial={{ width: 0 }}
        >
          <div className="relative h-full overflow-auto">
            <ArtifactCloseButton />


            {artifact.kind === 'text' && (
              <TextArtifactContent artifact={artifact} />
            )}


            {/* Future: code, sheet, image artifacts */}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
```

**Why**: Creates the split-screen layout (chat left, artifact right)

---

### Step 3.4: Create Artifact Messages Component

**File**: `features/ai-assistant/components/artifact/artifact-messages.tsx`

**Purpose**: Displays chat messages on the left side when artifact is open

```typescript
'use client';

import { useRef } from 'react';

interface ArtifactMessagesProps {
  chatId: string;
  messages: any[];
  status: any;
  // ... other props
}

export function ArtifactMessages({

  chatId,

  messages,

  status,
  ...props

}: ArtifactMessagesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="flex h-full flex-col items-center gap-4 overflow-y-scroll px-4 pt-20"
      ref={containerRef}
    >
      {messages.map((message, index) => (
        <Message
          key={message.id}
          message={message}
          isLoading={status === 'streaming' && index === messages.length - 1}
          // ... other props
        />
      ))}
    </div>
  );
}
```

**Why**: Shows chat messages on left side when artifact is visible

---

### Step 3.5: Create Text Artifact Content Component

**File**: `features/ai-assistant/components/artifact/text-artifact-content.tsx`

**Purpose**: Renders the actual text artifact content on the right side

```typescript
'use client';

import { useArtifact } from '@/features/ai-assistant/artifacts/hooks/use-artifact';
import { useDocument } from '@/features/ai-assistant/artifacts/hooks/use-document';
import { MarkdownText } from '@/features/ai-assistant/components/ui/markdown-text';

export function TextArtifactContent() {
  const { artifact } = useArtifact();

  // Fetch document from Supabase
  const { document: fetchedDocument } = useDocument(
    artifact.documentId !== 'init' ? artifact.documentId : null
  );

  // Smart content priority:
  // - During streaming: Use artifact.content (real-time updates)
  // - After streaming: Use fetchedDocument.content (persisted version)
  // - Fallback: Use artifact.content if fetched document unavailable
  const content =
    artifact.status === 'streaming'
      ? artifact.content // During streaming, always use real-time artifact content
      : fetchedDocument?.content || artifact.content || ''; // After streaming, prefer fetched, then artifact

  return (
    <div className="h-full overflow-auto p-6 text-black">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {fetchedDocument?.title || artifact.title || 'Untitled Document'}
        </h1>
        {artifact.status === 'streaming' && (
          <div className="mt-2 text-sm text-muted-foreground">
            Generating...
          </div>
        )}
      </div>

      {/* Content */}
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <MarkdownText>{content}</MarkdownText>
      </div>
    </div>
  );
}
```

**Why**:

- Displays the text artifact content with markdown rendering
- **Fetches from Supabase** via SWR for persistence
- **Falls back to streaming content** during streaming or if fetch fails
- **Smart priority**: Streaming content > Fetched content > Artifact content

**Note**: See `artifact-database-swr-supabase-implementation.md` Phase 4.4 for complete implementation details.

---

### Step 3.6: Create Artifact Close Button

**File**: `features/ai-assistant/components/artifact/artifact-close-button.tsx`

**Purpose**: Button to close the artifact panel

```typescript
'use client';

import { useArtifact } from '@/features/ai-assistant/hooks/use-artifact';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function ArtifactCloseButton() {
  const { setArtifact } = useArtifact();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-4 right-4 z-10"
      onClick={() => setArtifact(prev => ({ ...prev, isVisible: false }))}
    >
      <X size={20} />
    </Button>
  );
}
```

**Why**: Allows users to close the artifact panel

---

### Step 3.7: Integrate Artifact Panel in Chat Container

**File**: `features/ai-assistant/chat-container.tsx`

**Changes**: Add ArtifactPanel component

```typescript
import { ArtifactPanel } from '@/features/ai-assistant/components/artifact/artifact-panel';

export const ChatContainer = ({ chatId, userType }: ChatContainerProps) => {
  // ... existing code ...


  return (
    <>
      {/* Existing chat UI */}
      <div className="flex flex-col h-full">
        {/* Messages, input, etc. */}
      </div>


      {/* Artifact Panel (split-screen) */}
      <ArtifactPanel
        chatId={chatId}
        messages={messages}
        status={status}
        // ... other props
      />
    </>
  );
};
```

**Why**: Integrates artifact panel into chat interface

---

### Step 3.8: Add Document Tool Components to Message Rendering

**File**: `features/ai-assistant/components/message-list.tsx` or message renderer

**Changes**: Render DocumentToolCall/Result when tool calls are present

```typescript
import { DocumentToolCall } from './message/document-tool-call';
import { DocumentToolResult } from './message/document-tool-result';

// In message rendering:
{message.parts?.map((part, index) => {
  if (part.type === 'tool-call' && part.toolName === 'createDocument') {
    return (
      <DocumentToolCall
        key={index}
        type="create"
        args={part.args}
      />
    );
  }


  if (part.type === 'tool-result' && part.toolName === 'createDocument') {
    return (
      <DocumentToolResult
        key={index}
        type="create"
        result={part.result}
      />
    );
  }


  // ... other part types
})}
```

**Why**: Shows artifact buttons in message list when artifacts are created

---

## Phase 4: Enhancements (Optional)

### Step 4.1: Add Artifact Visibility Logic

**File**: `features/ai-assistant/hooks/use-artifact.ts`

**Changes**: Auto-show artifact when content reaches threshold

```typescript
// In DataStreamHandler or useArtifact:
if (artifact.status === "streaming" &&

    artifact.content.length > 400 &&

    artifact.content.length < 450) {
  setArtifact(prev => ({ ...prev, isVisible: true }));
}
```

**Why**: Better UX - shows artifact when enough content is generated

---

### Step 4.2: Add Artifact Editing (Future)

**File**: `features/ai-assistant/components/artifact/text-artifact.tsx`

**Changes**: Add edit mode with textarea

**Why**: Allow users to edit generated content

---

### Step 4.3: Add Artifact Persistence ✅ **COMPLETE**

**File**: `features/ai-assistant/artifacts/text/server.ts` and `features/ai-assistant/artifacts/hooks/use-document.ts`

**Implementation**:

- ✅ **Server-side**: Saves to Supabase after streaming completes
- ✅ **Client-side**: Fetches via SWR using `useDocument` hook
- ✅ **Automatic**: Persistence happens automatically after streaming
- ✅ **Fallback**: Components fall back to streaming content if database unavailable

**Why**:

- ✅ Persist artifacts across sessions
- ✅ Version history support (composite primary key)
- ✅ Better performance for large artifacts
- ✅ Independent fetching per component

**Note**: See `artifact-database-swr-supabase-implementation.md` for complete implementation details.

---

## Implementation Order

### Recommended Sequence:

1. ✅ **Step 1.1**: Add artifact types to stream.ts
2. ✅ **Step 1.2**: Create useArtifact hook (SWR)
3. ✅ **Step 3.1**: Update DataStreamHandler to process artifacts
4. ✅ **Step 3.2**: Create DocumentPreview component (conditional rendering)
   - DocumentHeader (preview card header)
   - DocumentContent (preview card content, overflow hidden)
   - DocumentToolCall (button when panel open)
   - DocumentToolResult (button when panel open)
   - DocumentSkeleton (loading state)
5. ✅ **Step 3.3**: Create ArtifactPanel (split-screen container)
6. ✅ **Step 3.4**: Create ArtifactMessages (left side)
7. ✅ **Step 3.5**: Create TextArtifactContent (right side)
8. ✅ **Step 3.6**: Create ArtifactCloseButton
9. ✅ **Step 3.7**: Integrate ArtifactPanel in ChatContainer
10. ✅ **Step 2.1**: Create artifact tool
11. ✅ **Step 2.2**: Create text handler
12. ✅ **Step 2.3**: Integrate tool in agent
13. ✅ **Step 3.8**: Add DocumentPreview to message rendering
14. ⏳ **Step 4.1**: Add visibility logic (optional)
15. ⏳ **Step 4.2**: Add editing (future)
16. ⏳ **Step 4.3**: Add persistence (future)

**Why this order**:

- Foundation first (types, state)
- UI components next (preview card, split-screen)
- Then server-side (tool, handler)
- Finally integration and enhancements

---

## Testing Checklist

- [ ] Artifact types defined in stream.ts
- [ ] useArtifact hook works (SWR or Context)
- [ ] DataStreamHandler processes artifact data
- [ ] TextArtifact component renders
- [ ] Artifact appears in layout
- [ ] Tool can be called by AI
- [ ] Handler generates and streams content
- [ ] Content appears in artifact UI
- [ ] Artifact closes when clicked
- [ ] Multiple artifacts work correctly

---

## Dependencies

### Required:
- ✅ `ai` package (already installed)
- ✅ `swr` package (already installed - v2.3.7)
- ✅ `react-markdown` (already installed - v10.1.0)
- ✅ `zod` (already installed - v4.1.12)
- ✅ `@supabase/supabase-js` (already installed - for database operations)

### Optional:
- ✅ `remark-gfm` (for GitHub Flavored Markdown - already installed - v4.0.1)
- ✅ `framer-motion` (for artifact panel animations - already installed)

**All dependencies are ready!** ✅

### Environment Variables (Required for Supabase):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

See `artifact-database-swr-supabase-implementation.md` for setup instructions.

---

## Files to Create

### Core Artifact Files:
1. ✅ `features/ai-assistant/artifacts/hooks/use-artifact.ts` - Artifact state hook (SWR)
2. ✅ `features/ai-assistant/artifacts/hooks/use-document.ts` - SWR hook for fetching documents from Supabase
3. ✅ `features/ai-assistant/artifacts/text/create-document-tool.ts` - Creation tool (with ID sync)
4. ✅ `features/ai-assistant/artifacts/text/server.ts` - Text handler (with Supabase persistence)
5. ✅ `features/ai-assistant/artifacts/components/artifact-panel.tsx` - Split-screen container
6. ✅ `features/ai-assistant/artifacts/components/artifact-messages.tsx` - Left side (chat messages)
7. ✅ `features/ai-assistant/artifacts/text/text-artifact-content.tsx` - Right side (text content with SWR)
8. ✅ `features/ai-assistant/artifacts/components/artifact-close-button.tsx` - Close button
9. ✅ `features/ai-assistant/artifacts/components/document-preview.tsx` - **Main component** (conditional rendering with SWR)
10. ✅ `features/ai-assistant/artifacts/components/document-header.tsx` - Preview card header
11. ✅ `features/ai-assistant/artifacts/components/document-content.tsx` - Preview card content (overflow hidden)
12. ✅ `features/ai-assistant/artifacts/components/document-tool-call.tsx` - Button (when panel open, creating)
13. ✅ `features/ai-assistant/artifacts/components/document-tool-result.tsx` - Button (when panel open, created)
14. ✅ `features/ai-assistant/artifacts/components/document-skeleton.tsx` - Loading skeleton

### Database Files:
15. ✅ `lib/supabase/client.ts` - Supabase admin client
16. ✅ `shared/infrastructure/supabase/types.ts` - Database types
17. ✅ `lib/supabase/migrations/001_create_document_table.sql` - Database schema
18. ✅ `app/api/document/route.ts` - Document API routes (GET, POST, DELETE)

## Files to Modify

1. ✅ `features/ai-assistant/types/stream.ts` - Add artifact types
2. ✅ `features/ai-assistant/data-stream/data-stream-handler.tsx` - Process artifacts
3. ✅ `features/ai-assistant/agents/technical-discussion/agent.ts` - Add tool with ID sync
4. ✅ `features/ai-assistant/agents/recommendation/agent.ts` - Add tool with ID sync
5. ✅ `features/ai-assistant/chat-container.tsx` - Add ArtifactPanel
6. ✅ `features/ai-assistant/components/message-part-orchestrator-renderer.tsx` - Add DocumentPreview rendering

---

## Success Criteria

✅ **Minimum Viable Product:**
- AI can create text artifacts via tool call
- Content streams in real-time to artifact panel
- Artifact displays markdown-formatted text
- User can close artifact

✅ **Enhanced Version:**
- ✅ Artifact auto-shows when content threshold reached
- ⏳ Artifact can be edited (future)
- ✅ **Artifact persists across sessions** (via Supabase)
- ✅ **Multiple artifacts supported** (via database)
- ✅ **Version history** (composite primary key enables multiple versions)
- ✅ **SWR caching** (automatic caching and revalidation)

---

## Future Enhancements

1. **Code Artifacts**: Syntax highlighting, language detection
2. **Sheet Artifacts**: Spreadsheet-like interface
3. **Image Artifacts**: Image generation and display
4. **Artifact History**: Version tracking
5. **Artifact Sharing**: Export/save functionality
6. **Artifact Suggestions**: AI-powered editing suggestions

---

**Status**: ✅ **Implementation Complete**

**Key Features Implemented**:
- ✅ Real-time streaming via DataStream pattern
- ✅ **Database persistence** via Supabase
- ✅ **SWR-based fetching** for client-side data management
- ✅ **ID synchronization** between tool and agent
- ✅ **Smart fallback** strategy (streaming > fetched > artifact state)
- ✅ **Version history support** (composite primary key)

**Related Documentation**:
- See `artifact-database-swr-supabase-implementation.md` for complete database integration details
- See `datastream-implementation-plan.md` for DataStream pattern details

**Next Steps** (Future Enhancements):
- Add artifact editing functionality
- Add version navigation UI
- Add document actions (save, delete, export)
- Optimize for large documents

