/**
 * Shadow Localized Text Reader
 *
 * Purpose: Reads EN/AR values from shadow localized catalog fields.
 * Used in: shadow server views and widgets.
 * Used for: Keeps locale fallback rules consistent across page rendering.
 */

import type { ShadowLocale } from '@/shared/i18n/config';
import type { ShadowLocaleText } from '@/shared/model/localization';

/**
 * Reads localized text with an English fallback.
 *
 * @param value - Localized database text.
 * @param locale - Active shadow locale.
 * @returns The locale-specific value, falling back to English when needed.
 */
export function getShadowLocalizedText(value: ShadowLocaleText, locale: ShadowLocale): string {
  return value[locale] || value.en;
}
