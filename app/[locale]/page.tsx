/**
 * Home Route
 *
 * Purpose: Thin App Router entry for the home page.
 * Used in: Next.js routing at /[locale]
 * Used for: Delegates server-first page composition to the home view.
 */

import { HomeView } from '@/views/home';
import { assertAppLocale } from '@/shared/i18n/lib/assert-locale';
import { PUBLIC_PAGE_REVALIDATE_SECONDS } from '@/shared/config/cache';

export const revalidate = PUBLIC_PAGE_REVALIDATE_SECONDS;

type HomePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

/**
 * Renders the home page for the requested locale.
 *
 * @param props - Locale route params from Next.js.
 * @returns The server-first home view.
 */
export default async function HomePage(props: HomePageProps) {
  const { locale: rawLocale } = await props.params;
  const locale = assertAppLocale(rawLocale);

  return <HomeView locale={locale} />;
}
