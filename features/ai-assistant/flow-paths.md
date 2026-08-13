# AI Assistant Flow Paths

This feature owns generic chat UI and transport. A product integration injects its
runtime, renderer catalog, opaque context, and structured-command handlers.

Related patterns:

- [`docs/retrieval-first-business-logic.md`](./docs/retrieval-first-business-logic.md)
- [`docs/workflow-hitl-business-logic.md`](./docs/workflow-hitl-business-logic.md)
- [Closer’s concrete architecture](../closer-assistant/docs/architecture.md)

## Free-text path (retrieval-first)

Catalog / Q&A runtimes label a schema, look up real rows, then server-render UI. The model does not pick tools. See [`docs/retrieval-first-business-logic.md`](./docs/retrieval-first-business-logic.md).

```text
ProductIntegration
  → ChatWrapper
  → ChatContainer / useChat
  → POST /api/ai-assistant
  → handleAssistantRequest
  → injected AssistantRuntime
  → schema LLM → planFromSchema → lookup? → server render → optional speaker
  → persisted data-* parts
  → streamPartRenderers
```

Live example: `features/shop-assistant/`.

## Free-text path (workflow / HITL)

```text
ProductIntegration
  → ChatWrapper
  → ChatContainer / useChat
  → POST /api/ai-assistant
  → handleAssistantRequest
  → injected AssistantRuntime
  → product planner + registered operation
  → streamText with operation prompt/tools
  → typed tool part
  → product renderer from toolRenderers
```

### Product integration

The host supplies:

- API endpoint and chat identity;
- request-context builder and streamed data handler;
- stream-part renderer catalog and/or exact tool-name → renderer catalog;
- renderer context and optional host callbacks;
- command preparation and direct-command execution;
- empty-state suggestions and branding.

The generic shell treats all business data and commands as opaque.

### Generic request handler

`handleAssistantRequest` parses the request, manages configured persistence, opens
the UI message stream, and delegates to the injected runtime. It does not choose an
entity, operation, prompt, tool, permission, or cache key.

### Product runtime

Retrieval-first runtimes (Shop Assistant) label a schema, look up domain rows,
server-render `data-*` parts, and optionally speak. HITL runtimes (Closer) plan one
registered operation and stream that operation’s prompt and tools. Both implement
`AssistantRuntime` behind the same transport boundary.

### Tool and stream-part rendering

AI SDK tool parts may be statically typed (`tool-<name>`) or dynamic. The message
renderer normalizes the part and performs an exact catalog lookup. Missing keys fall
back to generic output, so server tool names and client renderer keys must match.

Persisted `data-*` parts mount from `streamPartRenderers` the same way. Retrieval-first
adapters remount cards, cart, and Find chips from those parts, not from fake tool results.

## Direct structured-command path

Business cards/forms may emit a command that must not start another model turn:

```text
tool renderer
  → ChatContainer prepares opaque command
  → product isDirectCommand predicate
  → product onDirectCommand handler
  → POST /api/ai-assistant/command
  → product command executor
  → actual server result appended to chat
```

Closer wraps commands with entity, operation, and workflow revision. Its command
executor validates the active task and delegates to the registered operation’s
deterministic handler. Successful mutations return record IDs and cache tags for
host reconciliation.

Commands that are intentionally conversational may still use `sendMessage`, but
confirmation and deterministic selection transitions should use the direct path.

## Persistence and history

The generic handler owns chat/message persistence through an injected adapter. The
business runtime receives portable message history; provider-owned reasoning metadata
may require sanitization before replay. Product task context is carried separately
from visible prose and is validated server-side.

## Boundary checklist

| Layer | Owns | Must not own |
|---|---|---|
| Product integration | Runtime wiring, renderers, business context, command/cache/drawer callbacks | Generic streaming internals |
| `ChatWrapper` | Shell composition and chat identity | Business operations |
| `ChatContainer` | `useChat`, input, messages, tool-part presentation, opaque command branching | Entity semantics or permissions |
| `handleAssistantRequest` | Request parsing, persistence, SSE/UI stream | Product routing and tools |
| Product runtime | Schema/plan/lookup/render, or operation selection + tool streaming | Generic chat chrome |
| Direct command executor | Task validation and deterministic business transition | LLM interpretation |

## One complete HITL interaction

1. User sends free text.
2. Product runtime selects one registered operation.
3. Authorized discovery returns structured candidate cards.
4. User selects a candidate; a direct command advances the task.
5. Server returns a signed proposal form.
6. User confirms; a direct command verifies and mutates without the LLM.
7. Completion metadata reconciles browser caches.
8. Chat displays the actual server outcome.
