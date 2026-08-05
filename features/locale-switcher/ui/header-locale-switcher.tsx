/**
 * Header Locale Switcher
 *
 * Purpose: Connects the locale switcher to the active localized route segment.
 * Used in: widgets/app-header/ui/app-header.tsx
 * Used for: Keeps header locale state inside the locale-switcher feature.
 */

'use client';

import { usePathname } from 'next/navigation';

import { getLocaleFromPathname } from '@/shared/i18n/lib/get-locale-from-pathname';
import { AppLocaleSwitcher } from '@/features/locale-switcher/ui/locale-switcher';

const HEADER_LOCALE_NAMES = {
  en: 'EN',
  ar: 'AR',
} as const;

/**
 * Renders the connected locale dropdown for the app header.
 *
 * @returns Client locale switcher island.
 */
export function HeaderLocaleSwitcher() {
  const locale = getLocaleFromPathname(usePathname());

  return (
    <AppLocaleSwitcher
      locale={locale}
      label="Language"
      localeNames={HEADER_LOCALE_NAMES}
    />
  );
}
