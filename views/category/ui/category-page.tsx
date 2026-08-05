/**
 * Category Page UI
 *
 * Purpose: Renders one localized server-first category page.
 * Used in: views/category/index.tsx
 * Used for: Displays a DB-backed category product grid without client fetching.
 */

import type { AppDictionary } from '@/shared/i18n/model/dictionary';
import type { AppLocale } from '@/shared/i18n/config';
import { getLocalizedText } from '@/shared/i18n/lib/get-localized-text';
import type { CategoryPageData } from '@/views/category/queries/get-category-page-data';
import { ProductGrid } from '@/widgets/product-grid/ui/product-grid';

type CategoryPageProps = {
  data: CategoryPageData;
  dictionary: AppDictionary;
  locale: AppLocale;
};

/**
 * Renders the complete category page.
 *
 * @param props - Category page data, dictionary copy, and active locale.
 * @returns A localized category product listing.
 */
export function CategoryPage(props: CategoryPageProps) {
  const { data, dictionary, locale } = props;

  if (!data.category) {
    return null;
  }

  const categoryName = getLocalizedText(data.category.name, locale);
  const categoryDescription = data.category.description
    ? getLocalizedText(data.category.description, locale)
    : dictionary.category.description;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{dictionary.category.eyebrow}</p>
        <h1 className="text-3xl font-semibold text-gray-950">{categoryName}</h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground">{categoryDescription}</p>
        <p className="text-sm text-muted-foreground">
          {dictionary.category.resultCount.replace('{count}', String(data.products.length))}
        </p>
      </section>
      <ProductGrid
        emptyState={dictionary.category.emptyState}
        locale={locale}
        products={data.products}
        title={dictionary.category.gridTitle}
      />
    </main>
  );
}
