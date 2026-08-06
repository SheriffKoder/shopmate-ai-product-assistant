/**
 * Locale Assertion
 *
 * Purpose: Validates route locale params before pages render.
 * Used in: app/[locale]/layout.tsx and localized route entries.
 * Used for: Converts unknown route strings into the supported AppLocale type.
 */

import { notFound } from 'next/navigation';

import { APP_LOCALES, type AppLocale } from '@/shared/i18n/config';

/**
 * Checks whether a string is a supported locale.
 *
 * @param value - Raw route value to check.
 * @returns True when the value is one of the supported locales.
 */
export function isAppLocale(value: string): value is AppLocale {
  return APP_LOCALES.includes(value as AppLocale);
}

/**
 * Returns a typed locale or renders the app not-found boundary.
 *
 * @param value - Raw route locale value.
 * @returns Supported locale.
 */
export function assertAppLocale(value: string): AppLocale {
  if (!isAppLocale(value)) {
    notFound();
  }

  return value;
}
