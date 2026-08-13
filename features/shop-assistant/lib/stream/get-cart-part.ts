/**
 * @file features/shop-assistant/lib/stream/get-cart-part.ts
 * Pure parser for persisted data-cart message parts.
 * Used in: ui/cart/cart-panel.tsx and ui/integration/stream-part-registry.tsx.
 * Used for: Remounting cart UI without a fake cartInfo tool call.
 *
 * Function Index:
 * getCartPart: Read header/paragraph/items from a data-cart part.
 *
 * Steps:
 * 1. Ignore parts that are not data-cart or have no object payload.
 * 2. Require an items array. Totals default to 0 when missing.
 */

import type { CartItem } from '@/features/cart/model/cart';
import type { CartRenderPayload } from '../../server/render/cart';

/**
 * Read a persistable cart payload from a data-cart part.
 * Returns null when the part is missing or malformed.
 *
 * @example
 * getCartPart({ type: 'data-cart', data: { header: 'Your Shopping Cart', paragraph: 'Your cart is empty.', items: [], totalItems: 0, totalPrice: 0 } })
 */
export function getCartPart(part: unknown): CartRenderPayload | null {
  if (!part || typeof part !== 'object') return null;

  const typed = part as { type?: unknown; data?: unknown };
  if (typed.type !== 'data-cart' || !typed.data || typeof typed.data !== 'object') {
    return null;
  }

  const data = typed.data as {
    header?: unknown;
    paragraph?: unknown;
    items?: unknown;
    totalItems?: unknown;
    totalPrice?: unknown;
    footer?: unknown;
  };

  if (!Array.isArray(data.items)) return null;

  return {
    header: typeof data.header === 'string' ? data.header : 'Your Shopping Cart',
    paragraph: typeof data.paragraph === 'string' ? data.paragraph : '',
    items: data.items as CartItem[],
    totalItems: typeof data.totalItems === 'number' ? data.totalItems : 0,
    totalPrice: typeof data.totalPrice === 'number' ? data.totalPrice : 0,
    footer: typeof data.footer === 'string' ? data.footer : undefined,
  };
}
