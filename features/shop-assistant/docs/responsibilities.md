# Shop Assistant responsibilities

Map of folders and files: what each owns, and where it is used.

## Main gate

After the HTTP request, the reusable core hands off to this feature:

```text
app/api/ai-assistant/route.ts
  → features/ai-assistant/server/handle-assistant-request.ts
  → features/shop-assistant/server/shop-assistant-runtime.ts   ← ShopMate business entry
```

[`server/shop-assistant-runtime.ts`](../server/shop-assistant-runtime.ts) is the **main gate** for shop logic. Everything below either feeds it (label, plan, lookup) or is called from it (render, speaker), or mounts UI from what it streams (integration + stream parts).

Pipeline inside the gate:

```text
ALWAYS  label → plan → sources → resolveRuntimeLookup
WHEN    searchProducts (if shouldLookup)
ALWAYS  renderExecution (branches on plan.render)
WHEN    createSpeakerStream (if speaker is reply|confirm)
ELSE    deterministic reply text
```

Client mount (separate from the API gate): [`components/layout-wrapper.tsx`](../../../components/layout-wrapper.tsx) → [`ui/integration/`](../ui/integration/).

---

## Owns / does not own

**Owns:** schema labeling, planning, catalog/cart lookup adapters, server render + Find chips, optional speaker, product/cart/metadata UI, stream-part hydration, suggestion chips.

**Does not own:** generic SSE / persistence / runtime contracts (`features/ai-assistant`); artifact storage / panel; storefront catalog/cart state (`features/catalog`, `features/cart`, `entities/*`).

**Dependency direction:**

```text
app/api + layout
  → shop-assistant (runtime + ui)
    → ai-assistant contracts + artifact helpers
    → catalog / cart models
```

`features/ai-assistant` must not import this feature. Routes inject composition only.

---

## Folder map

### `server/` — runtime orchestration + I/O

| File | Role | Used by / used for |
|---|---|---|
| [`shop-assistant-runtime.ts`](../server/shop-assistant-runtime.ts) | Main gate: schema → plan → lookup → render → speaker | Injected by [`app/api/ai-assistant/route.ts`](../../../app/api/ai-assistant/route.ts) |
| [`request-agent.ts`](../server/request-agent.ts) | One schema LLM (`generateObject`) → `AssistantRequest` | Runtime step 1 (every turn) |
| [`speaker.ts`](../server/speaker.ts) | Optional prose `streamText`, no tools | Runtime step 5 when `speaker` is `reply` \| `confirm` |

#### `server/sources/`

| File | Role | Used by / used for |
|---|---|---|
| [`mock-shop-api-client.ts`](../server/sources/mock-shop-api-client.ts) | In-memory Shop API; search uses `matchCatalogProducts` | Runtime every turn (until real API) |
| [`shop-api-sources.ts`](../server/sources/shop-api-sources.ts) | Adapters → `CatalogSource` / `CartSource` | Runtime lookup + cart render |

#### `server/render/`

| File | Role | Used by / used for |
|---|---|---|
| [`store-output.ts`](../server/render/store-output.ts) | Stream cards / sheet / document from `Product[]` | Runtime when `plan.render` is `cards` \| `sheet` \| catalog `document` |
| [`cart.ts`](../server/render/cart.ts) | Stream cart UI from `CartSource` | Runtime when `plan.render === 'cart'` |
| [`ui-metadata.ts`](../server/render/ui-metadata.ts) | Persist Find chips (`data-uiMetadata`) | Runtime conversation / answer paths |
| [`reply.ts`](../server/render/reply.ts) | Refuse / policy / empty messages + text fallback stream | Runtime when speaker skips or fails |

---

### `model/` — types + pure plan

| File | Role | Used by / used for |
|---|---|---|
| [`assistant-request.ts`](../model/assistant-request.ts) | `AssistantRequest`, views, metadata types | Schema, labeler, runtime, lookup |
| [`execution-plan.ts`](../model/execution-plan.ts) | `planFromSchema` → lookup / render / speaker | Runtime step 2 (every turn) |

#### `model/sources/`

| File | Role | Used by / used for |
|---|---|---|
| [`catalog-source.ts`](../model/sources/catalog-source.ts) | Catalog read contract | Implemented by `server/sources/shop-api-sources.ts` |
| [`cart-source.ts`](../model/sources/cart-source.ts) | Cart read contract | Same |
| [`shop-api-client.ts`](../model/sources/shop-api-client.ts) | Typed Shop API shape | Mock client + adapters |
| [`shop-assistant-command-handler.ts`](../model/sources/shop-assistant-command-handler.ts) | Client command wiring for the assistant shell | UI integration |

---

### `schema/` — LLM validation

| File | Role | Used by / used for |
|---|---|---|
| [`assistant-request-schema.ts`](../schema/assistant-request-schema.ts) | Zod schema + `validateAssistantRequest` + defaults | `request-agent.ts` after `generateObject` |

---

### `lib/` — pure helpers (no I/O)

