/**
 * Shadow Products Result Count Label
 *
 * Purpose: Builds localized result count text for the products listing view.
 * Used in: views/products/ui/products-page.tsx
 * Used for: Keeps derived display text outside the component file.
 */

import type { ShadowDictionary } from '@/shared/i18n/model/dictionary';

/**
 * Builds product count display text.
 *
 * @param dictionary - Localized dictionary copy.
 * @param count - Number of rendered products.
 * @returns Localized product count label.
 */
export function getShadowProductsResultCountLabel(dictionary: ShadowDictionary, count: number): string {
  return dictionary.products.resultCount.replace('{count}', String(count));
}
