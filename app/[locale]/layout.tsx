/**
 * Shadow Locale Layout
 *
 * Purpose: Wraps the server-first public pages for one locale.
 * Used in: Next.js routing under /[locale]
 * Used for: Provides locale metadata while the root layout wrapper owns header/footer.
 */

import type { ReactNode } from 'react';

import { getShadowLocaleDirection } from '@/shared/i18n/config';
import { assertShadowLocale } from '@/shared/i18n/lib/assert-locale';

type ShadowLocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

/**
 * Renders the locale-scoped shadow page shell.
 *
 * @param props - Route children and locale params from Next.js.
 * @returns A server-rendered locale wrapper.
 */
export default async function ShadowLocaleLayout(props: ShadowLocaleLayoutProps) {
  const { children, params } = props;
  const { locale: rawLocale } = await params;
  const locale = assertShadowLocale(rawLocale);
  const direction = getShadowLocaleDirection(locale);

  return (
    <section lang={locale} dir={direction} className="min-h-screen bg-background text-foreground">
      {children}
    </section>
  );
}
