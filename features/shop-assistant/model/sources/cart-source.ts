/**
 * @file features/shop-assistant/model/sources/cart-source.ts
 * Cart source contract: cart reads and UI mutations for Shop Assistant.
 * Used in: server/render/cart and ShopMate cart UI.
 * Used for: Keeping cart state inside this adapter rather than assistant core.
 *
 * Function Index:
 * CartSource: Server-side cart snapshot reads.
 * CartMutationController: Adapter-owned UI mutation callbacks.
 */

import type { CartItem, CartState } from '@/features/cart/model/cart';

/** Cart read abstraction used by server-side render functions. */
export interface CartSource {
  /** Read the current cart snapshot. */
  getCart(): Promise<CartState>;
  /** Read one cart item by product id. */
  getItemByProductId(productId: string): Promise<CartItem | null>;
}

/** Adapter-owned UI mutation callbacks for cart renderers. */
export interface CartMutationController {
  addItem(product: import('@/features/catalog/model/product').Product, quantity?: number): void | Promise<void>;
  /** Increase a cart item's quantity. */
  increaseQuantity(productId: string): void;
  /** Decrease a cart item's quantity. */
  decreaseQuantity(productId: string): void;
  /** Remove a cart item. */
  removeItem(productId: string): void;
}
