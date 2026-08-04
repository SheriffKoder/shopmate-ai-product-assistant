/**
 * @file features/cart/client/cart-api-client.ts
 * Typed client for the Shop cart API.
 */

import type { CartState } from '../model/cart';

const CART_API_ENDPOINT = '/api/shop/cart';

export class CartApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'CartApiError';
  }
}

async function parseCartResponse(response: Response): Promise<CartState> {
  const payload = await response.json().catch(() => null) as { cart?: CartState; error?: string } | CartState | null;

  if (!response.ok) {
    const message = payload && 'error' in payload && payload.error ? payload.error : 'Cart request failed';
    throw new CartApiError(message, response.status);
  }

  if (payload && 'cart' in payload && payload.cart) return payload.cart;
  if (payload && 'items' in payload) return payload;
  throw new CartApiError('Cart response was invalid', response.status);
}

export async function getCart(): Promise<CartState> {
  return parseCartResponse(await fetch(CART_API_ENDPOINT));
}

export async function replaceCart(cart: CartState): Promise<CartState> {
  return parseCartResponse(await fetch(CART_API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cart),
  }));
}

export async function updateCart(updates: Partial<CartState>): Promise<CartState> {
  return parseCartResponse(await fetch(CART_API_ENDPOINT, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  }));
}

export async function clearRemoteCart(): Promise<CartState> {
  return parseCartResponse(await fetch(CART_API_ENDPOINT, { method: 'DELETE' }));
}
