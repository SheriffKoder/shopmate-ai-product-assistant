'use client';

/**
 * Locale Switcher
 *
 * Purpose: Provides the localized header's only client-side interaction.
 * Used in: the promoted app header.
 * Used for: Switches between EN and AR while preserving the current path.
 */

import { usePathname, useRouter } from 'next/navigation';
import { Languages } from 'lucide-react';

import { APP_LOCALES, type AppLocale } from '@/shared/i18n/config';
import { buildAppLocaleHref } from '@/features/locale-switcher/lib/build-locale-href';
import { CustomDropdown } from '@/shared/ui/custom-dropdown';

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
  const pathname = usePathname();
  const router = useRouter();
  const localeItems = APP_LOCALES.map(function mapLocaleOption(nextLocale) {
    return {
      id: nextLocale,
      label: localeNames[nextLocale],
    };
  });

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
    <CustomDropdown
      ariaLabel={label}
      contentClassName="border border-foreground p-0 shadow-none"
      direction="down"
      itemClassName="px-3 py-2 hover:bg-primary hover:text-foreground focus:bg-primary focus:text-foreground"
      items={localeItems}
      onItemSelect={function selectLocale(nextLocale) { handleLocaleChange(nextLocale as AppLocale); }}
      selectedItemClassName="text-primary"
      selectedItemId={locale}
      startIcon={<Languages aria-hidden="true" className="size-5 stroke-2" />}
      triggerClassName="header-control min-w-0 max-w-none gap-2"
    />
  );
}
