/**
 * Mobile Category Showcase
 *
 * Purpose: Displays category title, CTA, and scrollable linked products.
 * Used in: widgets/category-showcase/ui/category-showcase.tsx
 */

import Image from 'next/image';
import { AssistantAwareLink } from '@/features/ai-assistant/navigation';
import type { Category } from '@/entities/category/model/category';
import type { Product } from '@/entities/product/model/product';
import type { AppLocale } from '@/shared/i18n/config';
import { getLocalizedText } from '@/shared/i18n/lib/get-localized-text';

type Props = {
  category: Category;
  categoryImage?: string;
  locale: AppLocale;
  products: Product[];
};

export function CategoryShowcaseMobile({ category, categoryImage, locale, products }: Props) {
  const categoryName = getLocalizedText(category.name, locale);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {categoryImage ? <Image alt="" className="-scale-x-100 size-10 object-cover" height={40} src={categoryImage} width={40} /> : null}
          <h2 id={`category-${category.id}`} className="text-2xl text-foreground">
            {categoryName}
          </h2>
        </div>
        <AssistantAwareLink className="shrink-0 bg-foreground px-3 py-2 font-button text-xs text-background" href={`/${locale}/categories/${category.slug}`}>
          View all
        </AssistantAwareLink>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-1">
        {products.map(function renderProduct(product) {
          const name = getLocalizedText(product.name, locale);
          const image = product.imageUrl ?? product.imageUrlVariations[0];

          return (
            <AssistantAwareLink className="w-24 flex-none space-y-2 text-center" href={`/${locale}/products/${product.slug}`} key={product.id}>
              <div className="relative aspect-square bg-secondary">
                {image ? <Image alt={name} className="object-cover" fill sizes="96px" src={image} /> : null}
              </div>
              <span className="block line-clamp-2 font-button text-xs text-foreground">{name}</span>
            </AssistantAwareLink>
          );
        })}
      </div>
    </div>
  );
}
