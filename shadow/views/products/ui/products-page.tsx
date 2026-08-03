/**
 * Shadow Products Page UI
 *
 * Purpose: Renders the localized server-first products listing page.
 * Used in: shadow/views/products/index.tsx
 * Used for: Displays server-provided product grids and filter context.
 */

import Link from 'next/link';
import type { ShadowDictionary } from '@/shadow/shared/i18n/model/dictionary';
import type { ShadowLocale } from '@/shadow/shared/i18n/config';
import { getShadowLocalizedText } from '@/shadow/shared/i18n/lib/get-localized-text';
import type { ShadowProductsPageData } from '@/shadow/views/products/queries/get-products-page-data';
import { ShadowProductGrid } from '@/shadow/widgets/product-grid/ui/product-grid';

type ShadowProductsPageProps = {
  data: ShadowProductsPageData;
  dictionary: ShadowDictionary;
  locale: ShadowLocale;
};

/**
 * Builds the localized products listing heading.
 *
 * @param data - Products page data with active filters.
 * @param dictionary - Localized page copy.
 * @param locale - Active locale.
 * @returns Page title for the current filter state.
 */
function getShadowProductsHeading(data: ShadowProductsPageData, dictionary: ShadowDictionary, locale: ShadowLocale) {
  const activeCategory = data.categories.find(function findActiveCategory(category) {
    return category.slug.toLowerCase() === data.filters.category?.toLowerCase();
  });
  const categoryName = activeCategory ? getShadowLocalizedText(activeCategory.name, locale) : data.filters.category;

  if (categoryName && data.filters.search) {
    return dictionary.products.filteredByCategoryAndSearch
      .replace('{category}', categoryName)
      .replace('{search}', data.filters.search);
  }

  if (categoryName) {
    return dictionary.products.filteredByCategory.replace('{category}', categoryName);
  }

  if (data.filters.search) {
    return dictionary.products.filteredBySearch.replace('{search}', data.filters.search);
  }

  return dictionary.products.title;
}

/**
 * Renders the complete products listing page.
 *
 * @param props - Products page data, dictionary copy, and active locale.
 * @returns A localized server-rendered products listing.
 */
export function ShadowProductsPage(props: ShadowProductsPageProps) {
  const { data, dictionary, locale } = props;
  const heading = getShadowProductsHeading(data, dictionary, locale);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {dictionary.products.eyebrow}
        </p>
        <h1 className="text-3xl font-semibold text-gray-950">{heading}</h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground">{dictionary.products.description}</p>
        <p className="text-sm text-muted-foreground">
          {dictionary.products.resultCount.replace('{count}', String(data.products.length))}
        </p>
      </section>
      {data.categories.length > 0 ? (
        <nav aria-label={dictionary.products.categoryFilterLabel} className="flex flex-wrap gap-2">
          <Link
            className="rounded-md border bg-white px-3 py-2 text-sm font-medium text-gray-950 hover:border-gray-400"
            href={`/shadow/${locale}/products`}
          >
            {dictionary.products.allCategories}
          </Link>
          {data.categories.map(function renderCategoryFilter(category) {
            const categoryName = getShadowLocalizedText(category.name, locale);

            return (
              <Link
                className="rounded-md border bg-white px-3 py-2 text-sm font-medium text-gray-950 hover:border-gray-400"
                href={`/shadow/${locale}/products?category=${encodeURIComponent(category.slug)}`}
                key={category.id}
              >
                {categoryName}
              </Link>
            );
          })}
        </nav>
      ) : null}
      <ShadowProductGrid
        emptyState={dictionary.products.emptyState}
        locale={locale}
        products={data.products}
        title={dictionary.products.gridTitle}
      />
    </main>
  );
}
