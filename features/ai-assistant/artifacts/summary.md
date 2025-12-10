# Data Streaming & Artifacts Architecture

## Overview

This document explains how data streaming and artifacts work, and what runs on the server vs client.

---

## Server-Side (Node.js/Next.js API Routes)

### 1. API Route (`app/api/ai-assistant/route.ts`)

- Receives HTTP POST requests
- Creates `UIMessageStream` with `dataStream` writer
- Routes to appropriate agent
- Merges agent stream with `dataStream`
- Converts to SSE (Server-Sent Events) format
- Returns streaming Response

### 2. Agents (`features/ai-assistant/agents/*/agent.ts`)

- Process user queries
- Call AI tools (e.g., `createDocument`)
- Receive `dataStream: UIMessageStreamWriter` parameter
- Can write custom data types to stream

### 3. Artifact Server Handlers (`features/ai-assistant/artifacts/*/server.ts`)

- `createTextDocument()` - Generates text content
- `createSheetDocument()` - Generates CSV content

Both handlers:
- Use AI SDK (`streamText`, `streamObject`) to generate content
- Write deltas to `dataStream.write()` in real-time:
  - `data-textDelta` (text chunks)
  - `data-sheetDelta` (CSV updates)
  - `data-artifactStatus` (completion status)
- Save to Supabase after streaming completes

### 4. Database Operations

- Supabase inserts (after streaming)
- Version history management
- Document persistence

---

## Client-Side (React Components)

### 1. Data Stream Provider (`features/ai-assistant/data-stream/data-stream-provider.tsx`)

- React Context provider
- Maintains `dataStream` array state
- Provides `useDataStream()` hook

### 2. Data Stream Handler (`features/ai-assistant/data-stream/data-stream-handler.tsx`)

- Invisible processor component
- Listens to `dataStream` changes
- Processes each data part:
  - `data-textDelta` → Updates artifact content
  - `data-sheetDelta` → Updates artifact content
  - `data-artifactStatus` → Updates artifact status
  - `data-id`, `data-title`, `data-kind` → Updates artifact metadata
- Updates artifact state via `useArtifact()` hook

### 3. Artifact Components (All Client Components)

- `SheetArtifactContent` - Renders table, handles editing
- `TextArtifactContent` - Renders markdown, handles editing
- `EditableTable` - Cell editing, add row/column
- All use hooks: `useState`, `useEffect`, `useCallback`
- Handle user interactions (clicking, typing, keyboard)

### 4. State Management

- `useArtifact()` - Global artifact state (content, title, status)
- `useDocument()` (SWR) - Fetches from Supabase
- Local component state - Editing state, debounce timers

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    SERVER SIDE                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. API Route (route.ts)                                    │
│     ↓ Creates UIMessageStream with dataStream writer        │
│                                                             │
│  2. Agent (agent.ts)                                        │
│     ↓ Calls createDocument tool                             │
│                                                             │
│  3. Artifact Server Handler (server.ts)                    │
│     ↓ Uses AI SDK (streamText/streamObject)                 │
│     ↓ Writes to dataStream.write():                         │
│       - data-textDelta / data-sheetDelta                    │
│       - data-artifactStatus                                 │
│     ↓ Saves to Supabase (after streaming)                   │
│                                                             │
│  4. Stream Merged & Converted to SSE                        │
│     ↓ Sent over HTTP as Server-Sent Events                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                          ↓ HTTP/SSE
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT SIDE                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. useChat Hook (from AI SDK)                              │
│     ↓ Receives SSE events                                   │
│     ↓ Calls onData callback                                 │
│                                                             │
│  2. DataStreamProvider                                      │
│     ↓ Adds data parts to dataStream array                   │
│                                                             │
│  3. DataStreamHandler (invisible processor)                 │
│     ↓ Watches dataStream changes                            │
│     ↓ Processes each data part                              │
│     ↓ Updates artifact state via useArtifact()             │
│                                                             │
│  4. Artifact Components (SheetArtifactContent, etc.)        │
│     ↓ Read artifact state                                   │
│     ↓ Render UI (table, markdown, etc.)                    │
│     ↓ Handle user interactions (editing, saving)           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary

### Server Responsibilities:
- ✅ Generates content (AI calls)
- ✅ Streams data to client
- ✅ Saves to database
- ❌ No React/UI code

### Client Responsibilities:
- ✅ Receives streamed data
- ✅ Updates UI state
- ✅ Renders components
- ✅ Handles user interactions
- ✅ All React components with hooks

### Key Separation:
**Server generates and streams; Client receives, processes, and displays.**

---

## Important Notes

- All artifact components are **client components** (use `'use client'` directive)
- They need to be client components because they:
  1. Use React hooks (`useState`, `useEffect`, `useCallback`, etc.)
  2. Handle user interactions (editing, clicking, keyboard navigation)
  3. Manage client-side state (editing state, debounce timers, version navigation)
  4. Use browser APIs (clipboard, localStorage, etc.)
  5. Handle real-time updates (streaming content)
