/**
 * Shadow Header
 *
 * Purpose: Renders the server-first navigation shell for localized shadow pages.
 * Used in: app/[locale]/layout.tsx
 * Used for: Provides localized home/products navigation and the locale switcher island.
 */

import Link from 'next/link';

import type { ShadowLocale } from '@/shadow/shared/i18n/config';
import type { ShadowDictionary } from '@/shadow/shared/i18n/model/dictionary';
import { ShadowLocaleSwitcher } from '@/shadow/features/locale-switcher/ui/locale-switcher';

type ShadowHeaderProps = {
  locale: ShadowLocale;
  dictionary: ShadowDictionary;
};

/**
 * Renders the localized shadow page header.
 *
 * @param props - Active locale and localized dictionary copy.
 * @returns A server-rendered header with one client locale switcher.
 */
export function ShadowHeader(props: ShadowHeaderProps) {
  const { locale, dictionary } = props;
  const homeHref = `/${locale}`;
  const productsHref = `/${locale}/products`;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href={homeHref} className="text-lg font-semibold tracking-normal text-foreground">
          {dictionary.common.brandName}
        </Link>

        <nav
          aria-label={dictionary.header.navigation.label}
          className="flex items-center gap-3 sm:gap-5"
        >
          <Link
            href={homeHref}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {dictionary.header.navigation.home}
          </Link>
          <Link
            href={productsHref}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {dictionary.header.navigation.products}
          </Link>
        </nav>

        <ShadowLocaleSwitcher
          locale={locale}
          label={dictionary.common.language}
          localeNames={dictionary.common.localeNames}
        />
      </div>
    </header>
  );
}
