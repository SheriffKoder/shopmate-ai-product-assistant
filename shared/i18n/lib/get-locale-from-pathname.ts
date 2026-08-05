/**
 * Locale From Pathname
 *
 * Purpose: Reads the active locale segment from the current pathname.
 * Used in: client header and cart navigation islands.
 * Used for: Keeps client navigation aligned with localized public routes.
 */

import {
  DEFAULT_LOCALE,
  APP_LOCALES,
  type AppLocale,
} from '@/shared/i18n/config';

/**
 * Returns the locale represented by the current pathname.
 *
 * @param pathname - Current app pathname.
 * @returns Supported locale, falling back to the default locale.
 */
export function getLocaleFromPathname(pathname: string | null): AppLocale {
  const maybeLocale = pathname?.split('/').filter(Boolean)[0];

  if (APP_LOCALES.some((locale) => locale === maybeLocale)) {
    return maybeLocale as AppLocale;
  }

  return DEFAULT_LOCALE;
}
