# Shop Assistant Responsibilities

## Owns

- ShopMate assistant runtime injection for `/api/ai-assistant`.
- Electronics-specific query and product classification agents.
- Product, filtering, recommendation, cart, technical-discussion, and not-related agent behavior.
- ShopMate system prompts and product/cart catalog context builders.
- Product/cart data-source contracts for assistant tools and renderer mutation boundaries.
- Current mock/session catalog and cart source implementations.
- Future DB catalog source boundary and structured filter mapping.
- Product search and cart info AI tool factories.
- Product/cart tool renderers, cards, and renderer registry.
- ShopMate search/ranking helpers used by the adapter and current product UI.

## Does Not Own

- Generic assistant request parsing, streaming, persistence orchestration, or runtime contracts.
- Generic message rendering fallback behavior.
- Artifact document rendering and document persistence.
- Storefront product/cart state, which remains in `features/shop`.

## Dependency Direction

- `features/shop-assistant` may import generic contracts and primitives from `features/ai-assistant`.
- `features/shop-assistant` may import product/cart models from `features/shop`.
- `features/ai-assistant` should not import ShopMate agents, tools, product/cart renderers, or product/cart types.
- App integration points can inject `features/shop-assistant` runtime and renderer registry into the assistant core.
