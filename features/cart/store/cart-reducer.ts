/** Pure reducer adapter for cart transitions. */

import type { CartAction, CartState } from '../model/cart';
import { addItem, decreaseQuantity, increaseQuantity, removeItem, updateQuantity } from '../model/cart-actions';
import { calculateCart } from '../model/cart-selectors';

export function reduceCart(current: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_CART': return calculateCart(action.payload.items);
    case 'ADD_TO_CART': return addItem(current, action.payload);
    case 'REMOVE_FROM_CART': return removeItem(current, action.payload);
    case 'INCREASE_QUANTITY': return increaseQuantity(current, action.payload);
    case 'DECREASE_QUANTITY': return decreaseQuantity(current, action.payload);
    case 'UPDATE_QUANTITY': return updateQuantity(current, action.payload.productId, action.payload.quantity);
    case 'CLEAR_CART': return { items: [], totalItems: 0, totalPrice: 0 };
  }
}
