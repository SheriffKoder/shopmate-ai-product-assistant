/**
 * Categories Route
 *
 * Purpose: Thin App Router entry for the categories landing page.
 * Used in: Next.js routing at /[locale]/categories
 */

import { APP_LOCALES } from '@/shared/i18n/config';
import { assertAppLocale } from '@/shared/i18n/lib/assert-locale';
import { CategoriesView } from '@/views/categories';
import { getDictionary } from '@/shared/i18n/lib/get-dictionary';
import { createPageMetadata } from '@/shared/seo/metadata';
import type { Metadata } from 'next';

type CategoriesRouteProps = {
  params: Promise<{ locale: string }>;
};

export const revalidate = 864000;

export async function generateMetadata({ params }: CategoriesRouteProps): Promise<Metadata> {
  const locale = assertAppLocale((await params).locale);
  const dictionary = getDictionary(locale);

  return createPageMetadata({ locale, pathname: '/categories', title: 'Shop by category', description: dictionary.home.categoriesTitle });
}

export function generateStaticParams() {
  return APP_LOCALES.map(function mapLocale(locale) {
    return { locale };
  });
}

export default async function CategoriesRoute({ params }: CategoriesRouteProps) {
  const { locale: rawLocale } = await params;

  return <CategoriesView locale={assertAppLocale(rawLocale)} />;
}
