/**
 * Shadow Locale Assertion
 *
 * Purpose: Validates route locale params before shadow pages render.
 * Used in: app/shadow/[locale]/layout.tsx and localized route entries.
 * Used for: Converts unknown route strings into the supported ShadowLocale type.
 */

import { notFound } from 'next/navigation';

import { SHADOW_LOCALES, type ShadowLocale } from '@/shadow/shared/i18n/config';

/**
 * Checks whether a string is a supported shadow locale.
 *
 * @param value - Raw route value to check.
 * @returns True when the value is one of the supported shadow locales.
 */
export function isShadowLocale(value: string): value is ShadowLocale {
  return SHADOW_LOCALES.includes(value as ShadowLocale);
}

/**
 * Returns a typed locale or renders the app not-found boundary.
 *
 * @param value - Raw route locale value.
 * @returns Supported shadow locale.
 */
export function assertShadowLocale(value: string): ShadowLocale {
  if (!isShadowLocale(value)) {
    notFound();
  }

  return value;
}
