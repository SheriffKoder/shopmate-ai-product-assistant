/**
 * @file features/shop-assistant/server/sources/mock-shop-api-client.ts
 * Mock Shop API client with deterministic unique-value catalog matching.
 * Used in: shop-assistant runtime composition and lookup tests.
 * Used for: In-memory catalog/cart until route-backed APIs are injected.
 *
 * Function Index:
 * createMockShopApiClient: In-memory ShopApiClient. searchProducts uses matchCatalogProducts.
 *
 * Steps:
 * 1. Copy initial catalog/cart into memory.
 * 2. searchProducts delegates filtering to matchCatalogProducts.
 * 3. Cart mutations stay local; schema still does not authorize them.
 */

import type { CartState } from '@/features/cart/model/cart';
import type { Product } from '@/features/catalog/model/product';
import { getInitialProducts } from '@/features/catalog/model/initial-data';
import { matchCatalogProducts } from '../../lib/catalog/match-catalog-products';
import type {
  AddCartItemRequest,
  CatalogSearchRequest,
  ShopApiClient,
  ShopCartDto,
  ShopProductDto,
  UpdateCartItemRequest,
} from '../../model/sources/shop-api-client';

function toProductDto(product: Product): ShopProductDto {
  return { ...product, slug: product.slug ?? product.id } as ShopProductDto;
}

function toCartDto(cart: CartState): ShopCartDto {
  return { ...cart, items: cart.items.map((item) => ({ ...item })) } as ShopCartDto;
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((entry): entry is string => typeof entry === 'string');
}

/** Creates an in-memory Shop API implementation with no React or database dependency. */
export function createMockShopApiClient(
  initialProducts: Product[] = getInitialProducts(),
  initialCart: CartState = { items: [], totalItems: 0, totalPrice: 0 },
): ShopApiClient {
  const products = [...initialProducts];
  let cart = initialCart;

  return {
    async searchProducts(request: CatalogSearchRequest) {
      // 1. Delegate matching to the pure unique-category helper. Do not OR-includes blobs.
      const matched = matchCatalogProducts(products, {
        query: request.query,
        category: request.category,
        minPrice: request.minPrice,
        maxPrice: request.maxPrice,
        color: typeof request.color === 'string' ? request.color : undefined,
        colors: asStringArray(request.colors),
        keywords: asStringArray(request.keywords),
        features: asStringArray(request.features),
        minRating: typeof request.minRating === 'number' ? request.minRating : undefined,
        sortBy: typeof request.sortBy === 'string' ? request.sortBy : undefined,
        limit: request.limit,
      });
      return matched.map(toProductDto);
    },
    async getProduct(productId) {
      const product = products.find((candidate) => candidate.id === productId);
      return product ? toProductDto(product) : null;
    },
    async getCart() {
      return toCartDto(cart);
    },
    async addCartItem(request: AddCartItemRequest) {
      const product = products.find((candidate) => candidate.id === request.productId);
      if (!product || request.quantity <= 0) return toCartDto(cart);
      const existing = cart.items.find((item) => item.productId === request.productId);
      const items = existing
        ? cart.items.map((item) => (
          item.productId === request.productId
            ? { ...item, quantity: item.quantity + request.quantity }
            : item
        ))
        : [...cart.items, { productId: product.id, product, quantity: request.quantity }];
      cart = summarizeCart(items);
      return toCartDto(cart);
    },
    async updateCartItem(request: UpdateCartItemRequest) {
      if (request.quantity <= 0) return this.removeCartItem(request.productId);
      cart = summarizeCart(cart.items.map((item) => (
        item.productId === request.productId ? { ...item, quantity: request.quantity } : item
      )));
      return toCartDto(cart);
    },
    async removeCartItem(productId) {
      cart = summarizeCart(cart.items.filter((item) => item.productId !== productId));
      return toCartDto(cart);
    },
  };
}

function summarizeCart(items: CartState['items']): CartState {
  return {
    items,
    totalItems: items.reduce((total, item) => total + item.quantity, 0),
    totalPrice: items.reduce((total, item) => total + item.product.price * item.quantity, 0),
  };
}
