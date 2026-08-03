/**
 * Shadow Product Detail Page UI
 *
 * Purpose: Renders one localized server-first product detail page.
 * Used in: shadow/views/product-detail/index.tsx
 * Used for: Displays DB-backed product details without cart or assistant behavior.
 */

import Image from 'next/image';
import Link from 'next/link';
import type { ShadowDictionary } from '@/shadow/shared/i18n/model/dictionary';
import type { ShadowLocale } from '@/shadow/shared/i18n/config';
import { getShadowLocalizedText } from '@/shadow/shared/i18n/lib/get-localized-text';
import { getShadowLocalizedList } from '@/shadow/views/product-detail/lib/get-localized-list';
import type { ShadowProductDetailPageData } from '@/shadow/views/product-detail/queries/get-product-detail-page-data';
import { ShadowProductGrid } from '@/shadow/widgets/product-grid/ui/product-grid';

type ShadowProductDetailPageProps = {
  data: ShadowProductDetailPageData;
  dictionary: ShadowDictionary;
  locale: ShadowLocale;
};

/**
 * Renders the complete product detail page.
 *
 * @param props - Product detail data, dictionary copy, and active locale.
 * @returns A localized product detail surface.
 */
export function ShadowProductDetailPage(props: ShadowProductDetailPageProps) {
  const { data, dictionary, locale } = props;

  if (!data.product) {
    return null;
  }

  const product = data.product;
  const productName = getShadowLocalizedText(product.name, locale);
  const shortDescription = getShadowLocalizedText(product.shortDescription, locale);
  const description = getShadowLocalizedText(product.description, locale);
  const features = getShadowLocalizedList(product.features, locale);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8">
      <Link className="text-sm font-medium text-muted-foreground hover:text-gray-950" href={`/shadow/${locale}/products`}>
        {dictionary.productDetail.backToProducts}
      </Link>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-white">
            {product.imageUrl ? (
              <Image
                alt={productName}
                className="object-contain p-8"
                fill
                priority
                sizes="(max-width: 1024px) 92vw, 52vw"
                src={product.imageUrl}
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
                {dictionary.productDetail.noImage}
              </div>
            )}
          </div>

          {product.imageUrlVariations.length > 0 ? (
            <div className="grid grid-cols-4 gap-3">
              {product.imageUrlVariations.map(function renderProductImage(imageUrl, index) {
                return (
                  <div key={imageUrl} className="relative aspect-square overflow-hidden rounded-lg border bg-white">
                    <Image
                      alt={`${productName} ${dictionary.productDetail.viewLabel} ${index + 1}`}
                      className="object-contain p-3"
                      fill
                      sizes="(max-width: 640px) 22vw, 120px"
                      src={imageUrl}
                      unoptimized
                    />
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {dictionary.productDetail.eyebrow}
            </p>
            <h1 className="text-3xl font-semibold text-gray-950 sm:text-4xl">{productName}</h1>
            <p className="text-lg leading-7 text-muted-foreground">{shortDescription}</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-y py-5">
            <p className="text-3xl font-semibold text-gray-950">${product.price.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">
              {dictionary.productDetail.ratingLabel
                .replace('{rating}', product.rating.toFixed(1))
                .replace('{count}', String(product.reviewsCount))}
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-950">{dictionary.productDetail.descriptionTitle}</h2>
            <p className="leading-7 text-muted-foreground">{description}</p>
          </div>

          {product.colors.length > 0 ? (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-950">{dictionary.productDetail.colorsTitle}</h2>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(function renderColor(color) {
                  return (
                    <span key={color} className="rounded-md border bg-white px-3 py-1 text-sm text-gray-700">
                      {color}
                    </span>
                  );
                })}
              </div>
            </div>
          ) : null}

          {features.length > 0 ? (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-950">{dictionary.productDetail.featuresTitle}</h2>
              <ul className="space-y-2">
                {features.map(function renderFeature(feature) {
                  return (
                    <li key={feature} className="flex gap-2 text-sm leading-6 text-muted-foreground">
                      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-950" />
                      <span>{feature}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <ShadowProductGrid
        emptyState={dictionary.productDetail.relatedEmptyState}
        locale={locale}
        products={data.relatedProducts}
        title={dictionary.productDetail.relatedTitle}
      />
    </main>
  );
}
