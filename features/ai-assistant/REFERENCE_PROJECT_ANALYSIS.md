# Reference Project Analysis & Integration Plan

> **Purpose**: Comprehensive analysis of `-reference-project` features to be integrated into `features/ai-assistant`
> 
> **Date**: 2025-01-XX
> **Status**: Analysis Complete - Ready for Implementation

---

## Executive Summary

The reference project is a **Chat SDK** built with Next.js and Vercel AI SDK that demonstrates advanced patterns for:
- Real-time AI streaming with structured data
- Artifact system (text, code, sheet, image documents)
- Database-backed persistence with version history
- SWR-based state management
- Advanced UI components and patterns

**Key Finding**: ShopMate already has **basic implementations** of several patterns, but needs **enhancements** to match reference project's robustness.

---

## Current ShopMate Implementation Status

### ✅ Already Implemented

1. **Data Streaming Pattern** (Basic)
   - ✅ `DataStreamProvider` - Context provider for stream data
   - ✅ `DataStreamHandler` - Processor component
   - ✅ `useDataStream` hook
   - ✅ Custom data types (`ShopMateUIDataTypes`)
   - ✅ Integration with `useChat` via `onData` callback

2. **Artifact System** (Partial)
   - ✅ `useArtifact` hook (SWR-based)
   - ✅ Text artifact components
   - ✅ Sheet artifact components
   - ✅ Artifact panel UI
   - ✅ Basic artifact streaming

3. **Hooks** (Partial)
   - ✅ `use-product-stream` - Product state management
   - ✅ `use-cart-stream` - Cart state management
   - ✅ `use-artifact` - Artifact state management

4. **Tools** (Basic)
   - ✅ Product search tool
   - ✅ Cart info tool
   - ✅ Tool renderers

### ⚠️ Partially Implemented / Needs Enhancement

1. **Artifact Server Handlers**
   - ⚠️ Has basic text/sheet handlers
   - ❌ Missing: Proper `createDocumentHandler` pattern
   - ❌ Missing: Update document handlers
   - ❌ Missing: Code artifact handler
   - ❌ Missing: Image artifact handler

2. **Database Persistence**
   - ⚠️ Has Supabase setup
   - ❌ Missing: Proper document table schema (composite key for versioning)
   - ❌ Missing: Version history queries
   - ❌ Missing: Document CRUD operations

3. **SWR Integration**
   - ⚠️ Uses SWR for artifact state
   - ❌ Missing: Document fetching via SWR
   - ❌ Missing: Optimistic updates pattern
   - ❌ Missing: Cache invalidation strategies

4. **Artifact Definitions**
   - ⚠️ Has basic artifact structure
   - ❌ Missing: `Artifact` class pattern
   - ❌ Missing: Actions (copy, version navigation)
   - ❌ Missing: Toolbar items
   - ❌ Missing: Initialize functions
   - ❌ Missing: Custom `onStreamPart` handlers

---

## Reference Project Features to Integrate

### Priority 1: Core Artifact System Enhancements

#### 1.1 Artifact Class Pattern

**Reference**: `-reference-project/components/create-artifact.tsx` (implied from usage)

**What to Add**:
```typescript
// features/ai-assistant/artifacts/base/artifact-class.ts
export class Artifact<K extends ArtifactKind, M = any> {
  kind: K;
  description: string;
  initialize?: (params: { documentId: string; setMetadata: (m: M) => void }) => Promise<void>;
  onStreamPart?: (params: { streamPart: DataPart; setArtifact: ...; setMetadata: ... }) => void;
  content: (props: ContentProps) => React.ReactNode;
  actions?: Action[];
  toolbar?: ToolbarItem[];
}
```

**Benefits**:
- Consistent artifact definition pattern
- Reusable artifact logic
- Type-safe artifact definitions
- Easier to add new artifact types

**Implementation**: Medium (2-3 days)

---

