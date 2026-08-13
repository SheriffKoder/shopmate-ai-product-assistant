# Pattern: Retrieval-First Business Logic

Use this when the assistant’s main job is to **answer from a store, catalog, or API** — not to run multi-step confirm mutations.

Typical products: shop assistants, product Q&A, recommendations, comparisons, “create a table of…”, FAQ backed by docs or inventory.

Live example: [`features/shop-assistant/`](../../shop-assistant/). Architecture: [`../../shop-assistant/docs/architecture.md`](../../shop-assistant/docs/architecture.md).

Related:

- Sibling pattern (mutations / HITL): [`workflow-hitl-business-logic.md`](./workflow-hitl-business-logic.md)
- Generic request path: [`../flow-paths.md`](../flow-paths.md)
- Runtime contract: [`../model/assistant-runtime.ts`](../model/assistant-runtime.ts)
- Tool vs server function vs component: [`../../shop-assistant/docs/tools.md`](../../shop-assistant/docs/tools.md)
- Stream parts: [`../../shop-assistant/docs/stream-parts.md`](../../shop-assistant/docs/stream-parts.md)

---

## When to choose this

Choose **retrieval-first** if most of these are true:

- The main failure mode is **invented or stale data** (hallucinated products, prices, stock)
- Users mostly type **free text** (“laptops under $500”, “compare these”)
- Side effects are rare or soft (browse, recommend); hard writes are secondary
- Empty results must be honest (apologize — do not fabricate substitutes)

If the product is mostly “propose → confirm → apply”, use the [workflow / HITL pattern](./workflow-hitl-business-logic.md) instead. Many apps need **both** (see bottom).

---

## Core contract

```text
user message
  → one schema LLM (label action + filters + view)
  → planFromSchema (pure; no model)
  → required domain lookup? (source of truth)
  → server render (view → cards / sheet / document / cart / Find chips)
  → optional speaker (no tools)
```

**Lookup before generation.** A prompt that says “always use the search tool” is not enough. Runtime calls the source when the plan requires it. The model does not pick tools.

The schema LLM interprets free text. The planner owns lookup vs refuse vs cart vs presentation. Server functions stream UI. An optional speaker writes prose after render.

Do not add a classifier, extractor, specialist-agent router, or `tools/` folder for catalog/cart/artifacts. Those were the v1 retrieval-first recipe. They are archived, not a second model.

---

## What `ai-assistant` provides vs what you build

| Layer | Owns |
|---|---|
| `features/ai-assistant` | Chat UI, stream, history, `AssistantRuntime`, stream-part + tool renderer registries, artifact helpers |
| Your `*-assistant` feature | Schema, `planFromSchema`, domain source, server render, stream-part UI, optional speaker |
| App API route | Inject your runtime + persistence into `handleAssistantRequest` |

Do **not** put product URLs, SKUs, or catalog types into `ai-assistant`. Core forwards `sendMessage` / `status` into stream-part renderers; it must not import business cards.

---

## Business layout

Layer folders. No `agents/`. No `tools/` unless the model must call something with unknown args mid-reply.

```text
features/<product>-assistant/
├── model/
│   ├── assistant-request.ts    # action + filters + view (+ optional metadata)
│   ├── execution-plan.ts       # planFromSchema (pure)
│   └── sources/                # CatalogSource / CartSource contracts
├── schema/
│   └── assistant-request-schema.ts
├── lib/                        # deterministic match, parse data-* parts
├── transform/                  # rows → CSV / markdown / card payload
├── server/
│   ├── request-agent.ts        # one generateObject
│   ├── <product>-runtime.ts    # schema → plan → lookup → render → speaker
│   ├── speaker.ts              # optional streamText, no tools
│   ├── sources/                # source adapters
│   └── render/                 # cards, sheet, document, cart, refuse, metadata
├── ui/
│   ├── integration/            # mount + stream-part registry
│   ├── cards/ / cart/ / …
└── config/                     # suggestion chips
```

HTTP/DB live behind the source interface. Chat remounts from persisted `data-*` parts, not fake `dynamicTool` results.

---

## Schema

One closed schema. If two values do not change lookup, render, or cart, they do not belong here.

```ts
{
  action: 'catalog' | 'cart' | 'policy' | 'technical' | 'unrelated',
  catalogQuery: string,   // "" = browse all
  category: string | null,
  constraints: {
    minPrice: number | null,
    maxPrice: number | null,
    colors: string[],
    features: string[],
    sortBy: 'relevance' | 'rating' | 'price-low' | 'price-high' | null,
  },
  view: 'cards' | 'sheet' | 'document' | 'conversation',
  metadata: {
    type: 'none' | 'buttons',
    items: Array<{ label: string; value: string }>,
  },
}
```

| Field | Used by | Not used for |
|---|---|---|
| `action` | skip lookup / refuse / cart / technical / catalog | picking a specialist agent |
| `catalogQuery` + `category` + `constraints` | catalog lookup | presentation |
| `view` | cards vs sheet vs document vs prose | whether to search |
| `metadata` | conversation Find chips | lookup, SKUs, or render choice |

