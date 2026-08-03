/**
 * Shadow Product Search
 *
 * Purpose: Provides pure product search matching for server-first catalog pages.
 * Used in: shadow/views/products/queries/get-products-page-data.ts
 * Used for: Keeps filtering/search out of client components during phase 0.
 */

import type { ShadowProduct } from '@/shadow/entities/product/model/product';
import type { ShadowLocale } from '@/shadow/shared/i18n/config';
import { getShadowLocalizedText } from '@/shadow/shared/i18n/lib/get-localized-text';

/**
 * Checks whether every query word appears somewhere in the provided text.
 *
 * @param query - User-provided search query.
 * @param target - Combined searchable product text.
 * @returns True when every query word is present.
 */
function shadowSearchInTarget(query: string, target: string): boolean {
  const queryWords = query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(function removeEmptyWord(word) {
      return word.length > 0;
    });

  if (queryWords.length === 0) {
    return false;
  }

  const normalizedTarget = target.toLowerCase();

  return queryWords.every(function hasQueryWord(word) {
    return normalizedTarget.includes(word);
  });
}

/**
 * Checks a localized shadow product against a search query.
 *
 * @param query - User-provided search query.
 * @param product - Shadow product to search.
 * @param locale - Active locale for localized text fields.
 * @returns True when the query matches the product fields.
 */
export function searchShadowProduct(query: string, product: ShadowProduct, locale: ShadowLocale): boolean {
  const localizedFeatures = product.features[locale] ?? product.features.en;
  const searchableFields = [
    product.slug,
    product.categorySlug,
    getShadowLocalizedText(product.name, locale),
    getShadowLocalizedText(product.shortDescription, locale),
    getShadowLocalizedText(product.description, locale),
    ...localizedFeatures,
    ...product.keywords,
    ...product.colors,
  ];

  return shadowSearchInTarget(query, searchableFields.join(' '));
}
