/**
 * Desktop Category Showcase
 *
 * Purpose: Displays category icon alongside linked product cards and details.
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

export function CategoryShowcaseDesktop({ category, categoryImage, locale, products }: Props) {
  const categoryName = getLocalizedText(category.name, locale);
  const description = category.description ? getLocalizedText(category.description, locale) : '';

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <div className="relative aspect-[4/3] overflow-hidden bg-primary">
        {categoryImage ? <Image alt={categoryName} className="-scale-x-100 object-cover" fill sizes="(max-width: 1024px) 50vw, 50vw" src={categoryImage} /> : null}
      </div>
      <div className="space-y-6 lg:self-start">
        <div className="flex gap-4 overflow-x-auto pb-1">
          {products.map(function renderProduct(product) {
            return <ProductTile key={product.id} locale={locale} product={product} />;
          })}
        </div>
        <div className="space-y-4">
          <h2 id={`category-${category.id}`} className="text-2xl text-foreground sm:text-3xl">
            {categoryName}
          </h2>
          {description ? <p className="max-w-xl text-sm leading-6 text-muted-foreground">{description}</p> : null}
          <AssistantAwareLink
            className="inline-flex bg-foreground px-5 py-3 font-button text-sm text-background"
            href={`/${locale}/categories/${category.slug}`}
          >
            Explore {categoryName}
          </AssistantAwareLink>
        </div>
      </div>
    </div>
  );
}

function ProductTile({ locale, product }: { locale: AppLocale; product: Product }) {
  const name = getLocalizedText(product.name, locale);
  const image = product.imageUrl ?? product.imageUrlVariations[0];

  return (
    <AssistantAwareLink className="w-42 flex-none space-y-2 text-center" href={`/${locale}/products/${product.slug}`}>
      <div className="relative aspect-square bg-secondary">
        {image ? <Image alt={name} className="object-cover" fill sizes="112px" src={image} /> : null}
      </div>
      <span className="block line-clamp-2 font-button text-xs text-foreground">{name}</span>
    </AssistantAwareLink>
  );
}
