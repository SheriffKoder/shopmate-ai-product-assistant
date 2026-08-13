/**
 * @file features/shop-assistant/server/render/cart.ts
 * Deterministic cart renderer from CartSource (not an AI tool).
 * Used in: shop-assistant-runtime.ts when plan.render is cart.
 * Used for: Streaming cart UI data. Schema does not authorize mutations.
 *
 * Function Index:
 * buildCartRenderPayload: Persistable cart payload from a snapshot.
 * renderCart: Read CartSource and stream data-cart / data-cartUpdate.
 *
 * Steps:
 * 1. Read the cart snapshot.
 * 2. Build header / paragraph / items without AI ranking.
 * 3. Stream a live update and a persisted data-cart part.
 */

import type { UIMessageStreamWriter } from 'ai';
import type { CartItem, CartState } from '@/features/cart/model/cart';
import { logger } from '@/features/ai-assistant/lib/logger';
import type { CartSource } from '../../model/sources/cart-source';

/** Persistable cart payload. Chat remounts from data-cart. */
export interface CartRenderPayload {
  header: string;
  paragraph: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  footer?: string;
}

/**
 * Build the persisted cart payload from a snapshot.
 *
 * @example
 * buildCartRenderPayload({ items: [], totalItems: 0, totalPrice: 0 })
 * // { header: 'Your Shopping Cart', paragraph: 'Your cart is empty.', ... }
 */
export function buildCartRenderPayload(cart: CartState): CartRenderPayload {
  const empty = cart.items.length === 0;

  return {
    header: 'Your Shopping Cart',
    paragraph: empty
      ? 'Your cart is empty.'
      : `Here's what's in your cart (${cart.totalItems} item${cart.totalItems === 1 ? '' : 's'}, $${cart.totalPrice.toFixed(2)}).`,
    items: cart.items,
    totalItems: cart.totalItems,
    totalPrice: cart.totalPrice,
    footer: empty
      ? undefined
      : 'You can adjust quantities or remove items using the controls below each item.',
  };
}

/**
 * Read CartSource and stream cart UI data. Does not mutate the cart.
 *
 * @example
 * await renderCart({ cartSource, dataStream })
 */
export async function renderCart(input: {
  cartSource: CartSource;
  dataStream?: UIMessageStreamWriter<any>;
}): Promise<CartRenderPayload> {
  // 1. Snapshot only. Schema action: cart never authorizes add/remove.
  const cart = await input.cartSource.getCart();
  const payload = buildCartRenderPayload(cart);

  if (!input.dataStream) {
    logger.node({
      name: 'RENDER',
      input: { render: 'cart', totalItems: payload.totalItems },
      details: 'No dataStream. Cart payload built but not streamed.',
      result: payload,
      status: 'skipped',
    });
    return payload;
  }

  try {
    // 2. Live sync for the current client + persisted part for remount.
    input.dataStream.write({
      type: 'data-cartUpdate',
      data: cart,
      transient: true,
    });
    input.dataStream.write({
      type: 'data-cart',
      data: payload,
    });
    logger.node({
      name: 'RENDER',
      input: { render: 'cart', totalItems: payload.totalItems, totalPrice: payload.totalPrice },
      details: 'Streamed cart UI from CartSource. No AI ranking. No mutation.',
      result: {
        itemCount: payload.items.length,
        names: payload.items.map((item) => item.product.name),
      },
      status: 'success',
    });
    return payload;
  } catch (error) {
    logger.node({
      name: 'RENDER',
      input: { render: 'cart', totalItems: payload.totalItems },
      details: 'Cart render failed.',
      status: 'error',
      error,
    });
    throw error;
  }
}
