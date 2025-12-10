# Artifact Database + SWR Implementation with Supabase

## Overview

This plan outlines the steps to migrate artifacts from message-based storage to a database-backed approach using **Supabase** (PostgreSQL) and **SWR** for client-side data fetching. This enables version history, persistence, and better performance for large artifacts.

---

## Prerequisites

✅ **Already Implemented**:
- Text artifact creation and streaming
- SWR setup for products/cart
- Artifact state management (`useArtifact` hook)
- Artifact panel UI components
- DataStream pattern (for real-time streaming)

⏳ **Required**:
- Supabase project setup
- Database schema migration
- Authentication (if not already implemented)

---

## Streaming Support

**Yes, this implementation fully supports streaming!**

### How Streaming Works

1. **During Streaming** (Real-time):
   - AI generates content and streams via `data-textDelta` / `data-sheetDelta`
   - `DataStreamHandler` updates `artifact.content` in real-time
   - Components render using `artifact.content` (from DataStream)
   - **No database calls during streaming** (for performance)

2. **After Streaming** (Persistence):
   - Complete content is saved to Supabase
   - Components can fetch from database via SWR
   - Falls back to `artifact.content` if database fetch fails

### Fallback Strategy

Components use this priority:
1. **Fetched document** (from Supabase via SWR) - when available
2. **Artifact content** (from DataStream) - during streaming or if fetch fails
3. **Result/args** (from tool call) - initial state

This ensures smooth streaming experience while enabling persistence.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│          Artifact Database + SWR Flow (with Streaming)      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  STREAMING PHASE (Real-time):                              │
│  1. AI creates artifact → Tool returns { id, title, kind }│
│     ↓                                                       │
│  2. Server streams content via data-textDelta/data-sheetDelta│
│     ↓                                                       │
│  3. DataStreamHandler updates artifact.content (real-time) │
│     ↓                                                       │
│  4. Component renders with artifact.content (streaming)    │
│                                                             │
│  PERSISTENCE PHASE (After streaming):                      │
│  5. Server saves complete content to Supabase              │
│     ↓                                                       │
│  6. Component fetches via SWR: /api/document?id=...       │
│     ↓                                                       │
│  7. API queries Supabase → Returns document content        │
│     ↓                                                       │
│  8. Component switches to fetched content (persisted)     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Point**: Streaming happens via existing DataStream pattern. Database is used for persistence AFTER streaming completes.

---

## Phase 1: Supabase Setup & Schema

### Step 1.1: Create Supabase Table

**Action**: Create `document` table in Supabase

**File Created**: `lib/supabase/migrations/001_create_document_table.sql`

**SQL Migration**:
The migration SQL is in the file above. It includes:
- Table creation with composite primary key `(id, createdAt)`
- Indexes for faster lookups
- Check constraint for `kind` enum
- Comments for documentation

**Supabase Dashboard**:
1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the contents of `lib/supabase/migrations/001_create_document_table.sql`
4. Paste into SQL Editor
5. Click **Run** or press `Ctrl+Enter`
6. Verify table creation in **Table Editor**

**Verification**:
- Check that the `Document` table exists
- Verify columns: `id`, `createdAt`, `title`, `content`, `kind`, `userId`
- Check indexes are created

**Status**: ✅ Ready to execute

---

### Step 1.2: Set Up Supabase Client

**File**: `lib/supabase/client.ts`

**Purpose**: Create Supabase client for server-side operations

**Files Created**:
- `lib/supabase/client.ts` - Supabase admin client
- `lib/supabase/.env.example` - Environment variables template

**Code**: See `client.ts` file for full implementation with error handling and documentation.

**Environment Variables** (`.env.local`):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Setup Steps**:
1. Copy `.env.example` values to your `.env.local` file
2. Get your Supabase URL from: Project Settings → API → Project URL
3. Get your Service Role Key from: Project Settings → API → service_role key
4. ⚠️ **Important**: Never commit `.env.local` to version control!

**Verification**:
- Check that `supabaseAdmin` is exported
- Verify environment variables are loaded (check error messages if any)

**Status**: ✅ Ready to use (after adding environment variables)

---

### Step 1.3: Create Database Types

**File**: `lib/supabase/types.ts`

**Purpose**: TypeScript types for document table and related operations

**Files Created**:
- `lib/supabase/types.ts` - Complete type definitions

