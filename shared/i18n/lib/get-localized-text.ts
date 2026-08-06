/**
 * Localized Text Reader
 *
 * Purpose: Reads EN/AR values from localized catalog fields.
 * Used in: server views and widgets.
 * Used for: Keeps locale fallback rules consistent across page rendering.
 */

import type { AppLocale } from '@/shared/i18n/config';
import type { LocaleText } from '@/shared/model/localization';

/**
 * Reads localized text with an English fallback.
 *
 * @param value - Localized database text.
 * @param locale - Active locale.
 * @returns The locale-specific value, falling back to English when needed.
 */
export function getLocalizedText(value: LocaleText, locale: AppLocale): string {
  return value[locale] || value.en;
}
