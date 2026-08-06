/**
 * Product Detail Route
 *
 * Purpose: Thin App Router entry for one product detail page.
 * Used in: Next.js routing at /[locale]/products/[slug]
 * Used for: Delegates server-first product detail composition to a view.
 */

import { ProductDetailView } from '@/views/product-detail';
import { getProductStaticParams } from '@/entities/product/queries/product-queries';
import { APP_LOCALES } from '@/shared/i18n/config';
import { assertAppLocale } from '@/shared/i18n/lib/assert-locale';
import { getProduct } from '@/entities/product/queries/product-queries';
import { getLocalizedText } from '@/shared/i18n/lib/get-localized-text';
import { createPageMetadata } from '@/shared/seo/metadata';
import type { Metadata } from 'next';
import { StructuredData } from '@/shared/seo/ui/structured-data';
import { getLocalizedUrl } from '@/shared/seo/config';

type ProductDetailPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export const revalidate = 864000; // 10 days

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = assertAppLocale(rawLocale);
  const product = await getProduct({ slug });

  if (!product) return { title: 'Product not found' };

  return createPageMetadata({
    locale,
    pathname: `/products/${product.slug}`,
    title: getLocalizedText(product.name, locale),
    description: getLocalizedText(product.shortDescription, locale),
    imagePath: product.imageUrl,
  });
}

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

  const product = await getProduct({ slug });
  const productName = product ? getLocalizedText(product.name, locale) : 'Product';

  return (
    <>
      <StructuredData data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Products', item: getLocalizedUrl(locale, '/products') },
        { '@type': 'ListItem', position: 2, name: productName, item: getLocalizedUrl(locale, `/products/${slug}`) },
      ] }} />
      {product ? <StructuredData data={{ '@context': 'https://schema.org', '@type': 'Product', name: productName, description: getLocalizedText(product.description, locale), image: [product.imageUrl, ...product.imageUrlVariations].filter(Boolean), sku: product.id, offers: { '@type': 'Offer', priceCurrency: 'USD', price: product.price, availability: 'https://schema.org/InStock', url: getLocalizedUrl(locale, `/products/${slug}`) }, aggregateRating: product.reviewsCount > 0 ? { '@type': 'AggregateRating', ratingValue: product.rating, reviewCount: product.reviewsCount } : undefined }} /> : null}
      <ProductDetailView locale={locale} slug={slug} />
    </>
  );
}
