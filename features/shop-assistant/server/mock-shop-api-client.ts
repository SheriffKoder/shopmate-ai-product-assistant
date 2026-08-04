/**
 * @file features/shop-assistant/server/mock-shop-api-client.ts
 * Mock Shop API client.
 *
 * Purpose: Provides a replaceable typed catalog/cart API for the assistant runtime.
 * Used in: The temporary version-2 ShopMate runtime until route-backed APIs are injected.
 */

import type { CartState } from '@/features/cart/model/cart';
import type { Product } from '@/features/catalog/model/product';
import type {
  AddCartItemRequest,
  CatalogSearchRequest,
  ShopApiClient,
  ShopCartDto,
  ShopProductDto,
  UpdateCartItemRequest,
} from '../model/shop-api-client';
import { getInitialProducts } from '@/features/catalog/model/initial-data';

function toProductDto(product: Product): ShopProductDto {
  return { ...product } as ShopProductDto;
}

function toCartDto(cart: CartState): ShopCartDto {
  return { ...cart, items: cart.items.map((item) => ({ ...item })) } as ShopCartDto;
}

/** Creates an in-memory Shop API implementation with no React or database dependency. */
export function createMockShopApiClient(
  initialProducts: Product[] = getInitialProducts(),
  initialCart: CartState = { items: [], totalItems: 0, totalPrice: 0 }
): ShopApiClient {
  const products = [...initialProducts];
  let cart = initialCart;

  return {
    async searchProducts(request: CatalogSearchRequest) {
      const query = request.query.trim().toLowerCase();
      return products
        .filter((product) => {
          const matchesQuery = !query || [product.name, product.category, product.description]
            .join(' ').toLowerCase().includes(query);
          const matchesCategory = !request.category || product.category.toLowerCase() === request.category.toLowerCase();
          const matchesMin = request.minPrice === undefined || product.price >= request.minPrice;
          const matchesMax = request.maxPrice === undefined || product.price <= request.maxPrice;
          return matchesQuery && matchesCategory && matchesMin && matchesMax;
        })
        .slice(0, request.limit ?? 10)
        .map(toProductDto);
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
        ? cart.items.map((item) => item.productId === request.productId ? { ...item, quantity: item.quantity + request.quantity } : item)
        : [...cart.items, { productId: product.id, product, quantity: request.quantity }];
      cart = summarizeCart(items);
      return toCartDto(cart);
    },
    async updateCartItem(request: UpdateCartItemRequest) {
      if (request.quantity <= 0) return this.removeCartItem(request.productId);
      cart = summarizeCart(cart.items.map((item) => item.productId === request.productId ? { ...item, quantity: request.quantity } : item));
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
