# AI Assistant

The reusable assistant feature. It owns chat transport, streaming, message and artifact presentation, history UI, message-persistence contracts, and assistant state needed to render a conversation.

It does not own products, carts, business rules, agents, business prompts, or a database provider.

## Docs

| Doc | What it covers |
|---|---|
| [`flow-paths.md`](./flow-paths.md) | Human walkthrough: integration → chat UI → API → runtime → tool cards |
| [`docs/retrieval-first-business-logic.md`](./docs/retrieval-first-business-logic.md) | Pattern for catalog / Q&A assistants: intent → lookup → answer |
| [`docs/workflow-hitl-business-logic.md`](./docs/workflow-hitl-business-logic.md) | Pattern for confirm/mutate workflows: command → tool gate → HITL |
| [`docs/DATABASE-INTEGRATION.md`](./docs/DATABASE-INTEGRATION.md) | Persistence / database integration notes |
| [`../closer-assistant/docs/architecture.md`](../closer-assistant/docs/architecture.md) | Closer agents, tool gates, and scaling promotions |

**Pick a business pattern by product type:** use retrieval-first when the risk is invented/stale data; use workflow/HITL when the risk is mutating too early. Many products combine both (browse with retrieval, writes with gates).

## Installation

Install the packages used by the assistant feature:

```bash
npm install \
  ai \
  @ai-sdk/react \
  @ai-sdk/openai \
  @ai-sdk/google \
  @ai-sdk/groq \
  @ai-sdk/mcp \
  @openrouter/ai-sdk-provider \
  @radix-ui/react-collapsible \
  @radix-ui/react-dialog \
  @radix-ui/react-hover-card \
  @radix-ui/react-progress \
  @radix-ui/react-scroll-area \
  @radix-ui/react-select \
  @radix-ui/react-separator \
  @radix-ui/react-tooltip \
  @xyflow/react \
  @supabase/supabase-js \
  cmdk \
  embla-carousel-react \
  lucide-react \
  motion \
  nanoid \
  papaparse \
  react-markdown \
  remark-gfm \
  shiki \
  streamdown \
  swr \
  tokenlens \
  use-stick-to-bottom \
  zod

npm install -D \
  @types/papaparse
```

The feature also expects the host application to provide React, Next.js, and
Tailwind CSS. Assistant UI primitives are copied into
[`components/generic/ui/`](./components/generic/ui/) and assistant files must
import them from that feature-local path. Do not assume the host project's
`components/ui/` directory contains these primitives.

Artifact charts additionally require `react-chartjs-2` and the existing
Chart.js packages:

```bash
npm install react-chartjs-2 chart.js chartjs-plugin-datalabels
```

## Migrating the assistant to a new project

To copy the assistant and shop assistant into a new project, use the following checklist.

### 1. Feature code

Copy both complete feature folders:

- [`features/ai-assistant/`](./)
- [`features/shop-assistant/`](../shop-assistant/)

The AI assistant feature contains the chat UI, providers, artifacts, history, persistence contracts,
model contracts, and server handlers. The shop assistant contains the business runtime, agents, tools,
prompts, and tool renderers.

### 2. API routes

Copy the complete assistant API tree:

- [`app/api/ai-assistant/route.ts`](../../app/api/ai-assistant/route.ts)
- [`app/api/ai-assistant/chat/[chatId]/route.ts`](../../app/api/ai-assistant/chat/%5BchatId%5D/route.ts)
- [`app/api/ai-assistant/chat/[chatId]/messages/route.ts`](../../app/api/ai-assistant/chat/%5BchatId%5D/messages/route.ts)
- [`app/api/ai-assistant/document/route.ts`](../../app/api/ai-assistant/document/route.ts)
- [`app/api/ai-assistant/history/route.ts`](../../app/api/ai-assistant/history/route.ts)
- [`app/api/ai-assistant/history/merge/route.ts`](../../app/api/ai-assistant/history/merge/route.ts)
- [`app/api/ai-assistant/user/route.ts`](../../app/api/ai-assistant/user/route.ts)

The root route handles streaming. The remaining routes support chat history, users, persistence,
and artifacts.

### 3. Application mounting

Mount the assistant provider and business integration in the new project layout. The relevant files are:

- [`features/ai-assistant/providers/assistant-root-provider.tsx`](./providers/assistant-root-provider.tsx)
- [`features/shop-assistant/ui/shop-assistant-integration.tsx`](../shop-assistant/ui/shop-assistant-integration.tsx)
- [`components/layout-wrapper.tsx`](../../components/layout-wrapper.tsx)

Use the equivalent layout wrapper in the new project if its structure differs.

### 4. Shared infrastructure

Copy or recreate the shared dependencies imported by the features:

- [`components/ui/`](../../components/ui/)
- [`shared/lib/utils.ts`](../../shared/lib/utils.ts)
- [`shared/config/env.ts`](../../shared/config/env.ts)
- [`shared/config/table-names.ts`](../../shared/config/table-names.ts)
- [`shared/infrastructure/supabase/`](../../shared/infrastructure/supabase/)

The Supabase-backed version also needs the server client, queries, and database types under
[`shared/infrastructure/supabase/`](../../shared/infrastructure/supabase/).

### 5. Database and migrations

For authenticated history and artifact persistence, copy or recreate:

- [`supabase/migrations/`](../../supabase/migrations/)
- [`shared/infrastructure/supabase/queries/`](../../shared/infrastructure/supabase/queries/)
- [`shared/infrastructure/supabase/types/`](../../shared/infrastructure/supabase/types/)

The database needs tables equivalent to `sm_users`, `sm_chats`, `sm_messages`, and `documents`.

For a local-only first version, use the local persistence implementation instead:

- [`message-persistence/lib/local-chat-history.ts`](./message-persistence/lib/local-chat-history.ts)
- [`message-persistence/saving-orchestrator.ts`](./message-persistence/saving-orchestrator.ts)

### 6. Environment variables

Copy the relevant entries from [`.env.example`](../../.env.example):

```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_TABLE_PREFIX=sm_

OPENAI_API_KEY=

AI_ASSISTANT_DEFAULT_MODEL=
AI_ASSISTANT_SEARCH_MODEL=
AI_ASSISTANT_ALLOWED_MODELS=

NEXT_PUBLIC_AI_ASSISTANT_DICTATION_ENABLED=true
NEXT_PUBLIC_AI_ASSISTANT_DICTATION_PROVIDER=browser
NEXT_PUBLIC_AI_ASSISTANT_DICTATION_AUTO_SUBMIT=true
NEXT_PUBLIC_AI_ASSISTANT_DICTATION_LANGUAGE=en-US
```

### 7. npm packages

Install the packages listed in the [installation section](#installation) of this README.

### 8. TypeScript alias

The project expects the `@/*` alias to point to the project root in [`tsconfig.json`](../../tsconfig.json):

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Recommended migration order

1. Copy [`features/ai-assistant/`](./).
2. Copy [`features/shop-assistant/`](../shop-assistant/).
3. Copy [`app/api/ai-assistant/`](../../app/api/ai-assistant/).
4. Copy shared utilities, UI primitives, and Supabase infrastructure.
5. Copy or migrate the database tables.
6. Add the environment variables.
7. Mount [`AssistantRootProvider`](./providers/assistant-root-provider.tsx) in the application layout.
8. Install the npm packages.
9. Run TypeScript and production build checks.

For a new project, start with local persistence to verify the chat flow, then add Supabase persistence
once the basic assistant integration is working.

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