**Types Included**:
- `DocumentKind` - Artifact type union ('text' | 'code' | 'sheet')
- `Document` - Document select type (matches database structure)
- `DocumentInsert` - Document insert type (for creating new documents)
- `DocumentUpdate` - Document update type (for future use)
- `DocumentFilters` - Query filter options
- `DocumentQueryOptions` - Query options (ordering, pagination)

**Status**: ✅ Complete

---

## Phase 2: API Routes

### Step 2.1: Create Document API Route (GET)

**File**: `app/api/document/route.ts`

**Purpose**: Fetch document(s) by ID from Supabase

**Files Created**:
- `app/api/document/route.ts` - GET handler for fetching documents

**Features**:
- Fetches all versions of a document (ordered by createdAt ascending)
- Returns array for version history support
- Latest version is `documents[documents.length - 1]`
- Error handling with proper status codes
- Logging for debugging
- TODO comments for future authentication/authorization

**API Endpoint**:
```
GET /api/document?id={documentId}
```

**Response**:
- `200`: Array of documents (ordered by createdAt ascending)
- `400`: Missing id parameter
- `404`: Document not found
- `500`: Server error

**Status**: ✅ Complete

---

### Step 2.2: Create Document API Route (POST)

**File**: `app/api/document/route.ts` (POST handler added)

**Purpose**: Save/update document in Supabase

**Files Updated**:
- `app/api/document/route.ts` - Added POST handler

**Features**:
- Creates new version of document (new row with same id, new createdAt)
- Validates required fields (title, kind)
- Validates kind enum ('text', 'code', 'sheet')
- Checks for existing document (for future authorization)
- Enables version history (each save = new version)
- Error handling with proper status codes
- Logging for debugging

**API Endpoint**:
```
POST /api/document?id={documentId}
Content-Type: application/json

{
  "title": "Document Title",
  "content": "Document content...",
  "kind": "text"
}
```

**Response**:
- `200`: Created document
- `400`: Missing id, invalid body, or missing required fields
- `500`: Server error

**Status**: ✅ Complete

---

### Step 2.3: Create Document API Route (DELETE)

**File**: `app/api/document/route.ts` (DELETE handler added)

**Purpose**: Delete document versions

**Files Updated**:
- `app/api/document/route.ts` - Added DELETE handler

**Features**:
- Deletes all versions of a document (if no timestamp)
- Deletes versions after a specific timestamp (if timestamp provided)
- Enables selective version deletion
- Error handling with proper status codes
- Logging for debugging
- TODO comments for future authentication/authorization

**API Endpoint**:
```
DELETE /api/document?id={documentId}
DELETE /api/document?id={documentId}&timestamp={timestamp}
```

**Query Parameters**:
- `id` (required): Document ID to delete
- `timestamp` (optional): If provided, deletes all versions after this timestamp

**Response**:
- `200`: Successfully deleted
- `400`: Missing id parameter
- `500`: Server error

**Status**: ✅ Complete

---

## Phase 3: Update Server-Side Artifact Handlers

### Step 3.1: Update Text Artifact Handler

**File**: `features/ai-assistant/artifacts/text/server.ts`

**Changes**: Save document to Supabase **AFTER** streaming completes

**Important**: Streaming happens first, then persistence. Don't block streaming!

**Files Updated**:
- `features/ai-assistant/artifacts/text/server.ts` - Added Supabase save logic

**Key Changes**:
- Added optional `documentId` parameter to `CreateTextDocumentParams`
- Added Supabase import and logger
- Save to Supabase after streaming completes (if `documentId` provided)
- Non-blocking: If save fails, user still sees content (from streaming)
- Uses logger instead of console.error

