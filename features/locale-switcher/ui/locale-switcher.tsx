'use client';

/**
 * Shadow Locale Switcher
 *
 * Purpose: Provides the localized header's only client-side interaction.
 * Used in: widgets/shadow-header/ui/shadow-header.tsx and the promoted app header.
 * Used for: Switches between EN and AR while preserving the current shadow path.
 */

import { useId } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { SHADOW_LOCALES, type ShadowLocale } from '@/shared/i18n/config';
import { buildShadowLocaleHref } from '@/features/locale-switcher/lib/build-locale-href';

type ShadowLocaleSwitcherProps = {
  locale: ShadowLocale;
  label: string;
  localeNames: Record<ShadowLocale, string>;
};

/**
 * Renders a keyboard-accessible locale selector for shadow routes.
 *
 * @param props - Active locale, control label, and localized locale names.
 * @returns A client-rendered locale select control.
 */
export function ShadowLocaleSwitcher(props: ShadowLocaleSwitcherProps) {
  const { locale, label, localeNames } = props;
  const selectId = useId();
  const pathname = usePathname();
  const router = useRouter();

  /**
   * Navigates to the selected locale while keeping the current page path.
   *
   * @param nextLocale - Locale selected by the user.
   */
  function handleLocaleChange(nextLocale: ShadowLocale) {
    const href = buildShadowLocaleHref({
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
        onChange={(event) => handleLocaleChange(event.target.value as ShadowLocale)}
        className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        {SHADOW_LOCALES.map((shadowLocale) => (
          <option key={shadowLocale} value={shadowLocale}>
            {localeNames[shadowLocale]}
          </option>
        ))}
      </select>
    </div>
  );
}
