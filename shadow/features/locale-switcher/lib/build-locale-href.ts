/**
 * Shadow Locale Href Builder
 *
 * Purpose: Builds locale-switch links while preserving the active shadow path.
 * Used in: shadow locale switcher client island.
 * Used for: Replaces only the locale segment in `/shadow/[locale]` URLs.
 */

import type { ShadowLocale } from '@/shadow/shared/i18n/config';

type BuildShadowLocaleHrefInput = {
  pathname: string;
  currentLocale: ShadowLocale;
  nextLocale: ShadowLocale;
};

/**
 * Builds the href for changing locales on shadow public pages.
 *
 * @param input - Current pathname and locale transition.
 * @returns A localized shadow href that preserves remaining route segments.
 */
export function buildShadowLocaleHref(input: BuildShadowLocaleHrefInput) {
  const { pathname, currentLocale, nextLocale } = input;
  const currentPrefix = `/shadow/${currentLocale}`;
  const nextPrefix = `/shadow/${nextLocale}`;

  if (pathname === currentPrefix) {
    return nextPrefix;
  }

  if (pathname.startsWith(`${currentPrefix}/`)) {
    return `${nextPrefix}${pathname.slice(currentPrefix.length)}`;
  }

  return nextPrefix;
}
