/**
 * Shadow Product Card Widget
 *
 * Purpose: Renders a localized product summary card from server data.
 * Used in: shadow/widgets/product-grid/ui/product-grid.tsx
 * Used for: Links public catalog cards to server-rendered product detail pages.
 */

import Image from 'next/image';
import Link from 'next/link';
import type { ShadowProduct } from '@/shadow/entities/product/model/product';
import type { ShadowLocale } from '@/shadow/shared/i18n/config';
import { getShadowLocalizedText } from '@/shadow/shared/i18n/lib/get-localized-text';

type ShadowProductCardProps = {
  locale: ShadowLocale;
  product: ShadowProduct;
};

/**
 * Renders a product card with localized text.
 *
 * @param props - Product and active locale.
 * @returns A linked product summary card.
 */
export function ShadowProductCard(props: ShadowProductCardProps) {
  const { locale, product } = props;
  const productName = getShadowLocalizedText(product.name, locale);
  const productDescription = getShadowLocalizedText(product.shortDescription, locale);

  return (
    <Link
      className="group flex h-full flex-col rounded-lg border bg-white p-4 shadow-sm transition-colors hover:border-gray-400"
      href={`/shadow/${locale}/products/${product.slug}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-gray-100">
        {product.imageUrl ? (
          <Image
            alt={productName}
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
            src={product.imageUrl}
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
            {productName}
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-1 flex-col">
        <h3 className="line-clamp-2 text-base font-semibold text-gray-950">{productName}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{productDescription}</p>
        <div className="mt-auto pt-4 text-lg font-semibold text-gray-950">${product.price.toFixed(2)}</div>
      </div>
    </Link>
  );
}
