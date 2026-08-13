/**
 * @file features/shop-assistant/lib/catalog/find-chips-from-products.ts
 * Pure Find-chip builder from lookup product names.
 * Used in: shop-assistant-runtime.ts answer path after catalog lookup.
 * Used for: Real store SKUs as Find chips. Not LLM-invented names.
 *
 * Function Index:
 * buildFindChipsFromProducts: Product names → metadata.buttons (max 3).
 *
 * Steps:
 * 1. Take unique product names from lookup rows.
 * 2. label = display name, value = search fragment for "Provide X from the catalog".
 */

import {
  DEFAULT_ASSISTANT_METADATA,
  type AssistantMetadata,
} from '../../model/assistant-request';

/** Max Find chips on an answer turn. */
const MAX_PRODUCT_CHIPS = 3;

/**
 * Build Find chips from matched catalog products.
 *
 * @example
 * buildFindChipsFromProducts([{ name: 'iPhone 15 Pro Max' }])
 * // { type: 'buttons', items: [{ label: 'iPhone 15 Pro Max', value: 'iphone 15 pro max' }] }
 */
export function buildFindChipsFromProducts(
  products: Array<{ name: string }>,
): AssistantMetadata {
  const seen = new Set<string>();
  const items: AssistantMetadata['items'] = [];

  for (const product of products) {
    const label = product.name.trim();
    const value = label.toLowerCase();
    // Skip blanks and duplicates. Names come from CatalogSource, not the labeler.
    if (!label || !value || seen.has(value)) continue;
    seen.add(value);
    items.push({ label, value });
    if (items.length >= MAX_PRODUCT_CHIPS) break;
  }

  if (items.length === 0) return DEFAULT_ASSISTANT_METADATA;
  return { type: 'buttons', items };
}
