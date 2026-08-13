/**
 * @file features/shop-assistant/transform/catalog/product-cards-part.ts
 * Pure persistable product-card payload from lookup rows.
 * Used in: server/render/store-output.ts before streaming data-productCards.
 * Used for: Persisted data-productCards payload that ui/cards remounts in chat.
 *
 * Function Index:
 * buildProductCardsPart: Header + products payload for the persisted stream part.
 *
 * Steps:
 * 1. Use the render title as the markdown header.
 * 2. Attach the lookup rows unchanged.
 */

import type { Product } from '@/features/catalog/model/product';

/** Persistable product-card payload. Chat remounts from data-productCards. */
export interface ProductCardsPart {
  header: string;
  paragraph: string;
  products: Product[];
  footer?: string;
}

/**
 * Build the persisted card payload from real lookup rows.
 *
 * @example
 * buildProductCardsPart([{ name: 'iPhone 15 Pro Max', ... }], 'ShopMate smartphones')
 */
export function buildProductCardsPart(products: Product[], title?: string): ProductCardsPart {
  const header = title || 'ShopMate products';

  return {
    header: `## ${header}`,
    paragraph: products.length === 1
      ? 'Here is the matching product from the store.'
      : `Here are ${products.length} matching products from the store.`,
    products,
    footer: 'Ask if you want a comparison, a table, or help choosing one.',
  };
}
