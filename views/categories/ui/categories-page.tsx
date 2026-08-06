/**
 * Categories Page UI
 *
 * Purpose: Renders each category as an editorial product showcase.
 * Used in: views/categories/index.tsx
 */

import type { AppLocale } from '@/shared/i18n/config';
import type { CategoriesPageData } from '@/views/categories/queries/get-categories-page-data';
import { CategoryShowcase } from '@/widgets/category-showcase/ui/category-showcase';

type CategoriesPageProps = {
  data: CategoriesPageData;
  locale: AppLocale;
  title: string;
};

export function CategoriesPage({ data, locale, title }: CategoriesPageProps) {
  return (
    <main className="flex min-h-screen w-full flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl text-foreground sm:text-4xl">{title}</h1>
      <div className="flex flex-col gap-10">
        {data.categories.map(function renderCategory(category) {
          return (
            <CategoryShowcase
              category={category}
              key={category.id}
              locale={locale}
              products={data.products.filter(function filterProduct(product) {
                return product.categorySlug === category.slug;
              })}
            />
          );
        })}
      </div>
    </main>
  );
}
