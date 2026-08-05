/**
 * Shadow Product Detail Route
 *
 * Purpose: Thin App Router entry for one shadow product detail page.
 * Used in: Next.js routing at /[locale]/products/[slug]
 * Used for: Delegates server-first product detail composition to a shadow view.
 */

import { ShadowProductDetailView } from '@/views/product-detail';
import { getShadowProductStaticParams } from '@/entities/product/queries/product-queries';
import { SHADOW_PUBLIC_PAGE_REVALIDATE_SECONDS } from '@/shared/config/cache';
import { SHADOW_LOCALES } from '@/shared/i18n/config';
import { assertShadowLocale } from '@/shared/i18n/lib/assert-locale';

type ShadowProductDetailPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export const revalidate = SHADOW_PUBLIC_PAGE_REVALIDATE_SECONDS;

/**
 * Prebuilds known shadow product detail pages for every supported locale.
 *
 * @returns Locale/product slug combinations for static generation.
 */
export async function generateStaticParams() {
  const productParams = await getShadowProductStaticParams();

  return SHADOW_LOCALES.flatMap(function mapLocale(locale) {
    return productParams.map(function mapProduct(product) {
      return {
        locale,
        slug: product.slug,
      };
    });
  });
}

/**
 * Renders one shadow product detail page.
 *
 * @param props - Locale and product slug route params from Next.js.
 * @returns The server-first shadow product detail view.
 */
export default async function ShadowProductDetailPage(props: ShadowProductDetailPageProps) {
  const { locale: rawLocale, slug } = await props.params;
  const locale = assertShadowLocale(rawLocale);

  return <ShadowProductDetailView locale={locale} slug={slug} />;
}
