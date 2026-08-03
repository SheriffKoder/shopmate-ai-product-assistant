/**
 * Shadow Localized List Reader
 *
 * Purpose: Reads EN/AR list values for shadow catalog detail sections.
 * Used in: shadow product detail UI.
 * Used for: Keeps localized list fallback logic out of component markup.
 */

import type { ShadowLocale } from '@/shadow/shared/i18n/config';
import type { ShadowLocalizedList } from '@/shadow/shared/model/localization';

/**
 * Reads a localized list with an English fallback.
 *
 * @param value - Localized list from catalog data.
 * @param locale - Active shadow locale.
 * @returns Locale-specific list items, falling back to English when empty.
 */
export function getShadowLocalizedList(value: ShadowLocalizedList, locale: ShadowLocale): string[] {
  return value[locale].length > 0 ? value[locale] : value.en;
}