#### 1.2 Complete Artifact Definitions

**Reference**: `-reference-project/artifacts/text/client.tsx`

**What to Add**:
- Actions array (copy, version navigation, view changes)
- Toolbar items (add polish, request suggestions)
- Initialize function (load suggestions, metadata)
- Custom `onStreamPart` handlers
- Proper content rendering with mode support (edit/diff)

**Current State**: Basic content rendering only

**Implementation**: Medium (3-4 days)

---

#### 1.3 Artifact Server Handlers Pattern

**Reference**: `-reference-project/artifacts/text/server.ts`
**Reference**: `-reference-project/lib/artifacts/server.ts`

**What to Add**:
```typescript
// Pattern: createDocumentHandler factory
export const createDocumentHandler = <K extends ArtifactKind>({
  kind,
  onCreateDocument,
  onUpdateDocument,
}: DocumentHandlerConfig<K>) => { ... }

// Text handler
export const textDocumentHandler = createDocumentHandler<"text">({
  kind: "text",
  onCreateDocument: async ({ title, dataStream }) => {
    // Stream text content
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    // Update existing document
  },
});
```

**Benefits**:
- Consistent handler pattern
- Reusable logic
- Type safety
- Easier testing

**Implementation**: Medium (2-3 days)

---

### Priority 2: Database & Persistence

#### 2.1 Document Table Schema (Version History)

**Reference**: `-reference-project/lib/db/schema.ts` (lines 108-127)

**What to Add**:
```sql
-- Composite primary key enables version history
CREATE TABLE "Document" (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  createdAt TIMESTAMP NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  kind VARCHAR NOT NULL DEFAULT 'text',
  userId UUID NOT NULL REFERENCES "User"(id),
  PRIMARY KEY (id, createdAt)  -- Composite key!
);
```

**Key Points**:
- **Composite Primary Key**: `(id, createdAt)` enables multiple versions
- Same `id` with different `createdAt` = version history
- Latest version = `documents.at(-1)` (after ordering by `createdAt`)

**Implementation**: Small (1 day)

---

#### 2.2 Document Queries

**Reference**: `-reference-project/lib/db/queries.ts` (lines 311-402)

**What to Add**:
- `getDocumentsById({ id })` - Returns all versions (ordered by createdAt)
- `saveDocument({ id, title, content, kind, userId })` - Creates new version
- `deleteDocumentsByIdAfterTimestamp({ id, timestamp })` - Delete versions after timestamp

**Implementation**: Small (1 day)

---

#### 2.3 Document API Route

**Reference**: `-reference-project/app/(chat)/api/document/route.ts`

**What to Add**:
- `GET /api/document?id={id}` - Fetch all versions
- `POST /api/document?id={id}` - Save new version
- `DELETE /api/document?id={id}&timestamp={timestamp}` - Delete versions

**Implementation**: Small (1 day)

---

### Priority 3: SWR Integration for Artifacts

#### 3.1 Document Fetching with SWR

**Reference**: `-reference-project/components/artifact.tsx` (lines 90-99)

**What to Add**:
```typescript
// In artifact component
const { data: documents, isLoading, mutate } = useSWR<Document[]>(
  artifact.documentId !== "init" && artifact.status !== "streaming"
    ? `/api/document?id=${artifact.documentId}`
    : null,
  fetcher
);

// Use latest version
const document = documents?.at(-1);
```

**Benefits**:
- Automatic caching
- Revalidation on focus
- Optimistic updates support
- Shared cache across components

**Implementation**: Small (1 day)

---

#### 3.2 Optimistic Updates Pattern

**Reference**: `-reference-project/components/artifact.tsx` (lines 129-175)

