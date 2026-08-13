# Tools vs components vs server functions

When to build an AI tool, a React component, or a runtime-called server function.

## Short answer

In Shop Assistant, catalog, cart, and artifacts are **not** AI tools. They are server render functions plus UI components.

Use an AI tool only if the **model** must choose whether, when, and with which arguments to call something.

## The three layers

### Component

A React UI piece. It **renders** data the user already has.

Examples: product card, cart row, `DocumentPreview`, download button.

It does not decide what to fetch. It does not talk to the model. It takes props or stream data and draws.

```text
data → component → UI
```

### AI tool (AI SDK `dynamicTool` / `tool`)

A **function the model is allowed to call** during generation.

The LLM sees a name, description, and input schema. It may emit: “call `productSearch` with `{ query: "phones" }`”. The server runs `execute()`, then the model continues with the result.

```text
model decides → tool execute → result back to model (+ maybe UI stream)
```

The long “MANDATORY: use this tool…” text exists **for the model**, not for React.

### Server function (what v2 uses for shop UI)

Runtime already knows `action` + `view` and already has lookup rows. Your code calls the function. No model in the loop.

```text
planner decides → server function → stream data parts → component
```

Catalog sheets already work this way: runtime → `createSheetDocument` → `DocumentPreview`. Cards and cart use the same pattern.

## When to build which

| You need… | Build |
|---|---|
| Buttons, cards, layout, artifact panel | **Component** |
| Runtime already knows what to show (cards, sheet, cart) | **Server function** + persisted stream parts + component |
| The model must discover/act mid-reply with unknown args | **AI tool** |

Rule of thumb:

- **Component** = how it looks
- **AI tool** = model can call this
- **Server function** = we call this

If the planner already says `view: cards`, do not wrap it as an AI tool. The model has nothing left to decide.

## ShopMate mapping

| Thing | v1 | v2 |
|---|---|---|
| Product card UI | component (`product-card.tsx`) | same, under `ui/cards/` |
| Cart controls UI | component | same, under `ui/cart/` |
| Stream lookup rows as cards | AI tool `productSearch` (searches again) | server function from lookup rows |
| Sheet from catalog CSV | server function (`createSheetDocument`) | keep |
| Text artifact, shop | often `createDocument` AI tool | server function, fill from lookup rows |
| Text artifact, technical | `createDocument` AI tool | server function, runtime-called |
| Cart display | AI tool `cartInfo` (optional AI rank) | server function from `CartSource` |
| Rec / compare follow-up chips | speaker markdown or extra cards | schema `metadata` + `server/render/ui-metadata` + `ui/metadata/buttons.tsx` |
| Web search / unknown API mid-reply | — | only then an AI tool |

## What v1 “tools” are not

- `dynamicTool`, model `description`, LLM `inputSchema`
- “MANDATORY: use this tool…” prompts
- A second catalog search inside `productSearch.execute`
- `analyzeItemsWithAI` inside cart display unless we explicitly reintroduce ranking as its own node

Keep the inner stream + UI:

- write `data-productCard` / cart / artifact / `data-uiMetadata` parts
- product, cart, and metadata button components
- `streamArtifactMetadata` + `createSheetDocument` / `createTextDocument`

## UI persistence caveat

v1 chat cards mount from **AI tool parts** (`toolName === 'productSearch'`), while `data-productCard` is transient live stream. After refresh, durable UI is the tool result.

v2 persists like catalog sheets: non-transient `data-productCards` / `data-cart`. See [`stream-parts.md`](./stream-parts.md). Do not emit fake tool-call parts.

## When a real AI tool is justified

Add a `dynamicTool` only if all of these are true:

1. The runtime cannot know the action from schema + planner.
2. Arguments are open-ended (search query, URL, id the model must choose).
3. The speaker needs the result to continue the reply.

Examples that would qualify: web search, “email this summary”, an unknown third-party API. Catalog search, cart display, and shop artifacts do not.
