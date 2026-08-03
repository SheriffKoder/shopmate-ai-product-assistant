/**
 * Shadow I18n Config
 *
 * Purpose: Defines the supported locale contract for shadow public pages.
 * Used in: shadow route boundaries, dictionaries, and locale-aware UI.
 * Used for: Keeps EN/AR locale validation and text direction centralized.
 */

export const SHADOW_LOCALES = ['en', 'ar'] as const;

export type ShadowLocale = (typeof SHADOW_LOCALES)[number];

export const SHADOW_DEFAULT_LOCALE: ShadowLocale = 'en';

export const SHADOW_LOCALE_DIRECTIONS: Record<ShadowLocale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  ar: 'rtl',
};

/**
 * Returns the document direction for a supported shadow locale.
 *
 * @param locale - Supported shadow locale.
 * @returns Text direction for the locale.
 */
export function getShadowLocaleDirection(locale: ShadowLocale) {
  return SHADOW_LOCALE_DIRECTIONS[locale];
}
