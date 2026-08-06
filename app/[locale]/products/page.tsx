/**
 * Products Route
 *
 * Purpose: Thin App Router entry for the products listing.
 * Used in: Next.js routing at /[locale]/products
 * Used for: Delegates server-first product listing composition to a view.
 */

import { ProductsView } from '@/views/products';
import { assertAppLocale } from '@/shared/i18n/lib/assert-locale';
import { getDictionary } from '@/shared/i18n/lib/get-dictionary';
import { createPageMetadata } from '@/shared/seo/metadata';
import type { Metadata } from 'next';

type ProductsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const revalidate = 864000; // 10 days

export async function generateMetadata({ params }: ProductsPageProps): Promise<Metadata> {
  const locale = assertAppLocale((await params).locale);
  const dictionary = getDictionary(locale);

  return createPageMetadata({ locale, pathname: '/products', title: dictionary.products.title, description: dictionary.products.description });
}

/**
 * Renders the products listing page.
 *
 * @param props - Locale route params from Next.js.
 * @returns The server-first products view.
 */
export default async function ProductsPage(props: ProductsPageProps) {
  const { locale: rawLocale } = await props.params;
  const locale = assertAppLocale(rawLocale);

  return <ProductsView locale={locale} />;
}
