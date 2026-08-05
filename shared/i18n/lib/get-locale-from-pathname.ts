/**
 * Locale From Pathname
 *
 * Purpose: Reads the active locale segment from the current pathname.
 * Used in: client header and cart navigation islands.
 * Used for: Keeps client navigation aligned with localized public routes.
 */

import {
  SHADOW_DEFAULT_LOCALE,
  SHADOW_LOCALES,
  type ShadowLocale,
} from '@/shared/i18n/config';

/**
 * Returns the locale represented by the current pathname.
 *
 * @param pathname - Current app pathname.
 * @returns Supported locale, falling back to the default locale.
 */
export function getLocaleFromPathname(pathname: string | null): ShadowLocale {
  const maybeLocale = pathname?.split('/').filter(Boolean)[0];

  if (SHADOW_LOCALES.some((locale) => locale === maybeLocale)) {
    return maybeLocale as ShadowLocale;
  }

  return SHADOW_DEFAULT_LOCALE;
}
