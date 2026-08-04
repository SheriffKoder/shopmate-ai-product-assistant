/**
 * @file features/cart/store/cart-persistence.ts
 * Browser-only cart persistence boundary.
 *
 * Purpose: Owns cart serialization and storage safety without exposing storage details to Zustand.
 */

import type { CartState } from '../model/cart';
import { calculateCart, emptyCart } from '../model/cart-selectors';

const CART_STORAGE_KEY = 'shopmate:cart';

function isCartState(value: unknown): value is CartState {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<CartState>;
  return Array.isArray(candidate.items);
}

export function readPersistedCart(): CartState {
  if (typeof window === 'undefined') return emptyCart;

  try {
    const raw = window.sessionStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return emptyCart;
    const parsed: unknown = JSON.parse(raw);
    return isCartState(parsed) ? calculateCart(parsed.items) : emptyCart;
  } catch {
    return emptyCart;
  }
}

export function writePersistedCart(cart: CartState): void {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Storage failures must not prevent the in-memory cart from working.
  }
}

export function clearPersistedCart(): void {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.removeItem(CART_STORAGE_KEY);
  } catch {
    // Storage failures must not prevent clearing the in-memory cart.
  }
}
