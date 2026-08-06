/**
 * Categories Route
 *
 * Purpose: Thin App Router entry for the categories landing page.
 * Used in: Next.js routing at /[locale]/categories
 */

import { APP_LOCALES } from '@/shared/i18n/config';
import { assertAppLocale } from '@/shared/i18n/lib/assert-locale';
import { CategoriesView } from '@/views/categories';

type CategoriesRouteProps = {
  params: Promise<{ locale: string }>;
};

export const revalidate = 864000;

export function generateStaticParams() {
  return APP_LOCALES.map(function mapLocale(locale) {
    return { locale };
  });
}

export default async function CategoriesRoute({ params }: CategoriesRouteProps) {
  const { locale: rawLocale } = await params;

  return <CategoriesView locale={assertAppLocale(rawLocale)} />;
}
