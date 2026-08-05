/**
 * Product Detail View
 *
 * Purpose: Composes one server-first product detail route.
 * Used in: app/[locale]/products/[slug]/page.tsx
 * Used for: Loads localized dictionary and DB-backed product detail data.
 */

import { notFound } from 'next/navigation';
import type { AppLocale } from '@/shared/i18n/config';
import { getDictionary } from '@/shared/i18n/lib/get-dictionary';
import { getProductDetailPageData } from '@/views/product-detail/queries/get-product-detail-page-data';
import { ProductDetailPage } from '@/views/product-detail/ui/product-detail-page';

type ProductDetailViewProps = {
  locale: AppLocale;
  slug: string;
};

/**
 * Loads and renders a single product detail page.
 *
 * @param props - Active locale and product slug.
 * @returns A localized product detail page.
 */
export async function ProductDetailView(props: ProductDetailViewProps) {
  const { locale, slug } = props;
  const dictionary = getDictionary(locale);
  const data = await getProductDetailPageData(slug);

  if (!data.product) {
    notFound();
  }

  return <ProductDetailPage data={data} dictionary={dictionary} locale={locale} />;
}
