/**
 * Category Showcase
 *
 * Purpose: Composes responsive category product presentation variants.
 * Used in: views/categories/ui/categories-page.tsx
 */

import type { Category } from '@/entities/category/model/category';
import type { Product } from '@/entities/product/model/product';
import type { AppLocale } from '@/shared/i18n/config';
import { CategoryShowcaseDesktop } from '@/widgets/category-showcase/ui/category-showcase-desktop';
import { CategoryShowcaseMobile } from '@/widgets/category-showcase/ui/category-showcase-mobile';

const categoryImages: Record<string, string> = {
  headphones: '/images/categories/headphones.png',
  laptop: '/images/categories/laptops.png',
  smartphone: '/images/categories/phones.png',
  smartwatch: '/images/categories/smartwatches.png',
  tablet: '/images/categories/tablets.png',
};

type CategoryShowcaseProps = {
  category: Category;
  locale: AppLocale;
  products: Product[];
};

export function CategoryShowcase({ category, locale, products }: CategoryShowcaseProps) {
  const categoryImage = categoryImages[category.slug.toLowerCase()];

  return (
    <section aria-labelledby={`category-${category.id}`} className="border-t border-foreground/10 pt-6">
      <div className="md:hidden">
        <CategoryShowcaseMobile category={category} categoryImage={categoryImage} locale={locale} products={products} />
      </div>
      <div className="hidden md:block">
        <CategoryShowcaseDesktop category={category} categoryImage={categoryImage} locale={locale} products={products} />
      </div>
    </section>
  );
}
