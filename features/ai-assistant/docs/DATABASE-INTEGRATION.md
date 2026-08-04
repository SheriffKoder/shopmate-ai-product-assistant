# AI Assistant Database Integration

## Purpose

This document explains how assistant persistence is initialized and connected to a database provider. Read it before changing Supabase, adding a new database provider, or introducing tests for assistant persistence.

The important rule is:

> `features/ai-assistant` defines persistence contracts and request orchestration. The application chooses and initializes the database provider.

The assistant must remain usable in a project that has no Supabase dependency.

## Current data flow

```text
POST /api/ai-assistant
  └── app/api/ai-assistant/route.ts
        ├── creates the ShopMate runtime
        ├── imports the application persistence adapter
        └── injects both into handleAssistantRequest()

features/ai-assistant/server/handle-assistant-request.ts
  └── uses AssistantPersistence only

app/infrastructure/assistant/supabase/assistant-persistence.ts
  ├── initializes no client itself
  ├── calls the existing Supabase query boundary
  └── maps database results to assistant contracts

lib/supabase/
  ├── client.ts                    # Supabase client initialization
  └── queries/                     # database operations and row types
```

## Ownership map

### Generic assistant

These files must remain provider-neutral:

- `features/ai-assistant/model/assistant-persistence.ts`
  - `AssistantPersistence` contract for chat creation and message persistence.
  - `AssistantHistoryClient` contract for history list/delete operations.
- `features/ai-assistant/model/assistant-history-client.ts`
  - Public export boundary for history contracts.
- `features/ai-assistant/server/handle-assistant-request.ts`
  - Receives persistence as an argument.
  - Must not import Supabase, Prisma, Drizzle, or application repositories.
- `features/ai-assistant/client/assistant-history-client.ts`
  - Uses assistant HTTP endpoints, not database clients.
- `features/ai-assistant/components/history-sidebar/`
  - Displays assistant DTOs and calls client operations.
- `features/ai-assistant/test/in-memory-assistant-persistence.ts`
  - Provider-free adapter for tests and assistant-only development.

### Application composition

These files select the current provider:

- `app/api/ai-assistant/route.ts`
  - Composition root for the active assistant route.
  - Injects `assistantChatPersistence` into `handleAssistantRequest`.
- `app/infrastructure/assistant/supabase/assistant-persistence.ts`
  - Supabase implementation of `AssistantPersistence`.
  - Converts assistant messages into the current database row shape.
- `app/infrastructure/assistant/supabase/artifact-database.ts`
  - Temporary composition boundary for server-side artifact database access.
  - This should later be replaced by a provider-neutral document adapter.

### Supabase infrastructure

These files initialize and access the current provider:

- `lib/supabase/client.ts`
  - Reads Supabase environment variables and creates the admin client.
  - Never import this from a client component.
- `lib/supabase/queries/chat-queries.ts`
  - Chat and message query operations.
- `lib/supabase/queries/user-queries.ts`
  - Current development user resolution.
- `lib/supabase/types.ts`
  - Database row types. These should stay outside the generic assistant feature.
- `lib/supabase/migrations/002_create_user_table.sql`
  - User table schema.
- `lib/supabase/migrations/003_create_chat_and_message_tables.sql`
  - Chat and message table schema.
- `lib/supabase/migrations/001_create_document_table.sql`
  - Artifact/document schema.

## Database initialization checklist

When using the current Supabase composition:

1. Confirm the Supabase environment variables required by `lib/supabase/client.ts` exist in `.env.local`.
2. Apply the migrations for users, documents, chats, and messages.
3. Verify the query functions used by `app/infrastructure/assistant/supabase/assistant-persistence.ts` return the expected records.
4. Start the app through `/api/ai-assistant`; do not initialize Supabase from `ChatWrapper`, `ChatContainer`, or any client component.
5. Test a new chat and an existing chat continuation.
6. Test user-message and assistant-message persistence.
7. Test history loading and chat deletion through the assistant API routes.

The database provider is not required for the generic UI to render. It is required only for the application composition that enables persistence.

## Adding another provider

To replace Supabase with Prisma, Drizzle, a REST backend, or another database:

1. Implement `AssistantPersistence` in a new application-owned adapter, for example:

   `app/infrastructure/assistant/prisma/assistant-persistence.ts`

2. Keep provider imports, schema types, transactions, and row transformations inside that adapter.
3. Update `app/api/ai-assistant/route.ts` to inject the new adapter.
4. Leave `features/ai-assistant/server/handle-assistant-request.ts` unchanged.
5. Implement the history HTTP route against the same provider and leave the history sidebar using `assistantHttpHistoryClient`.
6. Run the provider-free test path with `createInMemoryAssistantPersistence()`.
7. Search for leaks:

   ```text
   rg -n "lib/supabase|@supabase|prisma|drizzle" features/ai-assistant
   ```

The search should return no provider imports in TypeScript or TSX files under the generic feature.

## Assistant-only mode

For a project that does not need persistence or ShopMate agents, compose the generic assistant with:

- `features/ai-assistant/server/default-assistant-runtime.ts`
- `features/ai-assistant/test/in-memory-assistant-persistence.ts`
- a route that injects the in-memory adapter

This mode should not import `lib/supabase`, require Supabase environment variables, or initialize a database client. It still supports normal chat rendering and assistant streaming; it simply uses the selected persistence lifetime.

## Common mistakes

### Importing a server adapter into client configuration

Do not import anything from `app/infrastructure/assistant/**` into:

- `features/ai-assistant/integration/`
- `features/ai-assistant/chat-wrapper.tsx`
- `features/ai-assistant/chat-container.tsx`
- client-side history or artifact components

This can cause server-only environment variables to be evaluated in the browser bundle.

### Making the route contain database logic

`app/api/ai-assistant/route.ts` should only compose dependencies and delegate. Query logic belongs in the infrastructure adapter or repository layer.

### Passing database rows into UI

Map database rows to assistant DTOs at the adapter or API boundary. Components should receive `AssistantHistoryItem`, not Supabase `Chat` rows.

### Treating the in-memory adapter as production persistence

The in-memory adapter is isolated and useful for tests or local assistant-only mode. It is process-local and does not survive restarts or scale across instances.

## Verification references

- Phase plan: `app/development/migration-phases/2-assistant-refactor-2/PHASE-09-ASSISTANT-PERSISTENCE-BOUNDARY.md`
- Route composition: `app/api/ai-assistant/route.ts`
- Generic handler: `features/ai-assistant/server/handle-assistant-request.ts`
- Contracts: `features/ai-assistant/model/assistant-persistence.ts`
- Provider-free adapter: `features/ai-assistant/test/in-memory-assistant-persistence.ts`
- Current Supabase adapter: `app/infrastructure/assistant/supabase/assistant-persistence.ts`
