# Assistant Message Persistence

This unit owns the assistant’s message-saving decision boundary. It supports guest conversations in browser storage and authenticated conversations in Supabase.

## Storage modes

```text
No application user
  → local mode
  → localStorage guest history

Application user loaded
  → database mode
  → sm_users / sm_chats / sm_messages
```

The user must never be logged in automatically. The mode changes only after an explicit login action.

## Orchestrator

[`saving-orchestrator.ts`](./saving-orchestrator.ts) is the single decision boundary for local history operations. UI components should not directly read or write chat history storage.

Current responsibilities:

- Select local or database mode.
- Save and read guest chats.
- Clear guest history after a successful merge.
- Keep the local history shape provider-neutral.

[`lib/local-chat-history.ts`](./lib/local-chat-history.ts) owns the browser storage key and the safe read/write/clear operations. The stored versioned shape is:

```ts
{
  version: 1,
  chats: [{ id, title, createdAt, updatedAt, messages }]
}
```

## Guest refresh restoration

[`use-chat-messages.ts`](../components/history-sidebar/hooks/use-chat-messages.ts) uses the current session mode when restoring a selected chat:

- Logged-out users load the matching chat and its `UIMessage[]` directly from local storage.
- Logged-in users load messages through the assistant history API.
- A missing local chat falls through to the API path, preserving the existing new/remote-chat behavior.

This means a guest can refresh a URL containing `?chatId=...` and continue the conversation without a database record.

## Artifact persistence

Artifact content is stored inside the completed assistant message as a `data-artifactContent` part. This keeps guest artifacts local together with their chat messages. The part contains the artifact document ID, title, kind, and content.

When a chat is restored, the message loader also rehydrates the shared artifact state so sheet, text, and chart artifacts remain available after refresh. Authenticated chats use the same message part when loaded from Supabase.

## Runtime wiring

### Chat lifecycle

[`features/ai-assistant/chat-container.tsx`](../chat-container.tsx) saves the completed response when the stream finishes.

- Local mode saves the completed chat and messages through the orchestrator.
- Database mode continues through the server persistence adapter.

### Assistant request

The client will send a `persistenceMode` field with each assistant request:

```ts
{
  persistenceMode: 'local' | 'database'
}
```

The server handler will skip Supabase chat/message writes for local mode while still running the assistant response.

### Sidebar history

The history sidebar will use the same normalized history contract for both sources:

```text
local mode     → MessageSavingOrchestrator.getLocalChats()
database mode  → /api/ai-assistant/history
```

### Login merge

After the user explicitly clicks the demo login button:

1. Resolve the authenticated application user.
2. Read local guest chats.
3. Send them to `/api/ai-assistant/history/merge`.
4. Insert chats into `sm_chats`.
5. Insert messages into `sm_messages`.
6. Ignore duplicate chat/message IDs.
7. Clear local history only after the merge succeeds.
8. Refresh the sidebar.

## Implemented files

- `saving-orchestrator.ts`
- `lib/local-chat-history.ts`
- `hooks/use-message-persistence-sync.ts`
- `server/merge-local-history.ts`
- `server/supabase-assistant-persistence.ts`
- `app/api/ai-assistant/history/merge/route.ts`
- `features/ai-assistant/chat-container.tsx`
- `features/ai-assistant/components/history-sidebar/components/sidebar-history.tsx`
- `features/ai-assistant/components/history-sidebar/hooks/use-chat-messages.ts`
- `features/ai-assistant/hooks/use-user-session.ts`
- `features/ai-assistant/schema/assistant-request-schema.ts`
- `features/ai-assistant/server/handle-assistant-request.ts`

## Safety rules

- Never expose `DEV_PASSWORD` to the browser.
- Never clear local history before the database merge succeeds.
- Never make the sidebar depend on a provider-specific response shape.
- Never let UI components call Supabase directly.
