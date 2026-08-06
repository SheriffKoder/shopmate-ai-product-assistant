/**
 * Products View
 *
 * Purpose: Server-first composition surface for the products route.
 * Used in: app/[locale]/products/page.tsx
 * Used for: Loads localized copy and DB-backed catalog data for product listings.
 */

import type { AppLocale } from '@/shared/i18n/config';
import { getDictionary } from '@/shared/i18n/lib/get-dictionary';
import { getProductsPageData } from '@/views/products/queries/get-products-page-data';
import { ProductsPage } from '@/views/products/ui/products-page';

type ProductsViewProps = {
  locale: AppLocale;
};

/**
 * Renders the products listing view.
 *
 * @param props - Active locale for localized products rendering.
 * @returns A server-rendered products page.
 */
export async function ProductsView(props: ProductsViewProps) {
  const { locale } = props;
  const dictionary = getDictionary(locale);
  const data = await getProductsPageData();

  return <ProductsPage data={data} dictionary={dictionary} locale={locale} />;
}