#### `lib/catalog/`

| File | Role | Used by / used for |
|---|---|---|
| [`runtime-lookup.ts`](../lib/catalog/runtime-lookup.ts) | Decide `shouldLookup` / query / limit / titles | Runtime step 3a (every turn) |
| [`match-catalog-products.ts`](../lib/catalog/match-catalog-products.ts) | Unique-category + word-boundary match | `mock-shop-api-client` search |
| [`is-browse-all-catalog-request.ts`](../lib/catalog/is-browse-all-catalog-request.ts) | Detect “all products” wording | `runtime-lookup.ts` |
| [`build-catalog-facts.ts`](../lib/catalog/build-catalog-facts.ts) | Product rows → speaker fact lines | Runtime answer / conversation render |
| [`find-chips-from-products.ts`](../lib/catalog/find-chips-from-products.ts) | Product names → Find chip items | Runtime answer / conversation when rows exist |

#### `lib/stream/`

| File | Role | Used by / used for |
|---|---|---|
| [`get-product-cards-part.ts`](../lib/stream/get-product-cards-part.ts) | Parse persisted `data-productCards` | Stream-part registry / chat remount |
| [`get-cart-part.ts`](../lib/stream/get-cart-part.ts) | Parse persisted `data-cart` | Same |
| [`get-ui-metadata-part.ts`](../lib/stream/get-ui-metadata-part.ts) | Parse `data-uiMetadata` + build chip submit prompt | Registry + Find buttons |

---

### `transform/catalog/` — reshape rows for artifacts / cards

| File | Role | Used by / used for |
|---|---|---|
| [`product-cards-part.ts`](../transform/catalog/product-cards-part.ts) | `Product[]` → cards stream payload | `server/render/store-output.ts` |
| [`product-catalog-csv.ts`](../transform/catalog/product-catalog-csv.ts) | `Product[]` → sheet CSV | Same (sheet path) |
| [`product-catalog-document.ts`](../transform/catalog/product-catalog-document.ts) | `Product[]` → document markdown | Same (document path) |

---

### `ui/` — client mounts

#### `ui/integration/`

| File | Role | Used by / used for |
|---|---|---|
| [`shop-assistant-integration.tsx`](../ui/integration/shop-assistant-integration.tsx) | Mount assistant shell for ShopMate | `components/layout-wrapper.tsx` |
| [`shop-assistant-config.tsx`](../ui/integration/shop-assistant-config.tsx) | Wire suggestions, stream-part registry, commands | Integration |
| [`stream-part-registry.tsx`](../ui/integration/stream-part-registry.tsx) | Remount cards / cart / Find chips from `data-*` | Config → `features/ai-assistant` message renderer |

#### `ui/cards/`, `ui/cart/`, `ui/metadata/`

| Folder / file | Role | Used by / used for |
|---|---|---|
| [`ui/cards/product-cards.tsx`](../ui/cards/product-cards.tsx) + [`product-card.tsx`](../ui/cards/product-card.tsx) | Product list UI | Stream-part registry for `data-productCards` |
| [`ui/cart/cart-panel.tsx`](../ui/cart/cart-panel.tsx) + [`cart-item-card.tsx`](../ui/cart/cart-item-card.tsx) | Cart UI | Stream-part registry for `data-cart` |
| [`ui/metadata/buttons.tsx`](../ui/metadata/buttons.tsx) | Find chips; click → new user turn | Stream-part registry for `data-uiMetadata` |

---

### `config/`

| File | Role | Used by / used for |
|---|---|---|
| [`shop-assistant-suggestions.ts`](../config/shop-assistant-suggestions.ts) | Empty-state suggestion chips | `ui/integration/shop-assistant-config.tsx` |

---

### `docs/`

| File | Role |
|---|---|
| [`architecture.md`](./architecture.md) | System design, flow, expected replies |
| [`conversation.md`](./conversation.md) | Conversation / answer Find chips behavior |
| [`tools.md`](./tools.md) | Tool vs component vs server function |
| [`stream-parts.md`](./stream-parts.md) | What `data-*` parts are and how chat remounts them |
| [`responsibilities.md`](./responsibilities.md) | This file — folder/file usage map |

---

## Quick “who calls whom”

```text
API route
  └─ shop-assistant-runtime
       ├─ request-agent          → schema + model/assistant-request
       ├─ planFromSchema         → model/execution-plan
       ├─ sources                → model/sources contracts + lib/catalog/match
       ├─ resolveRuntimeLookup   → lib/catalog/runtime-lookup
       ├─ searchProducts         → WHEN shouldLookup
       ├─ renderExecution
       │    ├─ render/cart | store-output | ui-metadata | reply
       │    ├─ lib/catalog/build-catalog-facts
       │    └─ lib/catalog/find-chips-from-products
       └─ speaker                → WHEN reply|confirm

layout
  └─ ui/integration
       └─ stream-part-registry → ui/cards | ui/cart | ui/metadata
            └─ lib/stream parsers
```
