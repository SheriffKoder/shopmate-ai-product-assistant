/**
 * @file features/shop-assistant/lib/stream/get-product-cards-part.ts
 * Pure parser for persisted data-productCards message parts.
 * Used in: ui/cards/product-cards.tsx and ui/integration/stream-part-registry.tsx.
 * Used for: Remounting catalog cards without a fake productSearch tool call.
 *
 * Function Index:
 * getProductCardsPart: Read header/paragraph/products from a data-productCards part.
 *
 * Steps:
 * 1. Ignore parts that are not data-productCards or have no object payload.
 * 2. Require a products array. Header/paragraph/footer are optional strings.
 */

import type { Product } from '@/features/catalog/model/product';
import type { ProductCardsPart } from '../../transform/catalog/product-cards-part';

/**
 * Read a persistable card payload from a data-productCards part.
 * Returns null when the part is missing or malformed.
 *
 * @example
 * getProductCardsPart({ type: 'data-productCards', data: { header: '## Phones', paragraph: '', products: [] } })
 */
export function getProductCardsPart(part: unknown): ProductCardsPart | null {
  if (!part || typeof part !== 'object') return null;

  const typed = part as { type?: unknown; data?: unknown };
  if (typed.type !== 'data-productCards' || !typed.data || typeof typed.data !== 'object') {
    return null;
  }

  const data = typed.data as {
    header?: unknown;
    paragraph?: unknown;
    products?: unknown;
    footer?: unknown;
  };

  if (!Array.isArray(data.products)) return null;

  return {
    header: typeof data.header === 'string' ? data.header : '',
    paragraph: typeof data.paragraph === 'string' ? data.paragraph : '',
    products: data.products as Product[],
    footer: typeof data.footer === 'string' ? data.footer : undefined,
  };
}
