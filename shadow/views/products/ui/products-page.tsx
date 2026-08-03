/**
 * Shadow Products Page UI
 *
 * Purpose: Renders the localized server-first products listing page.
 * Used in: shadow/views/products/index.tsx
 * Used for: Displays server-provided products without client or URL filtering.
 */

import Link from 'next/link';
import type { ShadowDictionary } from '@/shadow/shared/i18n/model/dictionary';
import type { ShadowLocale } from '@/shadow/shared/i18n/config';
import { getShadowLocalizedText } from '@/shadow/shared/i18n/lib/get-localized-text';
import { getShadowProductsResultCountLabel } from '@/shadow/views/products/lib/get-products-result-count-label';
import type { ShadowProductsPageData } from '@/shadow/views/products/queries/get-products-page-data';
import { ShadowProductGrid } from '@/shadow/widgets/product-grid/ui/product-grid';

type ShadowProductsPageProps = {
  data: ShadowProductsPageData;
  dictionary: ShadowDictionary;
  locale: ShadowLocale;
};

/**
 * Renders the complete products listing page.
 *
 * @param props - Products page data, dictionary copy, and active locale.
 * @returns A localized server-rendered products listing.
 */
export function ShadowProductsPage(props: ShadowProductsPageProps) {
  const { data, dictionary, locale } = props;
  const resultCountLabel = getShadowProductsResultCountLabel(dictionary, data.products.length);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {dictionary.products.eyebrow}
        </p>
        <h1 className="text-3xl font-semibold text-gray-950">{dictionary.products.title}</h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground">{dictionary.products.description}</p>
        <p className="text-sm text-muted-foreground">{resultCountLabel}</p>
      </section>
      {data.categories.length > 0 ? (
        <nav aria-label={dictionary.products.categoryNavLabel} className="flex flex-wrap gap-2">
          {data.categories.map(function renderCategoryFilter(category) {
            const categoryName = getShadowLocalizedText(category.name, locale);

            return (
              <Link
                className="rounded-md border bg-white px-3 py-2 text-sm font-medium text-gray-950 hover:border-gray-400"
                href={`/shadow/${locale}/categories/${category.slug}`}
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
