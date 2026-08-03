/**
 * @file features/shop-assistant/server/mock-cart-source.ts
 * Mock cart source: adapts the current cart snapshot to the assistant cart contract.
 * Used in: ShopMate runtime and cart info tool.
 * Used for: Keeping server cart tools independent from the raw request body shape.
 */

import type { CartState } from '@/features/shop/model/cart';
import type { CartSource } from '@/features/shop-assistant/model/cart-source';

/**
 * Creates a cart source backed by the current request cart snapshot.
 */
export function createMockCartSource(cart: CartState): CartSource {
  return {
    async getCart() {
      return cart;
    },
    async getItemByProductId(productId) {
      return cart.items.find((item) => item.productId === productId) ?? null;
    },
  };
}
