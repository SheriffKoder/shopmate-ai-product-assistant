/**
 * Products Route
 *
 * Purpose: Thin App Router entry for the products listing.
 * Used in: Next.js routing at /[locale]/products
 * Used for: Delegates server-first product listing composition to a view.
 */

import { ProductsView } from '@/views/products';
import { assertAppLocale } from '@/shared/i18n/lib/assert-locale';
import { PUBLIC_PAGE_REVALIDATE_SECONDS } from '@/shared/config/cache';

type ProductsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const revalidate = PUBLIC_PAGE_REVALIDATE_SECONDS;

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
