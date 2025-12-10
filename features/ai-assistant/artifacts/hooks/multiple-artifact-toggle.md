# How Reference Project Fixes Multiple Document Content Issue

## The Solution: **SWR + Database Fetching**

The reference project uses a **database-backed approach** with SWR to fetch each document independently.

---

## Key Implementation

### 1. DocumentPreview Component

**File**: `-reference-project/components/document-preview.tsx`

```typescript
export function DocumentPreview({
  isReadonly,
  result,
  args,
}: DocumentPreviewProps) {
  const { artifact, setArtifact } = useArtifact();

  // 🔑 KEY: Fetch document from database using result.id
  const { data: documents, isLoading: isDocumentsFetching } = useSWR<
    Document[]
  >(result ? `/api/document?id=${result.id}` : null, fetcher);

  const previewDocument = useMemo(() => documents?.[0], [documents]);

  // Fallback logic:
  const document: Document | null = previewDocument
    ? previewDocument  // ✅ Use fetched document (from database)
    : artifact.status === "streaming"
      ? {
          // ✅ Use artifact content during streaming
          title: artifact.title,
          kind: artifact.kind,
          content: artifact.content,
          id: artifact.documentId,
          createdAt: new Date(),
          userId: "noop",
        }
      : null;
}
```

### 2. DocumentContent Component

**File**: `-reference-project/components/document-preview.tsx` (line 245)

```typescript
const DocumentContent = ({ document }: { document: Document }) => {
  const { artifact } = useArtifact();

  // Uses document.content directly (from props, not global state)
  const commonProps = {
    content: document.content ?? "",  // ← From fetched document
    isCurrentVersion: true,
    currentVersionIndex: 0,
    status: artifact.status,
    saveContent: () => null,
    suggestions: [],
  };

  return (
    <div className={containerClassName}>
      {document.kind === "text" ? (
        <Editor {...commonProps} onSaveContent={handleSaveContent} />
      ) : /* ... */}
    </div>
  );
};
```

---

## How It Works

### Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│  DocumentPreview (Instance 1)                          │
│  result.id = "doc-123"                                  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ useSWR('/api/document?id=doc-123')              │  │
│  │   └─> Fetches Document from Database            │  │
│  │       └─> Returns { id, title, content, ... }  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  └─> DocumentContent(document={ content: "..." })      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  DocumentPreview (Instance 2)                          │
│  result.id = "doc-456"                                  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ useSWR('/api/document?id=doc-456')              │  │
│  │   └─> Fetches Different Document from Database │  │
│  │       └─> Returns { id, title, content, ... }  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  └─> DocumentContent(document={ content: "..." })      │
└─────────────────────────────────────────────────────────┘
```

**Key Point**: Each `DocumentPreview` instance fetches its **own document** from the database using `result.id`.

---

## Database Schema

**File**: `-reference-project/lib/db/schema.ts`

```typescript
export const document = pgTable("Document", {
  id: uuid("id").notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  content: text("content"),  // ← Content stored here
  kind: varchar("text", { enum: ["text", "code", "image", "sheet"] })
    .notNull()
    .default("text"),
  userId: uuid("userId").notNull().references(() => user.id),
}, (table) => ({
  pk: primaryKey({ columns: [table.id, table.createdAt] }),
}));
```

**Note**: Documents are stored in a **separate `document` table**, not in message parts.

---

## API Route

**File**: `-reference-project/app/api/document/route.ts` (inferred)

```typescript
// GET /api/document?id=doc-123
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  // Fetch document(s) from database
  const documents = await db
    .select()
    .from(document)
    .where(eq(document.id, id))
    .orderBy(desc(document.createdAt));
  
  return Response.json(documents);
}
```

---

## Comparison: Reference vs Our Implementation

| Aspect | Reference Project | Our Implementation |
|--------|------------------|-------------------|
| **Content Storage** | Database (`document` table) | Message parts (`tool-result`) |
| **Content Retrieval** | SWR fetch by `result.id` | Extract from `result.content` prop |
| **Per-Instance Content** | ✅ Each fetches independently | ✅ Each has its own `result.content` |
| **Database Required** | ✅ Yes (PostgreSQL) | ❌ No (works without DB) |
| **Message Persistence** | ✅ Separate document table | ✅ Content in message parts |
| **Streaming Support** | ✅ Falls back to `artifact.content` | ✅ Falls back to `artifact.content` |

---

## Why Reference Project's Approach Works

### 1. **Independent Fetching**
Each `DocumentPreview` instance:
- Has its own `result.id`
- Fetches its own document via SWR
- No shared global state for content

### 2. **Database as Source of Truth**
- Documents stored in database
- Content persists across sessions
- Version history support (via `createdAt`)

### 3. **SWR Caching**
- SWR caches fetched documents
- Multiple instances with same `result.id` share cache
- Automatic revalidation

### 4. **Fallback During Streaming**
- Uses `artifact.content` while streaming
- Switches to database after completion
- Smooth transition

---

## Our Implementation vs Reference

### Our Approach (Message Parts)
✅ **Pros**:
- Works without database
- Content in message parts (simpler for now)
- Ready for message persistence

⚠️ **Cons**:
- Content stored in message parts (can be large)
- No separate document versioning

### Reference Approach (Database)
✅ **Pros**:
- Separate document table (better organization)
- Version history support
- Better for large documents

⚠️ **Cons**:
- Requires database
- More complex setup

---

## Migration Path

If we want to adopt the reference project's approach:

1. **Create Document API Route**:
   ```typescript
   // app/api/document/route.ts
   export async function GET(request: Request) {
     const { searchParams } = new URL(request.url);
     const id = searchParams.get('id');
     // Fetch from database
   }
   ```

2. **Update DocumentPreview**:
   ```typescript
   const { data: documents } = useSWR<Document[]>(
     result ? `/api/document?id=${result.id}` : null,
     fetcher
   );
   ```

3. **Store Documents in Database**:
   - Save document when tool completes
   - Store in `document` table
   - Link via `id`

---

## Summary

**Reference Project's Solution**:
- Uses **SWR to fetch documents from database** by `result.id`
- Each `DocumentPreview` instance fetches independently
- Content stored in separate `document` table
- Falls back to `artifact.content` during streaming

**Our Solution**:
- Uses **content from message parts** (`result.content`)
- Each `DocumentPreview` instance has its own `result` prop
- Content stored in `tool-result` message part
- Falls back to `artifact.content` during streaming

**Both approaches work**, but the reference project's approach is better for:
- Large documents
- Version history
- Separate document management

Our approach is better for:
- Simplicity (no database required)
- Message-based persistence
- Quick implementation

