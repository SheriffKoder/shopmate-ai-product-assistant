/** Pure cart calculations and selectors. */

import type { CartItem, CartState } from './cart';

export const emptyCart: CartState = { items: [], totalItems: 0, totalPrice: 0 };

export function calculateCart(items: CartItem[]): CartState {
  return {
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  };
}
