# AI Assistant

The reusable assistant feature. It owns chat transport, streaming, message and artifact presentation, history UI, message-persistence contracts, and assistant state needed to render a conversation.

It does not own products, carts, business rules, agents, business prompts, or a database provider.

## Operating modes

### Default mode

Use the assistant as a normal context-aware chat. Inject a generic runtime, or omit business runtime and tool renderers when the host only needs conversation UI.

```tsx
<AssistantRootProvider streamHandler={<DataStreamHandler />}> 
  <ChatWrapper endpoint="/api/ai-assistant" />
</AssistantRootProvider>
```

The assistant still renders messages, handles streaming, supports history when a history client is supplied, and remains usable without agents or tools.

### Business mode

An application adapter injects the business runtime, tool renderer registry, current user, suggestions, persistence, and optional command callbacks.

```text
application route
  → generic assistant request handler
    → injected business runtime
      → business agents and tools
```

The business adapter owns what the assistant can do. The generic assistant only knows the contracts in `model/`.

## File structure

```text
features/ai-assistant/
├── client/                 # Browser HTTP clients, such as history operations.
├── components/             # Chat presentation grouped by UI responsibility.
│   ├── artifacts/          # Text, sheet, chart, and artifact panel UI.
│   ├── history-sidebar/    # Chat history navigation and deletion UI.
│   ├── shell/              # Assistant header and layout composition.
│   ├── message-list.tsx    # Message list orchestration.
│   └── prompt-input.tsx     # Prompt entry and model selection UI.
├── config/                 # Generic defaults such as intro suggestions.
├── data-stream/            # Stream provider and generic stream event bridge.
├── hooks/                  # Assistant-only interaction hooks.
├── integration/            # Factories for composing generic assistant config.
├── lib/                    # Pure assistant utilities, logging, and errors.
├── message-persistence/    # Message persistence contracts and server adapters.
│   ├── model/              # Persistence and history contracts.
│   └── server/             # Server-side persistence implementations.
├── model/                  # Contracts: runtime, events, documents, and endpoints.
├── navigation/             # Link/router helpers that preserve assistant URL state.
├── providers/              # React providers for stream and fullscreen state.
├── server/                 # Request parsing and assistant stream orchestration.
├── test/                   # In-memory adapters and assistant contract tests.
├── tools/                  # Fallback renderer behavior for unknown tools.
├── chat-container.tsx      # Transport-facing chat UI composition.
└── chat-wrapper.tsx        # Assistant shell and session composition.
```

## Import direction

```text
application/views
  → features/ai-assistant integration
    → ai-assistant model contracts
      → shared types/utilities
```

`features/ai-assistant` must never import `features/shop-assistant` or catalog/cart entities. Message persistence is grouped under `message-persistence/`; its server adapter owns the database persistence boundary and is injected at the route boundary. Client UI and generic contracts must remain provider-neutral.

## Assistant URL state

The assistant owns `chatId` as URL state so a conversation can stay attached while the user browses server-first pages. App links that should keep the active assistant session should use `AssistantAwareLink`, and imperative navigation should use `useAssistantAwareRouter`.

Only assistant-owned params are preserved. Page params such as product search, filters, and sorting should stay owned by their pages and should not be copied globally.

## Adding the assistant to a new project

1. Copy this feature and its generic UI dependencies.
2. Implement `AssistantRuntime` for the project, or use the default runtime for normal chat.
3. Implement the contracts in `message-persistence/model/` if chat history must be stored.
4. Add a server adapter under `message-persistence/server/` for the selected persistence provider.
5. Implement `AssistantHistoryClient` if the history sidebar is enabled.
6. Configure the assistant endpoint and persistence routes in `model/api-endpoints.ts`.
7. Mount `AssistantRootProvider` and `ChatWrapper` from the application shell.
8. Add business behavior as a separate adapter feature; do not add business imports to this folder.
