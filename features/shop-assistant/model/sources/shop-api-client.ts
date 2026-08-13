/**
 * @file features/shop-assistant/model/sources/shop-api-client.ts
 * Shop API client contracts.
 * Used in: mock Shop API, catalog/cart source adapters, and later command handlers.
 * Used for: Mock responses now; server filtering or database implementations later.
 *
 * Function Index:
 * ShopProductDto / ShopCartDto: JSON-safe API payloads.
 * CatalogSearchRequest: Lookup request passed to searchProducts.
 * ShopApiClient: Typed catalog + cart boundary.
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

/** Typed Shop API boundary consumed by Shop Assistant. */
export interface ShopApiClient {
  searchProducts(request: CatalogSearchRequest): Promise<ShopProductDto[]>;
  getProduct(productId: string): Promise<ShopProductDto | null>;
  getCart(): Promise<ShopCartDto>;
  addCartItem(request: AddCartItemRequest): Promise<ShopCartDto>;
  updateCartItem(request: UpdateCartItemRequest): Promise<ShopCartDto>;
  removeCartItem(productId: string): Promise<ShopCartDto>;
}
