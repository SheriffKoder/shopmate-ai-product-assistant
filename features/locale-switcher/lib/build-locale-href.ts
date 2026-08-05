/**
 * Shadow Locale Href Builder
 *
 * Purpose: Builds locale-switch links while preserving the active localized path.
 * Used in: shadow locale switcher client island.
 * Used for: Replaces only the leading locale segment in `/[locale]` URLs.
 */

import type { ShadowLocale } from '@/shared/i18n/config';

type BuildShadowLocaleHrefInput = {
  pathname: string;
  currentLocale: ShadowLocale;
  nextLocale: ShadowLocale;
};

/**
 * Builds the href for changing locales on public pages.
 *
 * @param input - Current pathname and locale transition.
 * @returns A localized href that preserves remaining route segments.
 */
export function buildShadowLocaleHref(input: BuildShadowLocaleHrefInput) {
  const { pathname, currentLocale, nextLocale } = input;
  const currentPrefix = `/${currentLocale}`;
  const nextPrefix = `/${nextLocale}`;

  if (pathname === currentPrefix) {
    return nextPrefix;
  }

  if (pathname.startsWith(`${currentPrefix}/`)) {
    return `${nextPrefix}${pathname.slice(currentPrefix.length)}`;
  }

  return nextPrefix;
}
