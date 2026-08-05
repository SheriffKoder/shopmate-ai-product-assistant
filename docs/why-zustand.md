# Why Zustand for Cart State

The cart is client interaction state: users add items, change quantities, remove items, and expect the header, cart page, and assistant integration to react immediately. It is not product/catalog ownership and it is not a reducer-driven API.

## Why Zustand

- A small store can be consumed by any client component without a provider wrapping every page.
- Selectors let each component subscribe only to the cart slice it needs.
- Actions live beside the state they mutate, making the update flow easy to discover.
- The store can later synchronize with `/api/cart` without changing cart consumers.
- The assistant can receive an explicit cart command controller instead of importing the cart store directly.
- It removes the old `ShopProvider` coupling from the application shell.

## Boundary

```text
catalog API/server data → product entities

cart UI / assistant commands → Zustand cart store
                                  ↓
                           future API sync
```

Zustand is not the source of truth for catalog data and should not become a general application event bus. Keep product fetching and server persistence in their own API/client layers.

## Current locations

For the complete wiring diagram and file-by-file explanation, see [Cart Architecture](../features/cart/architecture.md).

- `features/cart/store/cart-store.ts`: state, selectors, and cart mutations.
- `features/cart/hooks/use-cart.ts`: the stable consumer-facing hook.
- `features/cart/model/`: cart and mutation contracts.
- `features/cart/ui/`: cart dropdown and cart-specific presentation.
- `features/shop-assistant/model/shop-assistant-command-handler.ts`: translates assistant commands into cart mutations.

## Future synchronization

When server persistence is introduced, keep the store responsive and reconcile it through a dedicated client/service. Do not place database calls inside presentational components. The sync layer should define loading, optimistic update, rollback, and conflict behavior explicitly.
