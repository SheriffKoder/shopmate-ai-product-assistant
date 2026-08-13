# Pattern: Operation-Driven Workflow / HITL Business Logic

Use this pattern when an assistant must guide users through business records and
require explicit human confirmation before writes, generation, booking, assignment,
or other consequential side effects.

For read-heavy catalog/Q&A products, see
[`retrieval-first-business-logic.md`](./retrieval-first-business-logic.md). Most
business assistants combine retrieval operations with HITL mutation operations.

## Core principle

The LLM interprets free text. Deterministic application code owns workflow state,
authorization, confirmation, mutation, completion, and client reconciliation.

```text
free text
  → bounded planner
  → registered operation
  → canonical task inputs
  → authorized retrieval/proposal tool
  → structured renderer

structured UI action
  → revisioned command
  → direct command endpoint (no LLM)
  → proposal/auth/freshness verification
  → domain mutation
  → standardized completion + cache metadata
```

Prompts are guidance. Schemas, operation registration, revision checks, signed
proposals, server authorization, RLS, and direct commands are enforcement.

## Generic shell versus business implementation

| Layer | Responsibility |
|---|---|
| Generic assistant | Chat UI, streaming, history, typed tool-part protocol, opaque command hooks |
| Business assistant | Planner catalog, operation registry, task state, tools, authorization, renderers, cache/drawer integration |
| API routes | Thin adapters to runtime or deterministic command executor |
| Entity/domain code | Canonical repositories, mutations, query keys, RLS-compatible server use cases |

The generic shell must not know business entities, tool names, permissions, cache
keys, or drawer keys.

## Recommended layout

```text
features/<product>-assistant/
├── authorization/
├── cache/
├── conversation/
│   ├── model/          # task, plan, command, operation contracts
│   ├── client/         # task reducer/context
│   └── server/         # planner, resolver, transition, command dispatcher
├── operations/
│   └── <entity>/<operation>/
├── resolution/
├── server/
├── tools/
└── ui/
```

Do not create a hierarchy of model “agents” or specialist routers when a registered
operation can own the behavior directly.

## Operation contract

Each operation owns:

- model-facing label and classification description;
- focused system prompt;
- intent parser and aliases;
- canonical task-input merge behavior;
- next-step/phase resolution;
- operation-specific tool set;
- deterministic structured-command execution.

The runtime plans an operation ID and resolves it against the registry. Unknown
operations cannot expose tools. Adding an entity means registering definitions, not
adding runtime branches.

## Task context

Task state stores only the canonical workflow snapshot:

```text
entity, operation, action, variant, phase
inputs (lookup + desired outcome)
references (selected record/proposal IDs)
revision, updatedAt
```

The browser retains context for continuity, but the server validates operation and
revision on every structured command. A clear new operation may pause/switch the
active task; short answers may continue it.

## Retrieval and proposal phase

Model-facing tools may search, resolve, summarize, or prepare signed proposals. They
must not trust model-provided IDs, roles, scope, permissions, or confirmation claims.

Mutation discovery separates:

```text
lookup/current filters → identify the existing authorized row
desired changes        → populate the proposal after selection
```

Return explicit structured outcomes for one match, ambiguous matches, no matches,
missing input, proposal, completion, and recoverable failure.

## Structured renderer phase

Cards, maps, forms, briefs, and proposal components own business presentation. They
emit typed commands containing opaque IDs and edited values. Human-readable text and
machine commands remain separate.

Stop the model loop when a structured renderer owns the result. Otherwise the model
may duplicate cards, reinterpret filters, or claim unsupported outcomes.

## Direct confirmation phase

Selection and confirmation UI actions that deterministically advance a workflow use
a host-provided direct-command handler:

1. wrap the command with entity, operation, and active revision;
2. post to the business command route;
3. validate the envelope and active task;
4. delegate to the registered operation command handler;
5. verify proposal signature, expiry, freshness, authorization, and edited fields;
6. execute the existing domain mutation once;
7. return a task event and completion metadata;
8. append the actual server result to chat.

Never convert Confirm into “yes, apply it” and send it to the LLM.

## Completion contract

Successful mutations should return:

- `kind: completed`;
- `entity` and `operation`;
- affected `recordIds`;
- host-owned `cacheTags`;
- optional `historyCreated`;
- typed `result`/tool output;
- task references and a terminal lifecycle event.

Failures return concise, recoverable user text. Raw schema arrays, provider errors,
database policy details, and secrets stay in protected development logs.

## Host integration

The business host maps cache tags to canonical TanStack cache helpers and awaits
reconciliation after successful writes. It may also expose page-based URL drawers for
read-only Open actions. These are product behaviors and do not belong in the generic
assistant.

## When a smaller pattern is enough

Use retrieval-first alone when all operations are read-only and lookup plus server
render can authoritatively answer the question. Add operation/HITL infrastructure when you need
any of:

- multi-turn input collection;
- entity selection;
- editable proposals;
- confirmation before side effects;
- resumable/switchable workflows;
- deterministic UI actions;
- completion-driven cache reconciliation.

## Minimum verification matrix

- free-text routing to every registered operation;
- parser aliases and stale-context behavior;
- lookup versus desired-change separation;
- authorized one/many/no-match resolution;
- selection retains desired changes;
- form contains only issued fields;
- Confirm bypasses the LLM;
- expired, modified, stale, and unauthorized proposals fail safely;
- mutation runs once and returns actual completion metadata;
- cache tags invalidate the correct query families;
- renderer keys match streamed typed tool parts;
- cancellation and operation switching maintain valid task state;
- authenticated smoke tests exercise provider, RLS, browser UI, and cache paths.

Concrete reference: [`../../closer-assistant/README.md`](../../closer-assistant/README.md).
