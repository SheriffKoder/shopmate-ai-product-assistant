/**
 * Shadow Locale Layout
 *
 * Purpose: Wraps the server-first shadow public pages for one locale.
 * Used in: Next.js routing under /shadow/[locale]
 * Used for: Provides locale metadata context without importing current app features.
 */

import type { ReactNode } from 'react';

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
  const { locale } = await params;
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <section lang={locale} dir={direction} className="min-h-screen bg-background text-foreground">
      {children}
    </section>
  );
}
