/**
 * Shadow Home Route
 *
 * Purpose: Thin App Router entry for the shadow home page.
 * Used in: Next.js routing at /shadow/[locale]
 * Used for: Delegates server-first page composition to the shadow home view.
 */

import { ShadowHomeView } from '@/shadow/views/home';
import { assertShadowLocale } from '@/shadow/shared/i18n/lib/assert-locale';

type ShadowHomePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

/**
 * Renders the shadow home page for the requested locale.
 *
 * @param props - Locale route params from Next.js.
 * @returns The server-first shadow home view.
 */
export default async function ShadowHomePage(props: ShadowHomePageProps) {
  const { locale: rawLocale } = await props.params;
  const locale = assertShadowLocale(rawLocale);

  return <ShadowHomeView locale={locale} />;
}