`table` / `sheet` belongs on `view`, not `action`. Rec / compare is `view: conversation` plus optional `metadata.buttons`. Click is a visible follow-up turn (`Provide X from the catalog`), not dumped cards. See [`../../shop-assistant/docs/conversation.md`](../../shop-assistant/docs/conversation.md).

Validate and normalize before planning: trim query text, drop empty metadata items, reject unsupported categories/sort modes, default omitted constraints. If labeling fails, use a safe default (`catalog` + `conversation`), not a second classifier.

---

## Planner

Pure function. No model. `planFromSchema({ action, view })` → lookup? render? speaker?

View never overrides action: `cart` + `document` still renders cart. `unrelated` + `sheet` still refuses.

Then execute in order: lookup → render → optional speaker.

---

## Lookup

Domain lookup does **not** use AI. Inject a real `CatalogSource` (or equivalent). Runtime calls it when the plan requires rows.

This node owns unique catalog values and which rows come back. Do not search again inside a `productSearch` AI tool after lookup.

Conversation rec / compare may **skip** lookup. Schema `view` + `metadata` own discussion vs cards. Find chips come from the label, not from inventing SKUs.

Pass an explicit completion signal when useful (`lookupEmpty`) so render/speaker can distinguish “no lookup needed” from “source checked, no rows.”

---

## Render

Runtime already knows `action` + `view` and already has rows. Call a **server function**. Mount UI from persisted stream parts.

| `action` + `view` | lookup | What runs |
|---|---|---|
| `unrelated` / `policy` | no | deterministic refuse / policy text |
| `cart` | no | cart UI from `CartSource` |
| `technical` + `document` | no | text artifact from the topic |
| `catalog` + `cards` | yes | stream product cards from rows |
| `catalog` + `sheet` | yes | CSV → sheet artifact from **real** rows |
| `catalog` + `document` | yes | text artifact filled from rows |
| `catalog` + `conversation` | skip | speaker + optional `data-uiMetadata` Find chips |

Shop + document is not a new agent. It is `action: catalog` + `view: document`. If it is shop, fill the document from lookup.

Use an AI tool only if the model must choose whether, when, and with which unknown args to call something (web search, third-party API). Catalog search, cart display, and shop artifacts do not qualify.

---

## Empty-result policy

One shared rule for every store lookup:

```text
no matches → apologize → restate active filters → optional “relax filters”
            → do not invent substitute products
```

---

## UI

Map persisted `data-*` types → cards in the **product** feature (`streamPartRenderers`). Deep links (`/products/[slug]`) belong on the product-card renderer, not in generic assistant suggestion cards. Pass `id` + `slug` (or your canonical URL field) through the stream payload.

Do not remount catalog UI from `toolName === 'productSearch'`. Refresh must remount from non-transient `data-productCards` / `data-cart` / `data-uiMetadata` / `data-artifactContent`.

---

## What this is not

- Not stacked LLM classifiers plus a specialist-agent router.
- Not a wide `StoreIntent` union (`recommendation`, `filtering`, `comparison`, …) that maps 1:1 to agents.
- Not AI tools for catalog, cart, or shop artifacts.
- Not inventing sheet/document rows after a “table” wording leak into routing.
- Not HITL mutations. Cart **read** can be retrieval-first; cart **write** needs [workflow / HITL](./workflow-hitl-business-logic.md).
- Not the previous multi-agent adapter (classifiers, specialist agents, AI tools). That is history, not a second catalog pattern.

---

## Combining with mutations

When you add cart writes, checkout, or other side effects, add the [workflow / HITL](./workflow-hitl-business-logic.md) layer — do not rely on retrieval routing alone:

```text
schema → plan → lookup → (if mutating) proposal + direct confirmation command → renderer
```

Retrieval answers questions; verified direct commands protect writes.

---

## Expected replies

| Prompt | Result |
|---|---|
| Show me smart phones | Cards from lookup only |
| All available products in a table | Sheet artifact from real catalog CSV |
| Buying guide for our smartphones | Text artifact citing lookup rows |
| Windows vs Mac laptops | Technical text artifact, no fake SKUs |
| Edit my cart | Cart UI, no catalog lookup |
| Who is Elon Musk? | Short refuse, no lookup |
| diary on the go / compare tablets vs laptops | Speaker text + Find chips; click → cards |

---

## Example references in this repo

- Live adapter: [`features/shop-assistant/`](../../shop-assistant/)
- Runtime: `features/shop-assistant/server/shop-assistant-runtime.ts`
- Schema LLM: `features/shop-assistant/server/request-agent.ts`
- Planner: `features/shop-assistant/model/execution-plan.ts`
- Lookup: `features/shop-assistant/lib/catalog/match-catalog-products.ts`
- Render: `features/shop-assistant/server/render/`
- Stream-part UI: `features/shop-assistant/ui/integration/stream-part-registry.tsx`
