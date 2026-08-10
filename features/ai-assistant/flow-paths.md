# AI Assistant Flow Paths

A simple walkthrough of what happens from mounting the chat to getting a streamed reply — and how a tool card click continues the workflow.

This feature owns **UI + transport**. Product agents and tools live in `features/closer-assistant` (or another business adapter).

Business-logic patterns (pick by product type):

- [`docs/retrieval-first-business-logic.md`](./docs/retrieval-first-business-logic.md) — catalog / Q&A
- [`docs/workflow-hitl-business-logic.md`](./docs/workflow-hitl-business-logic.md) — confirm / mutate (Closer-style)

See also [`../closer-assistant/docs/architecture.md`](../closer-assistant/docs/architecture.md).

---

## Big picture

```text
CloserAssistantIntegration          product glue (tools, callbacks, branding)
        ↓
ChatWrapper                         shell layout (header, sidebar, content)
        ↓
ChatContainer                       live chat orchestrator (useChat, input, messages)
        ↓  HTTP POST /api/ai-assistant
handleAssistantRequest              generic request + persistence + SSE stream
        ↓
closerAssistantRuntime              business stream adapter
        ↓
resolvePropertyAgentRoute           pick prompt + gated tools for this turn
        ↓
stream back to ChatContainer        text + tool parts → toolRenderers cards
```

---

## 1. Entry: product integration

**File:** `features/closer-assistant/ui/closer-assistant-integration.tsx`

The host mounts the reusable assistant and injects product-specific pieces:

| Passed into `ChatWrapper` | Role |
|---|---|
| `toolRenderers` | Map of tool name → React card/form (e.g. `propertyToolRendererCatalog`) |
| `toolRendererContext` | Host callbacks (cache invalidate, quota, etc.) |
| `endpoint` | API URL (`/api/ai-assistant`) |
| `chatId` | Session id (URL may override) |
| `onCommand` | Optional host side-effect when a card emits a workflow command |

`ai-assistant` does not know about properties. It only receives a registry and opaque context.

---

## 2. Shell: ChatWrapper

**File:** `features/ai-assistant/chat-wrapper.tsx`

Owns layout state only:

- `AssistantShellHeader` — collapse, sidebar, fullscreen
- `AssistantShellContent` — sidebar + main area
- Resolves `chatId` from the URL, falling back to the integration prop

Then renders `ChatContainer` with the integration props (renderers, endpoint, context, `onCommand`).

---

## 3. Live chat: ChatContainer

**File:** `features/ai-assistant/chat-container.tsx`

Main client orchestrator between sidebar, message list, artifact panel, and input.

| Piece | What it does |
|---|---|
| `useChat` | Sends/receives the conversation; owns `messages`, `sendMessage`, `setMessages`, `status` |
| `useChatMessages` | Loads a selected history chat into `setMessages` (sidebar) |
| `useChatSubmission` | Holds input text + selected model; exposes `handleSubmit` for the prompt input |
| `MessageList` | Renders message parts; looks up `toolRenderers` for tool results |
| `ArtifactPanel` | Side panel when stream emits artifact data parts |

### Tool cards in the message stream

When the stream emits a tool part (e.g. `browseProperties`), the message renderer looks up:

```text
toolRenderers["browseProperties"]
```

- **Match** → your product card (map, confirm buttons, ad form, …)
- **No match** → generic/raw tool output

Keys must match **server tool names** exactly. That is why closer-assistant keeps a shared tool catalog.

### Card click → next turn

Interactive cards call `onCommand` / `handleAssistantCommand`. That builds a short user text **and** sends `assistantCommand` in the request body so the server can gate the next agent/tools.

Today that command→text mapping lives inline in `chat-container.tsx`. That couples the generic container to Closer command strings — a known scaling smell (see notes below). Free-text submit goes through `useChatSubmission` without `assistantCommand`.

---

## 4. API route (thin adapter)

**File:** `app/api/ai-assistant/route.ts`

The route does almost no business logic:

1. Resolve auth → choose `persistenceMode` (`database` vs `local`)
2. Call `handleAssistantRequest(request, closerAssistantRuntime, closerAssistantPersistence)`

Here **`ai-assistant`’s generic server work ends** at the handler; the **runtime + persistence** are injected from closer-assistant.

---

## 5. Generic handler: handleAssistantRequest

**File:** `features/ai-assistant/server/handle-assistant-request.ts`

Reusable server steps:

1. Parse the request (messages, model, business context / `assistantCommand`)
2. Load or create the chat (if database mode)
3. Save the latest user message
4. Extract the user query
5. Open a UI message stream and call `runtime.stream(...)`
6. Persist assistant output / finish hooks
7. Return SSE to the browser

The handler never picks agents or tools. It only calls the injected runtime.

---

## 6. Business runtime → agent route

**File:** `features/closer-assistant/server/closer-assistant-runtime.ts`

`closerAssistantRuntime.stream`:

1. Read optional `assistantCommand` from business context
2. Call `resolvePropertyAgentRoute(userQuery, businessContext)`
3. `streamText` with that route’s **system prompt** and **gated tools**
4. Emit thinking/progress step labels for known tools
5. Merge results into the UI stream the handler already opened

### What `resolvePropertyAgentRoute` decides

**File:** `features/closer-assistant/agents/property/property-agent-router.ts`

For **this turn only** (not sticky for the whole chat):

1. **Agent kind** — search / change / ad  
   - Free text → starting agent (heuristics)  
   - Card command → steers kind + next step
2. **Tool gate** — whitelist tools for that workflow step  
   - e.g. selected → prepare/collect tools only  
   - confirmed → generate/update tools only
3. Return `{ systemPrompt, tools }` for `streamText`

So: **free text starts a path**; **`assistantCommand` from a card advances (or gates) the next step** by exposing only the tools for that step.

When streaming finishes, control returns to `ChatContainer`, which renders text and tool cards again.

---

## One turn, end to end

```text
1. User types (or clicks a tool card)
2. ChatContainer sendMessage → POST /api/ai-assistant
3. Route → handleAssistantRequest → closerAssistantRuntime
4. resolvePropertyAgentRoute → prompt + tools for this turn
5. Model may call a tool → result streams back
6. MessageList looks up toolRenderers[toolName] → card UI
7. User confirms on the card → next sendMessage with assistantCommand
8. Repeat from step 2 with a tighter tool gate
```

---

## Boundary checklist

| Layer | Owns | Does not own |
|---|---|---|
| Integration | Branding, tool renderer map, host callbacks | Streaming protocol |
| `ChatWrapper` | Shell layout / chat id from URL | Agents, tools execute |
| `ChatContainer` | `useChat`, submit, message/tool presentation | Which agent runs |
| `handleAssistantRequest` | Parse, persist, SSE shell | Domain routing |
| Closer runtime + router | Prompt, tool gate, tool execute | Generic chat chrome |

---

## Known scaling notes

These are intentional “current state” caveats, not hidden bugs:

1. **Command text mapping in `chat-container`** — Closer `property-*` command strings live in the generic container. Prefer moving that to the integration / a command→message helper so `ai-assistant` stays product-agnostic.
2. **Single entity family today** — the runtime always enters the property router. Other entities need a top-level entity router (see closer-assistant architecture doc).
3. **No stored workflow state machine yet** — gating is via per-request tool whitelist + `assistantCommand`, not `transitions.ts` / persisted `PropertyWorkflowState`.
