/**
 * I18n Config
 *
 * Purpose: Defines the supported locale contract for public pages.
 * Used in: route boundaries, dictionaries, and locale-aware UI.
 * Used for: Keeps EN/AR locale validation and text direction centralized.
 */

export const APP_LOCALES = ['en', 'ar'] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'en';

export const LOCALE_DIRECTIONS: Record<AppLocale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  ar: 'rtl',
};

/**
 * Returns the document direction for a supported locale.
 *
 * @param locale - Supported locale.
 * @returns Text direction for the locale.
 */
export function getLocaleDirection(locale: AppLocale) {
  return LOCALE_DIRECTIONS[locale];
}
