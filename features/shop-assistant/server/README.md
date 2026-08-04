# Shop Assistant Server

## Purpose

This folder contains server-side ShopMate behavior and the adapters connecting agents to product/cart data. It does not own database initialization; providers are selected by application composition.

## Files

- `shop-assistant-runtime.ts`: Implements the generic assistant runtime for ShopMate and connects classification, sources, routing, and models.
- `router.ts`: Selects the appropriate ShopMate agent.
- `system-prompt.ts`: Builds ShopMate prompts and catalog/cart context.
- `shop-api-sources.ts`: Converts the broad `ShopApiClient` into focused `CatalogSource` and `CartSource` contracts.
- `mock-shop-api-client.ts`: Temporary in-memory Shop API implementation for development.
- `agents/`: Query classification, product classification, search, recommendations, filtering, cart handling, technical discussion, and unrelated-query behavior.

## Data flow

```text
app/api/ai-assistant/route.ts
  → shopAssistantRuntime
    → ShopApiClient
      → CatalogSource / CartSource
        → agents and tools
```

## Adding a real database provider

1. Implement the provider in `app/infrastructure/shop/`.
2. Make it satisfy `features/shop-assistant/model/shop-api-client.ts`, or create focused source adapters.
3. Inject it from `app/api/ai-assistant/route.ts` or an application composition module.
4. Keep agents dependent only on `CatalogSource` and `CartSource`.

The obsolete mock source files were removed because `mock-shop-api-client.ts` now owns development data access. Future database work should be a real infrastructure adapter, not a throwing placeholder in this folder.
