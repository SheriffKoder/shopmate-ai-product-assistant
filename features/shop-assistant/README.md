# Shop Assistant

Live ShopMate adapter for the reusable AI assistant. One schema LLM labels the request; deterministic lookup, render, stream-part UI, and an optional speaker do the rest.

Injected by [`app/api/ai-assistant/route.ts`](../../app/api/ai-assistant/route.ts) and [`components/layout-wrapper.tsx`](../../components/layout-wrapper.tsx). The previous multi-agent adapter is archived at [`features/shop-assistant-v1`](../shop-assistant-v1/).

## Why this folder exists

v1 grew a classifier, an extractor, a planner, a router, and several specialist agents that mostly copy each other. Catalog answers still drifted because lookup used blob substring matching and AI tools searched again after lookup.

This adapter is the same store behavior with a smaller system:

1. One schema LLM labels the request.
2. A deterministic planner picks lookup / view / cart / refuse.
3. Lookup owns unique catalog values and returns rows.
4. Server render functions stream cards, sheets, documents, cart UI, or conversation Find chips.
5. An optional speaker writes short prose with no tools.

## Docs

| Doc | What it covers |
|---|---|
| [`docs/architecture.md`](./docs/architecture.md) | What the system is, why it replaced v1, expected replies |
| [`docs/conversation.md`](./docs/conversation.md) | Rec / compare Find chips from schema `metadata` |
| [`docs/tools.md`](./docs/tools.md) | Tool vs component vs server function — when to build which |
| [`docs/stream-parts.md`](./docs/stream-parts.md) | What a stream part is, and how chat remounts `data-*` UI |
| [`docs/responsibilities.md`](./docs/responsibilities.md) | Owns / does not own / dependency direction |

## Key files

| File | Role |
|---|---|
| [`server/shop-assistant-runtime.ts`](./server/shop-assistant-runtime.ts) | Schema → plan → lookup → render → speaker |
| [`server/request-agent.ts`](./server/request-agent.ts) | One schema LLM (`generateObject`) |
| [`model/assistant-request.ts`](./model/assistant-request.ts) | `action` + filters + `view` + `metadata` |
| [`schema/assistant-request-schema.ts`](./schema/assistant-request-schema.ts) | Zod validate + defaults |
| [`model/execution-plan.ts`](./model/execution-plan.ts) | `planFromSchema` |
| [`lib/catalog/match-catalog-products.ts`](./lib/catalog/match-catalog-products.ts) | Deterministic catalog match |
| [`server/render/store-output.ts`](./server/render/store-output.ts) | Cards, sheet, document from rows |
| [`server/render/cart.ts`](./server/render/cart.ts) | Cart UI from `CartSource` |
| [`server/render/ui-metadata.ts`](./server/render/ui-metadata.ts) | Persist Find chips |
| [`server/speaker.ts`](./server/speaker.ts) | Optional prose, no tools |
| [`ui/integration/stream-part-registry.tsx`](./ui/integration/stream-part-registry.tsx) | Remount cards / cart / Find chips |
| [`ui/metadata/buttons.tsx`](./ui/metadata/buttons.tsx) | Find + `items.map` |

## Folder shape

Layer folders, then subfolders by concern. No `agents/` and no `tools/`.

`tools/` is not a project-structure layer. v1 used it for AI SDK wrappers (`dynamicTool`). v2 splits that work:

| v1 `tools/` | v2 |
|---|---|
| `product-search-tool.ts` / `cart-info-tool.ts` | `server/render/store-output.ts`, `server/render/cart.ts` |
| `product-card.tsx` / `cart-item-card.tsx` | `ui/cards/`, `ui/cart/` |
| tool renderer registry | `ui/integration/stream-part-registry.tsx` |

If we ever need a real model-callable tool, add it then — not by default. See [`docs/tools.md`](./docs/tools.md).

```text
features/shop-assistant/
├── README.md
├── docs/
├── model/              types + planFromSchema
│   └── sources/        catalog / cart / shop API contracts
├── schema/             one Zod schema for the LLM
├── lib/
│   ├── catalog/        match, browse-all, runtime lookup helpers
│   └── stream/         parse persisted data-productCards / data-cart / data-uiMetadata
├── transform/
│   └── catalog/        Product[] → CSV / markdown / card payload
├── server/
│   ├── sources/        mock Shop API + CatalogSource / CartSource adapters
│   └── render/         cards, sheet, document, cart, refuse, policy, ui-metadata
├── ui/
│   ├── integration/    mount + stream hydration
│   ├── cards/
│   ├── cart/
│   └── metadata/       schema metadata UI (Find buttons)
└── config/             suggestion chips
```

## Dependency rules

- This feature may import contracts from `features/ai-assistant`.
- `features/ai-assistant` must not import this feature.
- App routes inject the runtime; they do not own ShopMate branching.
- Catalog/cart data stays in `features/catalog` and `features/cart`.
