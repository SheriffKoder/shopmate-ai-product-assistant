/** Pure cart intent operations without Zustand, browser, or network dependencies. */

import type { Product } from '@/features/catalog/model/product';
import type { CartState } from './cart';
import { calculateCart, emptyCart } from './cart-selectors';

function normalizeQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 0;
  return Math.max(0, Math.floor(quantity));
}

export function addItem(cart: CartState, product: Product, quantity = 1): CartState {
  const amount = normalizeQuantity(quantity);
  if (amount === 0) return cart;
  const existing = cart.items.find((item) => item.productId === product.id);
  const items = existing
    ? cart.items.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + amount } : item)
    : [...cart.items, { productId: product.id, product, quantity: amount }];
  return calculateCart(items);
}

export function removeItem(cart: CartState, productId: string): CartState {
  return calculateCart(cart.items.filter((item) => item.productId !== productId));
}

export function updateQuantity(cart: CartState, productId: string, quantity: number): CartState {
  const amount = normalizeQuantity(quantity);
  if (amount === 0) return removeItem(cart, productId);
  return calculateCart(cart.items.map((item) => item.productId === productId ? { ...item, quantity: amount } : item));
}

export function increaseQuantity(cart: CartState, productId: string): CartState {
  const item = cart.items.find((entry) => entry.productId === productId);
  return item ? updateQuantity(cart, productId, item.quantity + 1) : cart;
}

export function decreaseQuantity(cart: CartState, productId: string): CartState {
  const item = cart.items.find((entry) => entry.productId === productId);
  return item ? updateQuantity(cart, productId, item.quantity - 1) : cart;
}

export function clearCart(): CartState {
  return emptyCart;
}
