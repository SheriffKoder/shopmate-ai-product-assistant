/**
 * Product Detail Route
 *
 * Purpose: Thin App Router entry for one product detail page.
 * Used in: Next.js routing at /[locale]/products/[slug]
 * Used for: Delegates server-first product detail composition to a view.
 */

import { ProductDetailView } from '@/views/product-detail';
import { getProductStaticParams } from '@/entities/product/queries/product-queries';
import { PUBLIC_PAGE_REVALIDATE_SECONDS } from '@/shared/config/cache';
import { APP_LOCALES } from '@/shared/i18n/config';
import { assertAppLocale } from '@/shared/i18n/lib/assert-locale';

type ProductDetailPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export const revalidate = PUBLIC_PAGE_REVALIDATE_SECONDS;

/**
 * Prebuilds known product detail pages for every supported locale.
 *
 * @returns Locale/product slug combinations for static generation.
 */
export async function generateStaticParams() {
  const productParams = await getProductStaticParams();

  return APP_LOCALES.flatMap(function mapLocale(locale) {
    return productParams.map(function mapProduct(product) {
      return {
        locale,
        slug: product.slug,
      };
    });
  });
}

/**
 * Renders one product detail page.
 *
 * @param props - Locale and product slug route params from Next.js.
 * @returns The server-first product detail view.
 */
export default async function ProductDetailPage(props: ProductDetailPageProps) {
  const { locale: rawLocale, slug } = await props.params;
  const locale = assertAppLocale(rawLocale);

  return <ProductDetailView locale={locale} slug={slug} />;
}
