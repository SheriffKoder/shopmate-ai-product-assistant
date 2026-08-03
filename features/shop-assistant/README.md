# Shop Assistant

ShopMate-specific adapter for the reusable AI assistant feature.

This package owns the electronics catalog prompts, product/cart data sources, product/cart tools, ShopMate agent routing, and product/cart tool renderers. The reusable assistant core imports only generic contracts from `features/ai-assistant`; app entry points inject this adapter where ShopMate behavior is needed.

## Owns

- ShopMate `AssistantRuntime` implementation for `/api/ai-assistant`.
- Electronics-specific query classification, product classification, agent prompts, and routing.
- Catalog and cart source contracts used by ShopMate tools.
- Current mock/session catalog and cart source implementations.
- Future DB catalog source boundary for Supabase/Postgres filters.
- Product/cart tool factories and UI renderer registry.
- App-level assistant integration component that injects ShopMate renderers and stream handling.

## Dependency Rules

- This adapter may import contracts and generic UI/server helpers from `features/ai-assistant`.
- `features/ai-assistant` must not import this adapter.
- Routes may import this adapter only to inject runtime composition.
- Product/cart state remains in `features/shop`; this adapter reads it through explicit source/controller contracts.