**What to Add**:
```typescript
const handleContentChange = useCallback((updatedContent: string) => {
  // 1. Optimistic update via SWR mutate
  mutate(`/api/document?id=${id}`, async (current) => {
    return [...current, { ...latest, content: updatedContent, createdAt: new Date() }];
  }, { revalidate: false });

  // 2. Save to database
  await fetch(`/api/document?id=${id}`, {
    method: "POST",
    body: JSON.stringify({ content: updatedContent, ... }),
  });

  // 3. Revalidate
  mutate();
}, [id, mutate]);
```

**Implementation**: Medium (2 days)

---

### Priority 4: UI Components & Patterns

#### 4.1 Artifact Actions Component

**Reference**: `-reference-project/components/artifact-actions.tsx`

**What to Add**:
- Version navigation buttons (prev/next/latest)
- View changes toggle (edit/diff mode)
- Copy to clipboard
- Other artifact-specific actions

**Implementation**: Small (1 day)

---

#### 4.2 Version Footer Component

**Reference**: `-reference-project/components/version-footer.tsx`

**What to Add**:
- Shows when viewing old version
- Displays version count
- Navigation controls
- "Return to latest" button

**Implementation**: Small (1 day)

---

#### 4.3 Diff View Component

**Reference**: `-reference-project/components/diffview.tsx`

**What to Add**:
- Side-by-side or unified diff view
- Highlights changes between versions
- Syntax highlighting for code artifacts

**Implementation**: Medium (2-3 days)

---

#### 4.4 Document Preview Component

**Reference**: `-reference-project/components/document-preview.tsx`

**What to Add**:
- Renders artifact in message list
- Fetches document via SWR when `result.id` available
- Falls back to artifact content during streaming
- Click to open artifact panel

**Implementation**: Medium (2 days)

---

### Priority 5: Advanced Features (Optional)

#### 5.1 Suggestions System

**Reference**: `-reference-project/lib/db/schema.ts` (suggestion table)
**Reference**: `-reference-project/artifacts/text/client.tsx` (suggestions in metadata)

**What to Add**:
- Suggestion table in database
- AI-generated suggestions for text artifacts
- UI to display and accept/reject suggestions

**Relevance**: ⚠️ **Low** - May not be needed for ShopMate

**Implementation**: Large (4-5 days)

---

#### 5.2 Code Artifact Support

**Reference**: `-reference-project/artifacts/code/client.tsx`
**Reference**: `-reference-project/artifacts/code/server.ts`

**What to Add**:
- Code artifact handler
- Syntax highlighting
- Language detection
- Code editor component

**Relevance**: ⚠️ **Low** - ShopMate focuses on products/cart

**Implementation**: Medium (3-4 days)

---

#### 5.3 Image Artifact Support

**Reference**: `-reference-project/artifacts/image/client.tsx`

**What to Add**:
- Image artifact handler
- Image editor component
- Image generation/editing tools

**Relevance**: ⚠️ **Low** - Not needed for ShopMate

**Implementation**: Large (5-6 days)

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
1. ✅ Data streaming pattern (already done)
2. ⚠️ Enhance artifact definitions with Artifact class pattern
3. ⚠️ Complete artifact server handlers
4. ⚠️ Database schema for documents (version history)

### Phase 2: Persistence (Week 2-3)
1. ⚠️ Document API routes (GET/POST/DELETE)
2. ⚠️ Document queries (getDocumentsById, saveDocument)
3. ⚠️ SWR integration for document fetching
4. ⚠️ Optimistic updates pattern

### Phase 3: UI Enhancements (Week 3-4)
1. ⚠️ Artifact actions component
2. ⚠️ Version footer component
3. ⚠️ Diff view component
4. ⚠️ Document preview component

### Phase 4: Polish (Week 4-5)
1. ⚠️ Complete artifact actions (copy, navigation)
2. ⚠️ Toolbar items (add polish, suggestions)
3. ⚠️ Error handling
4. ⚠️ Loading states
5. ⚠️ Testing

---

## Key Patterns to Follow

### 1. Artifact Definition Pattern

