# Cart Architecture

The cart feature combines pure cart rules, Zustand client state, browser persistence, future API synchronization, and UI consumers.

```mermaid
flowchart TD
    ProductPage[views/products/product-detail-page-content.tsx] --> Hook[features/cart/hooks/use-cart.ts]
    CartPage[views/cart/cart-page-content.tsx] --> Hook
    Header[components/main-header/main-header.tsx] --> Hook
    Assistant[features/shop-assistant/tools/* renderer] --> Command[features/shop-assistant/model/shop-assistant-command-handler.ts]
    Command --> Handler[Shop Assistant command dispatcher]
    Handler --> Hook

    Hook --> Store[features/cart/store/cart-store.ts]

    Store --> Direct[cart-store direct methods]
    Store --> Dispatch[cart-store dispatchCartAction]
    Dispatch --> Reducer[features/cart/store/cart-reducer.ts]
    Direct --> Actions[features/cart/model/cart-actions.ts]
    Reducer --> Actions
    Actions --> Selectors[features/cart/model/cart-selectors.ts]
    Selectors --> NextState[features/cart/model/cart.ts CartState]

    NextState --> Memory[Zustand memory]
    NextState --> Persist[features/cart/store/cart-persistence.ts]
    Persist --> Session[window.sessionStorage]
    NextState --> ApiClient[features/cart/client/cart-api-client.ts]
    ApiClient --> ApiRoute[app/api/shop/cart/route.ts]

    Memory --> Hook
    Hook --> Consumers[Cart UI consumers]
```

## Layer legend

| Layer | Responsibility |
| --- | --- |
| `model/cart.ts` | Cart types and action vocabulary. |
| `model/cart-actions.ts` | Pure operations that calculate the next cart. |
| `model/cart-selectors.ts` | Derived totals and normalized cart calculations. |
| `store/cart-reducer.ts` | Maps generic actions to pure cart operations. |
| `store/cart-store.ts` | Zustand state, optimistic updates, persistence, and API synchronization. |
| `store/cart-persistence.ts` | Safe browser `sessionStorage` access. |
| `client/cart-api-client.ts` | Typed HTTP calls to the cart API. |
| `hooks/use-cart.ts` | Stable React-facing cart facade. |
| `ui/` | Cart dropdown and cart-specific presentation. |

## The pieces

### Cart model

[`model/cart.ts`](./model/cart.ts) defines the shape of a cart item, the complete cart state, and the supported action vocabulary. It contains no React, Zustand, browser APIs, or network calls. This makes it the shared contract for the store, reducer, UI, and assistant adapter.

[`model/cart-actions.ts`](./model/cart-actions.ts) contains pure state transitions. Each function receives the current cart and returns the next cart for one operation such as adding an item or changing quantity. Because these functions are pure, they can be tested independently and reused by both direct store methods and the reducer.

[`model/cart-selectors.ts`](./model/cart-selectors.ts) calculates derived values such as total quantity and subtotal. The cart does not store duplicate totals that could become stale.

### Store and state access

[`store/cart-store.ts`](./store/cart-store.ts) is the Zustand state boundary. It owns the current in-memory cart, exposes named mutations, hydrates persisted state, performs optimistic updates, and coordinates future server synchronization. Components should not call the store's internal `set` function or duplicate its mutation logic.

[`hooks/use-cart.ts`](./hooks/use-cart.ts) is the preferred consumer API. Header, cart page, product page, and other client components use this hook instead of importing Zustand directly. It provides a stable facade and keeps React lifecycle concerns such as hydration out of presentation components.

[`store/cart-reducer.ts`](./store/cart-reducer.ts) is a compatibility dispatch layer for callers that already express changes as `CartAction` values. It is not a second store and does not own state; it delegates to the pure operations in `model/cart-actions.ts`.

### Persistence and server boundary

[`store/cart-persistence.ts`](./store/cart-persistence.ts) contains browser-only `sessionStorage` access. Keeping this separate prevents storage checks and serialization details from leaking into UI code.

[`client/cart-api-client.ts`](./client/cart-api-client.ts) is the typed client boundary for cart HTTP operations. When server synchronization is enabled, the store calls this client rather than constructing requests itself.

[`app/api/shop/cart/route.ts`](../../app/api/shop/cart/route.ts) is the server route adapter. It is the place where authentication, validation, and a future database-backed cart service can be connected. The UI does not depend on the database provider.

### Consumers and assistant integration

[`ui/cart-dropdown.tsx`](./ui/cart-dropdown.tsx) and its colocated UI components render cart controls in the header. They receive cart data and callbacks; they do not own cart state.

[`views/cart/cart-page-content.tsx`](../../views/cart/cart-page-content.tsx) consumes the same hook for the dedicated cart page, so header and page remain synchronized automatically.

[`components/main-header/main-header.tsx`](../../components/main-header/main-header.tsx) adapts the store's cart items into the dropdown's display model.

[`features/shop-assistant/model/shop-assistant-command-handler.ts`](../shop-assistant/model/shop-assistant-command-handler.ts) translates assistant commands into cart operations. This keeps the generic AI assistant unaware of both the cart store and ShopMate's data model.

## Update flow

```text
user interaction
  → useCart mutation
    → calculate next state
      → update Zustand immediately
        → persist locally
        → synchronize with API
```

The assistant follows the same cart path through a typed command handler. It does not import the Zustand store directly.
