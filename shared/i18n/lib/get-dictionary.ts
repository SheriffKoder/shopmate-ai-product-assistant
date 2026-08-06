/**
 * Dictionary Lookup
 *
 * Purpose: Resolves a typed dictionary for a supported locale.
 * Used in: server routes, views, and widgets.
 * Used for: Keeps localized copy access behind one small shared API.
 */

import { arDictionary } from '@/shared/i18n/dictionaries/ar';
import { enDictionary } from '@/shared/i18n/dictionaries/en';
import type { AppLocale } from '@/shared/i18n/config';
import type { AppDictionary } from '@/shared/i18n/model/dictionary';

const DICTIONARIES: Record<AppLocale, AppDictionary> = {
  en: enDictionary,
  ar: arDictionary,
};

/**
 * Gets the localized dictionary for a supported locale.
 *
 * @param locale - Supported locale.
 * @returns Dictionary copy for the locale.
 */
export function getDictionary(locale: AppLocale): AppDictionary {
  return DICTIONARIES[locale];
}