```typescript
export const textArtifact = new Artifact<"text", TextMetadata>({
  kind: "text",
  description: "Useful for text content",
  initialize: async ({ documentId, setMetadata }) => {
    // Load metadata (suggestions, etc.)
  },
  onStreamPart: ({ streamPart, setArtifact, setMetadata }) => {
    // Handle custom stream parts
  },
  content: ({ content, mode, ... }) => {
    // Render content (edit or diff mode)
  },
  actions: [
    { icon: <CopyIcon />, onClick: ... },
    { icon: <UndoIcon />, onClick: ... },
  ],
  toolbar: [
    { icon: <PenIcon />, onClick: ... },
  ],
});
```

### 2. Server Handler Pattern

```typescript
export const textDocumentHandler = createDocumentHandler<"text">({
  kind: "text",
  onCreateDocument: async ({ title, dataStream }) => {
    // Stream content
    for await (const delta of textStream) {
      dataStream.write({
        type: "data-textDelta",
        data: delta.text,
        transient: true,
      });
    }
    return fullContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    // Update existing document
  },
});
```

### 3. SWR Fetching Pattern

```typescript
// Conditional fetch
const { data: documents } = useSWR<Document[]>(
  artifact.documentId !== "init" && artifact.status !== "streaming"
    ? `/api/document?id=${artifact.documentId}`
    : null,
  fetcher
);

// Use latest version
const document = documents?.at(-1);
```

### 4. Optimistic Update Pattern

```typescript
// 1. Update cache optimistically
mutate(key, optimisticData, { revalidate: false });

// 2. Save to database
await fetch(url, { method: "POST", body: ... });

// 3. Revalidate
mutate();
```

---

## Files to Reference

### Critical Reference Files

1. **Artifact System**:
   - `-reference-project/components/artifact.tsx` - Main artifact component
   - `-reference-project/artifacts/text/client.tsx` - Text artifact definition
   - `-reference-project/artifacts/text/server.ts` - Text handler

2. **Database**:
   - `-reference-project/lib/db/schema.ts` - Document schema
   - `-reference-project/lib/db/queries.ts` - Document queries
   - `-reference-project/app/(chat)/api/document/route.ts` - API route

3. **State Management**:
   - `-reference-project/hooks/use-artifact.ts` - Artifact hook (SWR-based)
   - `-reference-project/components/data-stream-provider.tsx` - Stream provider
   - `-reference-project/components/data-stream-handler.tsx` - Stream handler

4. **UI Components**:
   - `-reference-project/components/artifact-actions.tsx` - Actions
   - `-reference-project/components/version-footer.tsx` - Version footer
   - `-reference-project/components/document-preview.tsx` - Preview

---

## Notes & Considerations

### What NOT to Port

1. **Authentication System** - ShopMate may use different auth
2. **Chat Persistence** - May not be needed for ShopMate
3. **Message Voting** - Not relevant to ShopMate
4. **Code/Image Artifacts** - Not needed for ShopMate's use case

### ShopMate-Specific Adaptations

1. **Artifact Types**: Focus on text and sheet (product lists)
2. **Data Types**: Keep ShopMate-specific types (products, cart)
3. **UI**: Adapt to ShopMate's design system
4. **Database**: Use Supabase (already set up)

### Project Guidelines Compliance

When implementing, follow `project-guidelines.md`:
- ✅ Kebab-case filenames
- ✅ File header comments
- ✅ JSDoc-style docstrings
- ✅ Inline comments explaining why
- ✅ Context grouping with `/////`
- ✅ Explain React hooks usage (WHY and HOW)

---

## Next Steps

1. **Review this analysis** with team
2. **Prioritize features** based on ShopMate's needs
3. **Create implementation tickets** for each feature
4. **Start with Phase 1** (Foundation)
5. **Iterate and test** each phase

---

**Last Updated**: 2025-01-XX
**Status**: Ready for Implementation Planning

