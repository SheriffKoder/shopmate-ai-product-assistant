# Pattern: Retrieval-First Business Logic

Use this when the assistant’s main job is to **answer from a store, catalog, or API** — not to run multi-step confirm mutations.

Typical products: shop assistants, product Q&A, recommendations, comparisons, “create a table of…”, FAQ backed by docs or inventory.

Related:

- Sibling pattern (mutations / HITL): [`workflow-hitl-business-logic.md`](./workflow-hitl-business-logic.md)
- Generic request path: [`../flow-paths.md`](../flow-paths.md)
- Runtime contract: [`../model/assistant-runtime.ts`](../model/assistant-runtime.ts)

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
  → existing broad classifier (when present)
  → structured request extraction + validation
  → deterministic route planner
  → required domain lookup (source of truth)
  → specialist prompt + allowed tools
  → stream answer / cards / tables / artifacts
```

**Lookup before generation.** A prompt that says “always use the search tool” is not enough — the route must require a real source call (or a tool allow-list that cannot answer without it).

Use a schema-constrained LLM extraction step when customers can describe the
same need in many natural ways. The LLM interprets the request; the planner
still owns route priority and lookup requirements. Keep heuristics only as a
resilience fallback when extraction is unavailable or invalid.

---

## What `ai-assistant` provides vs what you build

| Layer | Owns |
|---|---|
| `features/ai-assistant` | Chat UI, stream, history, tool renderer registry, `AssistantRuntime` contract |
| Your `*-assistant` feature | Intents, route planner, catalog/API source, agents, tools, product cards |
| App API route | Inject your runtime + persistence into `handleAssistantRequest` |

Do **not** put product URLs, SKUs, or catalog types into `ai-assistant`.

---

## Recommended business layout

```text
features/<product>-assistant/
├── model/
│   ├── assistant-intent.ts     # typed intent union
│   ├── store-request.ts        # validated semantic request + constraints
│   └── catalog-source.ts       # (or domain-source) interface only
├── schema/
│   └── store-request-schema.ts # validates and normalizes LLM extraction
├── server/
│   ├── request-extraction-agent.ts # schema-constrained LLM extraction
│   ├── intent-extractor.ts     # fallback heuristics only
│   ├── route-planner.ts        # priority rules → intent + required lookup
│   ├── <product>-runtime.ts    # implements AssistantRuntime
│   └── agents/                 # thin specialists (prompt + tool wire-up)
├── tools/
│   └── <domain>/               # search, details, cart-read, …
└── ui/
    └── <product>-integration.tsx
```

Agents stay thin: prompts + tool registration. HTTP/DB live behind the source interface.

---

## Implementation checklist

### 1. Typed intent and structured request

Use a closed intent union and a schema-validated request. The extraction agent
may produce a concise `catalogQuery` for retrieval, but it must not invent
product facts or identities.

```ts
type StoreIntent =
  | 'product-search'
  | 'product-lookup'
  | 'recommendation'
  | 'comparison'
  | 'filtering'
  | 'table'
  | 'availability'
  | 'cart'
  | 'store-policy'
  | 'clarification'
  | 'unrelated'

type StoreRequest = {
  intent: StoreIntent
  catalogQuery: string
  productTerms: string[]
  category: string | null
  useCase: string | null
  constraints: {
    minPrice: number | null
    maxPrice: number | null
    colors: string[]
    features: string[]
    sortBy: 'relevance' | 'rating' | 'price-low' | 'price-high' | null
  }
  outputFormat: 'conversation' | 'product-cards' | 'comparison' | 'table'
}
```

Normalize untrusted model fields before planning: trim query text, de-duplicate
lists, reject unsupported categories/sort modes, and discard invalid price
values. If extraction fails, fall back to a small heuristic extractor or the
existing classifier/router path.

### 2. Deterministic route planner

Prefer explicit priority over stacked LLM classifiers:

```text
cart → exact lookup → comparison → table → availability
  → search/filter → recommendation → policy → clarification → unrelated
```

Planner output should include:

- `intent`
- normalized request entities/constraints
- **`requiredLookup`** (`searchProducts`, `getProductById`, `none`, …)
- selected agent / tool allow-list

### 3. Domain source of truth

Inject a real `CatalogSource` (or equivalent). Replace mocks for any product/table/recommend path.

Every product-related intent must hit the source **before** the model invents rows for answers, tables, or comparisons.

Optional hard guarantee: runtime runs the required lookup **before** `streamText` and passes results into context so the model cannot skip tools.

Pass an explicit completion signal too (for example,
`catalogLookupCompleted`). Agents can then distinguish “no lookup was needed”
from “the source was checked and returned no products.”

### 4. Tool capability contracts

| Intent | Must use |
|---|---|
| lookup | `getProductById` / `searchProducts` |
| comparison | search + details |
| table | search, then artifact tool from **real** rows |
| recommendation | search |
| availability | search or inventory source |
| policy | policy/doc source |
| cart read | cart source / cart tools |

### 5. Empty-result policy

One shared rule for every store lookup:

```text
no matches → apologize → restate active filters → optional “relax filters”
            → do not invent substitute products
```

### 6. UI renderers and links

Map tool names → cards in the **product** feature. Deep links (`/products/[slug]`) belong on the product-card renderer, not in generic assistant suggestion cards. Pass `id` + `slug` (or your canonical URL field) through tool payloads.

### 7. Progress steps (optional)

Examples: Understanding request → Checking store → Filtering → Comparing → Preparing table → Preparing response.

---

## Routing: planner vs classifiers

| Approach | Use when |
|---|---|
| Deterministic planner + heuristics | Default for shop/catalog traffic |
| Deterministic planner + structured LLM extraction | Default when varied natural-language product requests need semantic interpretation; planner still decides precedence |
| Heuristic extraction | Fallback only when structured extraction is unavailable or invalid |
| Multiple LLM classifiers in series | Avoid as the default — cost, latency, drift |

UI chips / explicit intents always outrank free-text classification when present.

---

## Avoid agent sprawl

Do not create one fat agent per phrase on day one. Prefer:

```text
intent → same search tools + different prompt / output shape
```

Split a specialist only when prompts or tool sets collide in production (e.g. policy docs vs catalog search).

---

## Combining with mutations

When you add cart writes, checkout, or other side effects, add the [workflow / HITL](./workflow-hitl-business-logic.md) layer — do not rely on retrieval routing alone:

```text
intent → required lookup → (if mutating) command + tool gate → agent → renderer
```

Retrieval answers questions; gates protect writes.

---

## Test matrix (minimum)

- “Show me laptops” / filter by price
- Exact product question
- Comparison and table requests
- No matching products
- Policy / unrelated / joke
- Product card link while the assistant stays open (if applicable)

---

## Example references in this repo

- Shop adapter: `features/shop-assistant/`
- Runtime: `features/shop-assistant/server/shop-assistant-runtime.ts`
- Structured request: `features/shop-assistant/model/store-request.ts`
- Schema validation: `features/shop-assistant/schema/store-request-schema.ts`
- Extraction: `features/shop-assistant/server/request-extraction-agent.ts`
- Planner: `features/shop-assistant/server/store-route-planner.ts`
- Routing flow: `features/shop-assistant/docs/agent-routing-flow.md`
