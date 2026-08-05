# AI Assistant

The reusable assistant feature. It owns chat transport, streaming, message and artifact presentation, history UI, persistence contracts, and assistant state needed to render a conversation.

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
├── model/                  # Contracts: runtime, persistence, events, documents, endpoints.
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

`features/ai-assistant` must never import `features/shop-assistant`, catalog/cart entities, or a concrete Supabase/Prisma/Drizzle client. Database adapters belong under application infrastructure and are injected at the route boundary.

## Adding the assistant to a new project

1. Copy this feature and its generic UI dependencies.
2. Implement `AssistantRuntime` for the project, or use the default runtime for normal chat.
3. Implement `AssistantPersistence` only if chat history must be stored.
4. Implement `AssistantHistoryClient` if the history sidebar is enabled.
5. Configure the assistant endpoint and persistence routes in `model/api-endpoints.ts`.
6. Mount `AssistantRootProvider` and `ChatWrapper` from the application shell.
7. Add business behavior as a separate adapter feature; do not add business imports to this folder.

