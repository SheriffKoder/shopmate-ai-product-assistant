/**
 * @file features/shop-assistant/lib/catalog/build-catalog-facts.ts
 * Pure store-context lines for the answer speaker.
 * Used in: shop-assistant-runtime.ts when render is answer.
 * Used for: Feeding product features/prices to the speaker without streaming cards.
 *
 * Function Index:
 * buildCatalogFacts: Product rows → short factual lines the speaker may cite.
 *
 * Steps:
 * 1. Cap at a few rows so the prompt stays small.
 * 2. Include name, price, rating, features, and short description only.
 */

import type { Product } from '@/features/catalog/model/product';

/** Max products to cite in an answer turn. */
const MAX_ANSWER_FACTS = 3;

/**
 * Build factual STORE CONTEXT lines from lookup rows.
 *
 * @example
 * buildCatalogFacts([{ name: 'iPhone 15 Pro Max', price: 1199, rating: 4.7, features: ['A17 Pro'], shortDescription: '…' }])
 * // ['iPhone 15 Pro Max | $1199 | rating 4.7 | features: A17 Pro | …']
 */
export function buildCatalogFacts(products: Product[]): string[] {
  // 1. Cap rows so the speaker prompt does not grow with browse-sized lookups.
  return products.slice(0, MAX_ANSWER_FACTS).map((product) => {
    // 2. Only cite fields that exist on the catalog row. No invented copy.
    const features = product.features.length > 0
      ? product.features.join('; ')
      : 'none listed';
    return [
      product.name,
      `$${product.price}`,
      `rating ${product.rating}`,
      `features: ${features}`,
      product.shortDescription,
    ].join(' | ');
  });
}
