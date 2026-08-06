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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
    <DropdownMenu>
      <DropdownMenuTrigger aria-label={label} className="header-control gap-2">
        <Languages aria-hidden="true" className="size-5 stroke-2" />
        <span>{localeNames[locale]}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-foreground bg-foreground p-0 text-background shadow-none">
        {APP_LOCALES.map((nextLocale) => (
          <DropdownMenuItem
            key={nextLocale}
            onSelect={() => handleLocaleChange(nextLocale)}
            className="px-3 py-2 text-background focus:bg-foreground focus:text-primary data-[selected=true]:text-primary"
            data-selected={nextLocale === locale}
          >
            {localeNames[nextLocale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
