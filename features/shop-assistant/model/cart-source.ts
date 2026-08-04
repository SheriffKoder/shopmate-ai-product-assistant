/**
 * @file features/shop-assistant/model/cart-source.ts
 * Cart source contract: describes cart reads and UI mutations for ShopMate assistant tools.
 * Used in: cart info tool and ShopMate tool renderers.
 * Used for: Keeping cart state/action details inside the ShopMate adapter rather than assistant core.
 */

import type { CartItem, CartState } from '@/features/cart/model/cart';

/**
 * Cart read abstraction used by server-side assistant tools.
 */
export interface CartSource {
  /** Read the current cart snapshot. */
  getCart(): Promise<CartState>;
  /** Read one cart item by product id. */
  getItemByProductId(productId: string): Promise<CartItem | null>;
}

/**
 * Adapter-owned UI mutation callbacks for cart renderers.
 */
export interface CartMutationController {
  addItem(product: import('@/features/catalog/model/product').Product, quantity?: number): void | Promise<void>;
  /** Increase a cart item's quantity. */
  increaseQuantity(productId: string): void;
  /** Decrease a cart item's quantity. */
  decreaseQuantity(productId: string): void;
  /** Remove a cart item. */
  removeItem(productId: string): void;
}
