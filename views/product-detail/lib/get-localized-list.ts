/**
 * Localized List Reader
 *
 * Purpose: Reads EN/AR list values for catalog detail sections.
 * Used in: product detail UI.
 * Used for: Keeps localized list fallback logic out of component markup.
 */

import type { AppLocale } from '@/shared/i18n/config';
import type { LocalizedList } from '@/shared/model/localization';

/**
 * Reads a localized list with an English fallback.
 *
 * @param value - Localized list from catalog data.
 * @param locale - Active locale.
 * @returns Locale-specific list items, falling back to English when empty.
 */
export function getLocalizedList(value: LocalizedList, locale: AppLocale): string[] {
  return value[locale].length > 0 ? value[locale] : value.en;
}
