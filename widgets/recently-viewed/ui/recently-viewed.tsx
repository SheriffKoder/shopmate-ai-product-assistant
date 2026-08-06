/**
 * Recently Viewed
 *
 * Purpose: Presents the catalog in a compact, image-led home page section.
 * Used in: views/home/ui/home-page.tsx
 * Used for: Providing a lightweight closing discovery row until view history is available.
 */

import type { Product } from '@/entities/product/model/product';
import type { AppLocale } from '@/shared/i18n/config';
import { getLocalizedText } from '@/shared/i18n/lib/get-localized-text';

type RecentlyViewedProps = {
  locale: AppLocale;
  products: Product[];
};

/**
 * Renders all available products as compact recently viewed tiles.
 *
 * @param props - Active locale and catalog products.
 * @returns A responsive horizontal product row.
 */
export function RecentlyViewed({ locale, products }: RecentlyViewedProps) {
  return (
    <section aria-labelledby="recently-viewed-title" className="space-y-6">
      <h2 id="recently-viewed-title" className="text-3xl text-foreground sm:text-4xl">
        Recently viewed
      </h2>

      <div className="flex gap-4 overflow-x-auto pb-2 sm:gap-6">
        {products.map(function renderProduct(product) {
          const name = getLocalizedText(product.name, locale);
          const imageUrl = product.imageUrl ?? product.imageUrlVariations[0];

          if (!imageUrl) {
            return null;
          }

          return (
            <article key={product.id} className="w-28 shrink-0 space-y-3 sm:w-32">
              <img alt={name} className="block aspect-square h-auto w-full object-cover" src={imageUrl} />
              <p className="line-clamp-2 text-center font-button text-xs font-medium text-foreground">
                {name}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
