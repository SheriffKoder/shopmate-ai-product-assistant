/**
 * Product Detail Page UI
 *
 * Purpose: Renders one localized server-first product detail page.
 * Used in: views/product-detail/index.tsx
 * Used for: Displays DB-backed product details without cart or assistant behavior.
 */

import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { AssistantAwareLink } from '@/features/ai-assistant/navigation';
import type { AppDictionary } from '@/shared/i18n/model/dictionary';
import type { Product as CartProduct } from '@/features/catalog/model/product';
import { ProductCartAction } from '@/widgets/product-highlight-cards/ui/product-cart-action';
import type { AppLocale } from '@/shared/i18n/config';
import { getLocalizedText } from '@/shared/i18n/lib/get-localized-text';
import { getLocalizedList } from '@/views/product-detail/lib/get-localized-list';
import type { ProductDetailPageData } from '@/views/product-detail/queries/get-product-detail-page-data';
import { ProductHighlightCards } from '@/widgets/product-highlight-cards/ui/product-highlight-cards';

type ProductDetailPageProps = {
  data: ProductDetailPageData;
  dictionary: AppDictionary;
  locale: AppLocale;
};

/**
 * Renders the complete product detail page.
 *
 * @param props - Product detail data, dictionary copy, and active locale.
 * @returns A localized product detail surface.
 */
export function ProductDetailPage(props: ProductDetailPageProps) {
  const { data, dictionary, locale } = props;

  if (!data.product) {
    return null;
  }

  const product = data.product;
  const productName = getLocalizedText(product.name, locale);
  const shortDescription = getLocalizedText(product.shortDescription, locale);
  const description = getLocalizedText(product.description, locale);
  const features = getLocalizedList(product.features, locale);

  return (
    <main className="flex min-h-screen w-full flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8">
      <AssistantAwareLink className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-gray-950" href={`/${locale}/products`}>
        <ArrowLeft aria-hidden="true" className="size-4 stroke-2" />
        {dictionary.productDetail.backToProducts}
      </AssistantAwareLink>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden bg-white">
            {product.imageUrl ? (
              <Image
                alt={productName}
                className="object-cover"
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
                  <div key={imageUrl} className="relative aspect-square overflow-hidden bg-white">
                    <Image
                      alt={`${productName} ${dictionary.productDetail.viewLabel} ${index + 1}`}
                      className="object-cover"
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

        <div className="space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-gray-950 sm:text-4xl">{productName}</h1>
            <p className="text-lg leading-7 text-muted-foreground">{shortDescription}</p>
            <p className="leading-7 text-muted-foreground">{description}</p>
          </div>

          <div className="divide-y divide-foreground/10">
            <DetailRow label={dictionary.productDetail.featuresTitle} value={features.join(', ') || '—'} />
            <DetailRow label={dictionary.productDetail.colorsTitle} value={product.colors.join(', ') || '—'} />
            <DetailRow label="Ratings" value={product.rating.toFixed(1)} />
            <DetailRow label="Reviews" value={product.reviewsCount.toLocaleString()} />
            <DetailRow label="Price" value={`$${product.price.toFixed(2)}`} />
          </div>

          <ProductCartAction cartProduct={createCartProduct(product, locale)} name={productName} size="large" />
        </div>
      </section>

      <div className="border-t border-foreground/10 pt-8">
        <ProductHighlightCards locale={locale} products={data.relatedProducts} title={dictionary.productDetail.relatedTitle} />
      </div>
    </main>
  );
}

function createCartProduct(product: ProductDetailPageData['product'] & {}, locale: AppLocale): CartProduct {
  return {
    id: product.id,
    name: getLocalizedText(product.name, locale),
    category: product.categorySlug,
    rating: product.rating,
    shortDescription: getLocalizedText(product.shortDescription, locale),
    description: getLocalizedText(product.description, locale),
    price: product.price,
    reviewsCount: product.reviewsCount,
    features: product.features[locale],
    image_url: product.imageUrl,
    image_url_variations: product.imageUrlVariations,
    featured: product.isFeatured,
    keywords: product.keywords,
    colors: product.colors,
  };
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-2 gap-4 py-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold text-foreground">{value}</span>
    </div>
  );
}
