/**
 * @file features/shop-assistant/model/shop-api-client.ts
 * Shop API Client Contracts
 *
 * Purpose: Defines the API boundary used by ShopMate agents and command handlers.
 * Used in: ShopMate server agents, tools, and integration command bridges.
 * Used for: Allowing mock responses now and server filtering, backend, or database implementations later.
 */

/** JSON-safe product representation returned by the Shop API. */
export interface ShopProductDto {
  id: string;
  name: string;
  price: number;
  [key: string]: unknown;
}

/** JSON-safe cart representation returned by the Shop API. */
export interface ShopCartDto {
  items: Array<{
    productId: string;
    quantity: number;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export interface CatalogSearchRequest {
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  sortBy?: string;
  [key: string]: unknown;
}

export interface AddCartItemRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  productId: string;
  quantity: number;
}

/** Typed Shop API boundary consumed by ShopMate behavior. */
export interface ShopApiClient {
  searchProducts(request: CatalogSearchRequest): Promise<ShopProductDto[]>;
  getProduct(productId: string): Promise<ShopProductDto | null>;
  getCart(): Promise<ShopCartDto>;
  addCartItem(request: AddCartItemRequest): Promise<ShopCartDto>;
  updateCartItem(request: UpdateCartItemRequest): Promise<ShopCartDto>;
  removeCartItem(productId: string): Promise<ShopCartDto>;
}
