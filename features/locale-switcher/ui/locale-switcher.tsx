'use client';

/**
 * Locale Switcher
 *
 * Purpose: Provides the localized header's only client-side interaction.
 * Used in: the promoted app header.
 * Used for: Switches between EN and AR while preserving the current path.
 */

import { useId } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { APP_LOCALES, type AppLocale } from '@/shared/i18n/config';
import { buildAppLocaleHref } from '@/features/locale-switcher/lib/build-locale-href';

type AppLocaleSwitcherProps = {
  locale: AppLocale;
  label: string;
  localeNames: Record<AppLocale, string>;
};

/**
 * Renders a keyboard-accessible locale selector for routes.
 *
 * @param props - Active locale, control label, and localized locale names.
 * @returns A client-rendered locale select control.
 */
export function AppLocaleSwitcher(props: AppLocaleSwitcherProps) {
  const { locale, label, localeNames } = props;
  const selectId = useId();
  const pathname = usePathname();
  const router = useRouter();

  /**
   * Navigates to the selected locale while keeping the current page path.
   *
   * @param nextLocale - Locale selected by the user.
   */
  function handleLocaleChange(nextLocale: AppLocale) {
    const href = buildAppLocaleHref({
      pathname,
      currentLocale: locale,
      nextLocale,
    });

    router.push(href);
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={selectId} className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <select
        id={selectId}
        value={locale}
        onChange={(event) => handleLocaleChange(event.target.value as AppLocale)}
        className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        {APP_LOCALES.map((locale) => (
          <option key={locale} value={locale}>
            {localeNames[locale]}
          </option>
        ))}
      </select>
    </div>
  );
}
