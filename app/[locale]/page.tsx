/**
 * Home Route
 *
 * Purpose: Thin App Router entry for the home page.
 * Used in: Next.js routing at /[locale]
 * Used for: Delegates server-first page composition to the home view.
 */

import { HomeView } from '@/views/home';
import { assertAppLocale } from '@/shared/i18n/lib/assert-locale';
import { getDictionary } from '@/shared/i18n/lib/get-dictionary';
import { createPageMetadata } from '@/shared/seo/metadata';
import type { Metadata } from 'next';

export const revalidate = 864000;

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const locale = assertAppLocale((await params).locale);
  const dictionary = getDictionary(locale);

  return createPageMetadata({ locale, title: 'Shop electronics', description: dictionary.home.description });
}

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