**Key Points**:
- ✅ Streaming happens first (real-time UI updates)
- ✅ Database save happens after (doesn't block streaming)
- ✅ If `documentId` is provided, saves to Supabase
- ✅ If `documentId` is not provided, skips save (will be saved in agent)
- ✅ If database save fails, user still sees content (from streaming)
- ✅ Components can fetch from database later for persistence

**Note**: The `documentId` is typically provided from the agent's `onStepFinish` where `toolCall.result.id` is available. See Step 3.2 for agent integration.

**Status**: ✅ Complete

---

### Step 3.2: Update Agent onStepFinish

**File**: `features/ai-assistant/agents/technical-discussion/agent.ts` and `recommendation/agent.ts`

**Changes**: Pass documentId to createTextDocument for Supabase persistence

**Files Updated**:
- `features/ai-assistant/agents/technical-discussion/agent.ts` - Updated onStepFinish
- `features/ai-assistant/agents/recommendation/agent.ts` - Updated onStepFinish

**Key Changes**:
- Generate `documentId` directly in agent (since tool result isn't available in `onStepFinish`)
- Pass `documentId` to `createTextDocument()` function
- Handler will save to Supabase if `documentId` is provided

**Code Pattern**:
```typescript
// Generate document ID for persistence
// Note: The tool also generates its own ID and streams it to UI via data-artifactId.
// Since we can't access the tool's return value in onStepFinish, we generate our own ID here.
// The tool's ID is used for UI state, and this ID is used for Supabase persistence.
const documentId = generateUUID();

await createTextDocument({
  title,
  dataStream,
  documentId, // Pass documentId for Supabase persistence
});
```

**Note**: See Phase 3.5, Issue 1 for details on why we generate the ID instead of extracting from tool result.

**Status**: ✅ Complete

---

## Phase 3.5: Fixes & Improvements

### Issue 1: DocumentId Not Available in onStepFinish

**Problem**: The tool call result is not available in `onStepFinish` callback (`hasResult: false`), so we couldn't extract the `documentId` from the tool's return value.

**Root Cause**: The Vercel AI SDK's `onStepFinish` callback doesn't provide access to the tool's return value. The tool executes and returns a result, but this result isn't accessible in `onStepFinish`.

**Solution**: Generate the `documentId` directly in the agent before calling `createTextDocument`.

**Files Updated**:
- `features/ai-assistant/agents/technical-discussion/agent.ts`
- `features/ai-assistant/agents/recommendation/agent.ts`

**Changes**:
```typescript
// OLD (didn't work):
const documentId = 'result' in toolCall && toolCall.result && typeof toolCall.result === 'object' && 'id' in toolCall.result
  ? (toolCall.result as any).id
  : undefined;

// NEW (works):
// Generate document ID for persistence
// Note: The tool also generates its own ID and streams it to UI via data-artifactId.
// Since we can't access the tool's return value in onStepFinish, we generate our own ID here.
// The tool's ID is used for UI state, and this ID is used for Supabase persistence.
const documentId = generateUUID();
```

**Key Points**:
- The tool still generates its own ID and streams it to the UI via `data-artifactId`
- The agent generates a separate ID for Supabase persistence
- Both IDs serve their purposes: tool ID for UI state, agent ID for database persistence
- This ensures `documentId` is always available for Supabase save operations

**Status**: ✅ Fixed

---

### Issue 2: Invalid UUID Format for userId

**Problem**: Supabase rejected the `userId` value `'temp-user-id'` because it's not a valid UUID format. The `userId` column in the Document table is of type UUID.

**Error**:
```
invalid input syntax for type uuid: "temp-user-id"
errorCode: '22P02'
```

**Solution**: Generate a valid UUID for the temporary user ID instead of using a string.

**Files Updated**:
- `features/ai-assistant/artifacts/text/server.ts`

**Changes**:
```typescript
// OLD (caused error):
userId: 'temp-user-id', // TODO: Replace with actual user ID

// NEW (works):
// Generate a temporary user ID (UUID format) for development
// TODO: Replace with actual user ID from authentication session
const tempUserId = generateUUID();

const documentData = {
  id: documentId,
  title,
  content: fullContent,
  kind: 'text' as const,
  userId: tempUserId, // Temporary UUID for development - replace with actual user ID
  createdAt: new Date().toISOString(),
};
```

**Key Points**:
- Uses `generateUUID()` to create a valid UUID format
- Still a temporary solution for development
- When authentication is added, replace with actual `session.user.id`
- Each document save generates a new UUID (for now, until auth is implemented)

**Status**: ✅ Fixed

---

### Issue 3: Enhanced Logging for Debugging

**Problem**: Needed better visibility into the document saving process to debug issues.

**Solution**: Added comprehensive logging throughout the artifact saving flow.

**Files Updated**:
- `features/ai-assistant/artifacts/text/server.ts` - Added detailed logging for streaming and Supabase operations
- `features/ai-assistant/agents/technical-discussion/agent.ts` - Added logging for tool call processing
- `features/ai-assistant/agents/recommendation/agent.ts` - Added logging for tool call processing

**Logging Added**:

1. **Agent Level** (`onStepFinish`):
   - When `onStepFinish` is called
   - Tool call processing details
   - Input extraction (title, kind)
   - DocumentId generation
   - `createTextDocument` call

2. **Text Artifact Handler** (`server.ts`):
   - Function entry with parameters
   - Streaming start/completion
   - Delta count and content length
   - Supabase save operation start
   - Supabase insert payload details
   - Success/error with full error details
   - Completion status

**Example Log Output**:
```
[Technical Discussion Agent] onStepFinish called { toolCallsCount: 1, toolNames: ['createDocument'] }
[Technical Discussion Agent] Processing createDocument tool call { ... }
[Technical Discussion Agent] Generated documentId for persistence { documentId: '...', ... }
[Technical Discussion Agent] Calling createTextDocument { title: '...', documentId: '...' }
[Text Artifact] createTextDocument called { title: '...', documentId: '...', hasDataStream: true }
[Text Artifact] Starting text generation stream...
[Text Artifact] Streaming completed { totalDeltas: 637, contentLength: 4436, documentId: '...' }
[Text Artifact] Starting Supabase save operation { documentId: '...', title: '...', ... }
[Text Artifact] Successfully saved document to Supabase { documentId: '...', ... }
```

**Key Points**:
- All logs use `logger.debug()` (development only) or `logger.info()`/`logger.warn()` for important events
- Logs include relevant context (documentId, title, content length, etc.)
- Error logs include full error details (message, code, hints)
- Helps identify where issues occur in the flow

**Status**: ✅ Complete

---

### Issue 4: Document ID Mismatch Between Tool and Agent

**Problem**: The tool generated one document ID and streamed it to the UI via `data-artifactId`, while the agent generated a different ID for Supabase persistence. This caused a mismatch where:
- The UI received the tool's ID (e.g., `96387c0c-343a-45ea-82cf-98f162e713c5`)
- The document was saved to Supabase with the agent's ID (e.g., `20593d48-641e-40a2-b33c-0a6350d0d0f4`)
- When `DocumentPreview` tried to fetch the document using the tool's ID, it couldn't find it in Supabase

**Error**:
```
[Document API] Document not found: 96387c0c-343a-45ea-82cf-98f162e713c5
```

**Root Cause**: The tool and agent were generating separate IDs independently, with no synchronization mechanism.

**Solution**: Implemented a shared ID mechanism using closure variables and getter/setter functions.

**Files Updated**:
- `features/ai-assistant/artifacts/text/create-document-tool.ts` - Added `getSharedId` and `setSharedId` parameters
- `features/ai-assistant/agents/technical-discussion/agent.ts` - Added shared ID closure and passed getter/setter to tool
- `features/ai-assistant/agents/recommendation/agent.ts` - Added shared ID closure and passed getter/setter to tool

**Changes**:

1. **Tool (`create-document-tool.ts`)**:
   ```typescript
   export const createDocumentTool = (
     dataStream?: UIMessageStreamWriter<any>,
     getSharedId?: () => string | null,
     setSharedId?: (id: string) => void
   ) => {
     // ...
     execute: async (input) => {
       // Use shared ID from agent if available, otherwise generate new one
       let id: string;
       if (getSharedId && getSharedId()) {
         id = getSharedId()!;
       } else {
         id = generateUUID();
         // Store the ID so agent can use it
         if (setSharedId) {
           setSharedId(id);
         }
       }
       // ... rest of tool logic
     }
   }
   ```

2. **Agent (`technical-discussion/agent.ts` and `recommendation/agent.ts`)**:
   ```typescript
   // Shared document ID storage for syncing tool and agent
   let sharedDocumentId: string | null = null;

   const result = streamText({
     tools: dataStream ? {
       createDocument: createDocumentTool(
         dataStream, 
         () => sharedDocumentId, 
         (id: string) => { sharedDocumentId = id; }
       ),
     } : undefined,

     onStepFinish: async ({ toolCalls }) => {
       // ...
       // Use the shared ID that was set by the tool
       if (!sharedDocumentId) {
         sharedDocumentId = generateUUID();
         logger.warn('[Agent] Shared documentId was not set by tool, generated fallback');
       }
       
       const documentId = sharedDocumentId;
       
       await createTextDocument({
         title,
         dataStream,
         documentId, // Use synced documentId for Supabase persistence
       });
       
       // Reset shared ID for next tool call
       sharedDocumentId = null;
     }
   });
   ```

**Flow**:
1. Tool executes → Generates ID (or uses shared ID if available) → Calls `setSharedId(id)` → Streams ID to UI via `data-artifactId`
2. Agent's `onStepFinish` runs → Reads `sharedDocumentId` → Uses same ID for Supabase persistence
3. Both tool and agent now use the same ID, ensuring sync

**Key Points**:
- ✅ Tool generates ID and stores it via `setSharedId()` callback
- ✅ Agent reads the shared ID in `onStepFinish` and uses it for Supabase
- ✅ Both use the same ID, ensuring the document can be fetched correctly
- ✅ Fallback: If tool doesn't set ID, agent generates one (shouldn't happen in normal flow)
- ✅ Shared ID is reset after each tool call to prevent cross-contamination

**Status**: ✅ Fixed

---

## Phase 4: Update Client Components

### Step 4.1: Create SWR Hook for Documents

**File**: `features/ai-assistant/artifacts/hooks/use-document.ts`

**Purpose**: SWR hook for fetching documents from Supabase

**Files Created**:
- `features/ai-assistant/artifacts/hooks/use-document.ts` - SWR hook for documents

**Features**:
- Conditional fetching (only when `documentId` is provided)
- Returns array of documents (for version history)
- Provides latest document (most recent version)
- Automatic caching and revalidation
- Error handling (404 returns empty array, not error)
- SWR options optimized for document fetching

**Returns**:
- `documents`: Array of all document versions
- `document`: Latest document version (most recent)
- `isLoading`: Loading state
- `error`: Error object
- `mutate`: Function to manually revalidate

**Status**: ✅ Complete

---

### Step 4.2: Update DocumentPreview Component

**File**: `features/ai-assistant/artifacts/text/document-preview.tsx`

**Changes**: Fetch document from Supabase via SWR, with fallback to streaming content

**Code**:
```typescript
import { useDocument } from '../hooks/use-document';

export function DocumentPreview({
  isReadonly = false,
  result,
  args,
}: DocumentPreviewProps) {
  const { artifact, setArtifact } = useArtifact();
  
  // ✅ Fetch document from Supabase when result.id is available
  // Note: Only fetches when NOT streaming (for performance)
  const { document: fetchedDocument, isLoading: isFetching } = useDocument(
    result?.id && artifact.status !== 'streaming' ? result.id : null
  );

  // ✅ Priority-based content selection (supports streaming)
  const document = useMemo(() => {
    // Priority 1: Fetched document from Supabase (persisted)
    // Use this when document is saved and fetched
    if (fetchedDocument) {
      return {
        title: fetchedDocument.title,
        kind: fetchedDocument.kind as 'text' | 'code' | 'sheet',
        content: fetchedDocument.content || '',
        id: fetchedDocument.id,
      };
    }

    // Priority 2: Artifact state (during streaming or if not fetched yet)
    // ✅ This is what renders during streaming (real-time updates)
    if (artifact.content || artifact.title || artifact.documentId !== 'init') {
      return {
        title: artifact.title || result?.title || args?.title || 'Untitled Document',
        kind: artifact.kind || result?.kind || args?.kind || 'text',
        content: artifact.content || '', // ← Streaming content updates here
        id: artifact.documentId !== 'init' ? artifact.documentId : (result?.id || ''),
      };
    }

    // Priority 3: Result/args (tool call/result)
    if (result) {
      return {
        title: result.title || 'Untitled Document',
        kind: result.kind || 'text',
        content: artifact.content || '',
        id: result.id,
      };
    }

    if (args) {
      return {
        title: args.title || 'Untitled Document',
        kind: args.kind || 'text',
        content: artifact.content || '',
        id: artifact.documentId !== 'init' ? artifact.documentId : '',
      };
    }

    return null;
  }, [fetchedDocument, artifact, result, args]);

  // ... rest of component logic ...
}
```

**Key Points**:
- ✅ **During streaming**: Uses `artifact.content` (updates in real-time via DataStream)
- ✅ **After streaming**: Can fetch from Supabase (if saved)
- ✅ **Fallback**: Always falls back to `artifact.content` if fetch fails
- ✅ **Performance**: Doesn't fetch during streaming (avoids unnecessary requests)

**Status**: ⏳ To Do

---

### Step 4.3: Update Artifact Panel Component

**File**: `features/ai-assistant/artifacts/components/artifact-panel.tsx`

**Changes**: Fetch document when panel is open

**Files Updated**:
- `features/ai-assistant/artifacts/components/artifact-panel.tsx` - Added SWR fetching

**Key Changes**:
- Import `useDocument` hook
- Fetch document when `documentId !== 'init'` and not streaming
- Sync artifact content with fetched document via `useEffect`
- Preserves existing content if fetched document has no content

**Status**: ✅ Complete

---

### Step 4.4: Update Text Artifact Content Component

**File**: `features/ai-assistant/artifacts/text/text-artifact-content.tsx`

**Changes**: Use fetched document content if available

**Files Updated**:
- `features/ai-assistant/artifacts/text/text-artifact-content.tsx` - Added SWR fetching with smart fallback

**Key Changes**:
- Import `useDocument` hook
- Fetch document when `documentId !== 'init'`
- Smart content priority:
  - During streaming: Use `artifact.content` (real-time updates)
  - After streaming: Use `fetchedDocument.content` (persisted version)
  - Fallback: Use `artifact.content` if fetched document unavailable
- Title uses fetched document as primary source

**Status**: ✅ Complete

---

## Phase 5: Testing & Validation

### Step 5.1: Test Document Creation

**Test Cases**:
- [ ] Create text artifact → Verify saved to Supabase
- [ ] Check document appears in Supabase dashboard
- [ ] Verify `id`, `title`, `content`, `kind` are correct

**Status**: ⏳ To Do

---

### Step 5.2: Test Document Fetching

**Test Cases**:
- [ ] DocumentPreview fetches document when `result.id` exists
- [ ] Falls back to `artifact.content` during streaming
- [ ] SWR cache works (multiple instances share cache)
- [ ] Error handling for missing documents

**Status**: ⏳ To Do

---

### Step 5.3: Test Version History

**Test Cases**:
- [ ] Save multiple versions of same document
- [ ] Fetch returns all versions ordered by `createdAt`
- [ ] Latest version is `documents.at(-1)`

**Status**: ⏳ To Do

---

### Step 5.4: Test Persistence

**Test Cases**:
- [ ] Close and reopen artifact panel → Content persists
- [ ] Refresh page → Document still available
- [ ] Multiple conversations → Each has own documents

**Status**: ⏳ To Do

---

## Phase 6: Future Enhancements

### Step 6.1: Add Authentication

**Action**: Integrate user authentication

**Changes**:
- Replace `'temp-user-id'` with actual `session.user.id`
- Add auth checks in API routes
- Add RLS policies in Supabase (optional)

**Status**: 🔮 Future

---

### Step 6.2: Add Version Navigation

**Action**: UI for navigating document versions

**Components**:
- Version selector dropdown
- Previous/Next version buttons
- Version timestamp display

**Status**: 🔮 Future

---

### Step 6.3: Add Document Actions

**Action**: Toolbar actions for documents

**Actions**:
- Save/Update document
- Delete document
- Copy document
- Export document

**Status**: 🔮 Future

---

### Step 6.4: Optimize for Large Documents

**Action**: Handle large content efficiently

**Strategies**:
- Pagination for document list
- Lazy loading for content
- Compression for storage

**Status**: 🔮 Future

---

## Implementation Checklist

### Phase 1: Supabase Setup
- [ ] Step 1.1: Create `Document` table in Supabase
- [ ] Step 1.2: Set up Supabase client
- [ ] Step 1.3: Create database types

### Phase 2: API Routes
- [ ] Step 2.1: Create GET `/api/document` route
- [ ] Step 2.2: Create POST `/api/document` route
- [ ] Step 2.3: Create DELETE `/api/document` route

### Phase 3: Server-Side Updates
- [x] Step 3.1: Update text artifact handler to save to Supabase
- [x] Step 3.2: Update agent `onStepFinish` to save documents
- [x] Step 3.5: Fixes & Improvements
  - [x] Fix documentId extraction issue (generate in agent)
  - [x] Fix userId UUID format issue (use generateUUID)
  - [x] Add comprehensive logging for debugging
  - [x] Fix document ID mismatch between tool and agent (shared ID mechanism)

### Phase 4: Client Components
- [ ] Step 4.1: Create `useDocument` SWR hook
- [ ] Step 4.2: Update `DocumentPreview` to fetch via SWR
- [ ] Step 4.3: Update `ArtifactPanel` to fetch via SWR
- [ ] Step 4.4: Update `TextArtifactContent` to use fetched content

### Phase 5: Testing
- [ ] Step 5.1: Test document creation
- [ ] Step 5.2: Test document fetching
- [ ] Step 5.3: Test version history
- [ ] Step 5.4: Test persistence

### Phase 6: Future Enhancements
- [ ] Step 6.1: Add authentication
- [ ] Step 6.2: Add version navigation
- [ ] Step 6.3: Add document actions
- [ ] Step 6.4: Optimize for large documents

---

## Migration Strategy

### Option 1: Gradual Migration (Recommended)

1. **Phase 1-2**: Set up Supabase and API routes
2. **Phase 3**: Start saving new documents to Supabase
3. **Phase 4**: Update components to fetch from Supabase (with fallback)
4. **Phase 5**: Test and validate
5. **Future**: Migrate existing artifacts (if needed)

### Option 2: Big Bang Migration

1. Implement all phases at once
2. Switch all artifacts to database
3. Remove message-based storage

**Recommendation**: Use Option 1 for safer, incremental migration

---

## Key Differences from Reference Project

| Aspect | Reference Project | Our Implementation |
|--------|------------------|-------------------|
| **Database** | PostgreSQL (direct) | Supabase (managed PostgreSQL) |
| **Client** | Drizzle ORM | Supabase JS Client |
| **Migrations** | Drizzle migrations | Supabase SQL Editor |
| **Auth** | Auth.js (NextAuth) | Supabase Auth (or custom) |
| **RLS** | Not mentioned | Can use Supabase RLS |

---

## Environment Variables

Add to `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: For client-side operations
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Dependencies

Install Supabase client:

```bash
npm install @supabase/supabase-js
```

---

## Notes

1. **Service Role Key**: Use for server-side operations (bypasses RLS)
2. **Anon Key**: Use for client-side operations (respects RLS)
3. **Version History**: Composite primary key `(id, createdAt)` enables multiple versions
4. **Streaming Support**: ✅ Fully supported via existing DataStream pattern
   - Streaming happens first (real-time UI updates)
   - Database save happens after (doesn't block streaming)
   - Components use `artifact.content` during streaming
   - Components can fetch from database after streaming completes
5. **Fallback Strategy**: Always fallback to `artifact.content` during streaming or if fetch fails
6. **Error Handling**: Don't break artifact functionality if database save fails (user already sees content via streaming)
7. **Performance**: Don't fetch from database during streaming (avoids unnecessary requests)
8. **Important Fixes** (See Phase 3.5):
   - **DocumentId Generation**: Must generate `documentId` in agent (not extract from tool result) because `onStepFinish` doesn't provide tool result access
   - **UserId Format**: Must use valid UUID format for `userId` field (use `generateUUID()` instead of string like `'temp-user-id'`)
   - **Logging**: Comprehensive logging added throughout the flow for easier debugging
   - **ID Synchronization**: Tool and agent must use the same ID via shared closure mechanism to ensure document can be fetched correctly

---

## Summary

This plan migrates artifacts from message-based storage to a database-backed approach using Supabase. The implementation follows the reference project's pattern while adapting to Supabase's managed PostgreSQL service.

**Key Benefits**:
- ✅ **Streaming Support**: Fully supports real-time streaming via existing DataStream pattern
- ✅ **Version History**: Composite primary key enables multiple versions
- ✅ **Persistence**: Content persists across sessions
- ✅ **Performance**: Better for large artifacts (doesn't bloat messages)
- ✅ **SWR Caching**: Automatic caching and revalidation
- ✅ **Independent Fetching**: Each component fetches its own document
- ✅ **Graceful Fallback**: Always falls back to streaming content if database unavailable

**Streaming Flow**:
1. **During Streaming**: Content streams via `data-textDelta` → `artifact.content` → UI updates in real-time
2. **After Streaming**: Complete content saved to Supabase → Components can fetch via SWR
3. **Fallback**: If database unavailable, components use `artifact.content` (from streaming)

**Next Steps**: Start with Phase 1 (Supabase setup) and proceed incrementally through each phase.

