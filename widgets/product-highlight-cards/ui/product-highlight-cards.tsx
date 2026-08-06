/**
 * Product Highlight Cards
 *
 * Purpose: Renders compact product cards using gallery images, ratings, colors, and features.
 * Used in: views/home/ui/home-page.tsx
 */

'use client';

import Image from 'next/image';
import { Star } from 'lucide-react';

import type { Product as EntityProduct } from '@/entities/product/model/product';
import { AssistantAwareLink } from '@/features/ai-assistant/navigation';
import type { Product as CartProduct } from '@/features/catalog/model/product';
import type { AppLocale } from '@/shared/i18n/config';
import { getLocalizedText } from '@/shared/i18n/lib/get-localized-text';
import { ProductCartAction } from '@/widgets/product-highlight-cards/ui/product-cart-action';

type ProductHighlightCardsProps = {
  locale: AppLocale;
  products: EntityProduct[];
  title?: string;
};

/**
 * Renders the top-rated product card section.
 */
export function ProductHighlightCards({ locale, products, title }: ProductHighlightCardsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="product-highlights-title" className="space-y-6">
      <h2 id="product-highlights-title" className="text-3xl text-foreground sm:text-4xl">
        {title}
      </h2>
      <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map(function renderCard(product) {
          return <ProductHighlightCard key={product.id} locale={locale} product={product} />;
        })}
      </div>
    </section>
  );
}

type ProductHighlightCardProps = {
  locale: AppLocale;
  product: EntityProduct;
};

/**
 * Renders one product highlight card with cart and detail actions.
 */
function ProductHighlightCard({ locale, product }: ProductHighlightCardProps) {
  const name = getLocalizedText(product.name, locale);
  const localizedFeatures = product.features[locale];
  const gallery = [product.imageUrl, ...product.imageUrlVariations].filter(
    function keepImages(image): image is string {
      return Boolean(image);
    },
  );
  const cartProduct = createCartProduct(product, locale);

  return (
    <article className="relative h-fit self-start overflow-hidden">
      <div className="relative">
        {gallery[0] ? (
        <AssistantAwareLink
          className="block cursor-pointer"
          href={`/${locale}/products/${product.slug}`}
        >
        <div className="relative w-full">
          <Image
            alt={name}
            className="block h-auto w-full object-cover"
            height={0}
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            src={gallery[0]}
            style={{ height: 'auto', width: '100%' }}
            width={0}
          />
        </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-foreground via-foreground to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-4 pt-24 text-background sm:px-5 sm:pb-5">
        <h3 className="text-xl">{name}</h3>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="bg-foreground px-2 py-1 font-button text-[10px] uppercase text-background">
            <Star aria-hidden="true" className="mr-1 inline size-3 fill-current stroke-2" />
            {product.rating}
          </span>
          <span className="bg-foreground px-2 py-1 font-button text-[10px] text-background">
            {product.reviewsCount.toLocaleString()} reviews
          </span>
          {product.colors.length > 0 ? (
            <span className="bg-foreground px-2 py-1 font-button text-[10px] text-background">
              {product.colors.length} {product.colors.length === 1 ? 'color' : 'colors'}
            </span>
          ) : null}
          {localizedFeatures.slice(0, 1).map(function renderFeature(feature) {
            return (
              <span className="bg-foreground px-2 py-1 font-button text-[10px] text-background" key={feature}>
                {feature}
              </span>
            );
          })}
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-background/80">
          {getLocalizedText(product.shortDescription, locale)}
        </p>

      </div>
        </AssistantAwareLink>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pl-1 pb-4 pt-2 text-background">
        <div>
          <span className="text-lg text-foreground">${product.price.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2">
          <ProductCartAction cartProduct={cartProduct} name={name} />
          <AssistantAwareLink
            className="px-4 py-2 font-button text-xs text-background bg-foreground"
            href={`/${locale}/products/${product.slug}`}
          >
            View
          </AssistantAwareLink>
        </div>
      </div>
    </article>
  );
}

/**
 * Adapts the server catalog product to the legacy cart product contract.
 */
function createCartProduct(product: EntityProduct, locale: AppLocale): CartProduct {
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
