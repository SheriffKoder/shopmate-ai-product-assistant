/**
 * Shadow Dictionary Lookup
 *
 * Purpose: Resolves a typed dictionary for a supported shadow locale.
 * Used in: shadow server routes, views, and widgets.
 * Used for: Keeps localized copy access behind one small shared API.
 */

import { shadowArDictionary } from '@/shared/i18n/dictionaries/ar';
import { shadowEnDictionary } from '@/shared/i18n/dictionaries/en';
import type { ShadowLocale } from '@/shared/i18n/config';
import type { ShadowDictionary } from '@/shared/i18n/model/dictionary';

const SHADOW_DICTIONARIES: Record<ShadowLocale, ShadowDictionary> = {
  en: shadowEnDictionary,
  ar: shadowArDictionary,
};

/**
 * Gets the localized dictionary for a supported shadow locale.
 *
 * @param locale - Supported shadow locale.
 * @returns Dictionary copy for the locale.
 */
export function getShadowDictionary(locale: ShadowLocale): ShadowDictionary {
  return SHADOW_DICTIONARIES[locale];
}
