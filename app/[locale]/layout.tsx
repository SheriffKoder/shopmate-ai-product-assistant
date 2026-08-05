/**
 * Locale Layout
 *
 * Purpose: Wraps the server-first public pages for one locale.
 * Used in: Next.js routing under /[locale]
 * Used for: Provides locale metadata while the root layout wrapper owns header/footer.
 */

import type { ReactNode } from 'react';

import { getLocaleDirection } from '@/shared/i18n/config';
import { assertAppLocale } from '@/shared/i18n/lib/assert-locale';

type AppLocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

/**
 * Renders the locale-scoped page shell.
 *
 * @param props - Route children and locale params from Next.js.
 * @returns A server-rendered locale wrapper.
 */
export default async function AppLocaleLayout(props: AppLocaleLayoutProps) {
  const { children, params } = props;
  const { locale: rawLocale } = await params;
  const locale = assertAppLocale(rawLocale);
  const direction = getLocaleDirection(locale);

  return (
    <section lang={locale} dir={direction} className="min-h-screen bg-background text-foreground">
      {children}
    </section>
  );
}
