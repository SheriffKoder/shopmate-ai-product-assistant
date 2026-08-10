# Pattern: Workflow / HITL Business Logic

Use this when the assistant’s main job is a **guided multi-step path** with confirmation before side effects — not primarily “look up and answer.”

Typical products: CRM/property assistants, booking changes, proposal → confirm → apply, ad/content generation with review, anything where skipping a step is unsafe.

Related:

- Sibling pattern (catalog / Q&A): [`retrieval-first-business-logic.md`](./retrieval-first-business-logic.md)
- Generic request path: [`../flow-paths.md`](../flow-paths.md)
- Closer architecture (concrete instance): [`../../closer-assistant/docs/architecture.md`](../../closer-assistant/docs/architecture.md)
- Runtime contract: [`../model/assistant-runtime.ts`](../model/assistant-runtime.ts)

---

## When to choose this

Choose **workflow / HITL** if most of these are true:

- Wrong behavior is **mutating too early** or skipping confirm
- Critical steps use **cards/forms** (select entity, edit fields, Confirm)
- Free text alone must **not** unlock write tools
- You need a small set of specialists (browse vs change vs generate), not dozens of Q&A intents

If the product is mostly search/recommend/compare against a store, use the [retrieval-first pattern](./retrieval-first-business-logic.md) (or combine both — see below).

---

## Core contract

```text
user message (+ optional assistantCommand from a card/form)
  → family / specialist router
  → tool gate (whitelist for this workflow step)
  → streamText({ systemPrompt, gated tools })
  → tool UI card/form
  → user confirms → next request with assistantCommand
```

Live enforcement = **latest structured command → tool allow-list**.  
Prompts are guidance; gates are safety.

---

## What `ai-assistant` provides vs what you build

| Layer | Owns |
|---|---|
| `features/ai-assistant` | Chat UI, stream, history, `toolRenderers` map, opaque `onCommand` / request body |
| Your `*-assistant` feature | Commands, workflow gates, agents, tools, auth inside tools, integration wiring |
| App API route | Inject your runtime + persistence into `handleAssistantRequest` |

The generic shell should stay **product-agnostic**. Avoid hard-coding domain command strings inside `chat-container` long-term — prefer a helper owned by the business integration.

---

## Recommended business layout

```text
features/<product>-assistant/
├── agents/
│   ├── <entity>/                 # family router + workflow/
│   │   ├── <entity>-agent-router.ts
│   │   └── workflow/
│   │       ├── commands.ts       # single source of truth for UI commands
│   │       ├── router.ts         # command → tool gate
│   │       ├── state.ts          # optional; wire when state is stored
│   │       └── transitions.ts    # optional; needs stored state
│   └── <entity>-<job>/           # thin specialists (prompt + agent.ts)
├── tools/
│   └── <entity>/                 # capability pack + name/renderer catalogs
├── server/
│   └── <product>-runtime.ts      # AssistantRuntime → family router
└── ui/
    └── <product>-integration.tsx # ChatWrapper + toolRenderers + host callbacks
```

---

## Implementation checklist

### 1. Commands as the single source of truth

Define typed workflow commands in one module. Cards/forms **emit** them; routers **parse** them. No parallel string unions in UI vs server.

Example shapes (domain-specific names will differ):

```ts
type WorkflowCommand =
  | { type: 'entity-selected'; payload: { id: string; workflow?: string } }
  | { type: 'entity-confirmed'; payload: { proposalId: string } }
  | { type: 'details-submitted'; payload: { ... } }
  | { type: 'cancelled'; payload?: { ... } }
```

Client sends `assistantCommand` in the request body (via `sendMessage` options). Server reads it from `businessContext`.

### 2. Tool gates (whitelist)

Map each command (or gate id) to the **only** tools allowed on the next turn:

```text
no command / browse     → discovery tools only
selected                → prepare / collect tools
details submitted       → proposal tools
confirmed               → apply / generate tools
cancelled               → discovery again
```

Implement as `restrictTools(allTools, gate)` — do not rely on the model to “only call confirm.”

### 3. Family router → specialists

Keep a small router that returns `{ kind, systemPrompt, tools }` for the runtime:

```text
resolveEntityAgentRoute(userQuery, businessContext)
  1. resolve kind from command gate, else free-text heuristics
  2. resolve tool gate from the same command
  3. create specialist tool set
  4. restrict to whitelist
```

Runtime stays dumb: it only streams whatever the router returns.

### 4. HITL rules

| User action | Advances workflow? |
|---|---|
| Click Confirm / submit form (emits command) | Yes |
| Free text “yes” / typing form fields in composer | No (unless you explicitly design a parser — usually don’t) |
| New free-text browse while mid-flow | Usually discovery tools only; do not keep write tools hot |

This is intentional safety.

### 5. Auth and side effects inside tools

Authorization, confirmation tokens, and persistence belong in **tool execute** (server), not in the prompt. Tool results feed cards; cards emit the next command.

### 6. Tool + renderer catalogs

- Server-safe catalog: tool names, step labels, discovery list  
- Client catalog: tool name → React renderer  

Keys must match exactly or the shell falls back to generic tool output.

### 7. Optional full state machine

`state.ts` / `transitions.ts` only pay off when you **store** workflow state on chat/session/request. Until then, **command → gate** is enough. Promote when you need sticky mid-flow recovery, resume, or validation against prior steps.

---

## Free text vs commands

| Input | Role |
|---|---|
| Free text | Start a path / switch browse topic (heuristics or later a small classifier) |
| `assistantCommand` | Advance or gate the next step on an existing path |

Do **not** replace HITL commands with an LLM classifier. A classifier may help only on the **no-command** branch when free-text phrases collide.

---

## Scaling checklist (by symptom)

| Symptom | Promote to |
|---|---|
| Second entity domain (bookings, clients, …) | Top entity router + namespaced commands + per-entity tool packs |
| Free-text misroutes between specialists | UI intent chips first; small LLM classifier only if still needed |
| Mid-flow abandon / entity switch feels broken | Ignore stale command on clear topic change; optional stored workflow state |
| Model invents entities to mutate | Require ids from prior tool results / commands; auth in tools |

---

## Combining with retrieval-first

Many products need both:

```text
browse / Q&A     → retrieval-first (lookup before answer)
mutate / generate → workflow HITL (command + tool gate)
```

Same `AssistantRuntime`, different branches after a top-level intent or command namespace check.

---

## Test matrix (minimum)

- Free-text discovery (read-only tools only)
- Select entity on card → prepare step tools only
- Confirm → apply/generate runs once with valid token
- Free text “yes” does **not** apply
- Cancel returns to discovery
- Tool card renders via registry (name match)

---

## Example references in this repo

- Closer adapter: `features/closer-assistant/`
- Property router + workflow commands: `features/closer-assistant/agents/property/`
- Flow walkthrough (shell → runtime): [`../flow-paths.md`](../flow-paths.md)
