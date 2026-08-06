/**
 * Products Page UI
 *
 * Purpose: Renders the localized server-first products listing page.
 * Used in: views/products/index.tsx
 * Used for: Displays server-provided products without client or URL filtering.
 */

import { AssistantAwareLink } from '@/features/ai-assistant/navigation';
import type { AppDictionary } from '@/shared/i18n/model/dictionary';
import type { AppLocale } from '@/shared/i18n/config';
import { getLocalizedText } from '@/shared/i18n/lib/get-localized-text';
import type { ProductsPageData } from '@/views/products/queries/get-products-page-data';
import { ProductHighlightCards } from '@/widgets/product-highlight-cards/ui/product-highlight-cards';
import { ProductPagination } from '@/widgets/product-pagination/ui/product-pagination';

type ProductsPageProps = {
  data: ProductsPageData;
  dictionary: AppDictionary;
  locale: AppLocale;
};

/**
 * Renders the complete products listing page.
 *
 * @param props - Products page data, dictionary copy, and active locale.
 * @returns A localized server-rendered products listing.
 */
export function ProductsPage(props: ProductsPageProps) {
  const { data, dictionary, locale } = props;

  return (
    <main className="flex min-h-screen w-full flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl text-foreground sm:text-4xl">{dictionary.products.title}</h1>
          <p className="hidden truncate text-base text-muted-foreground md:block">{dictionary.products.description}</p>
        </div>
        {data.categories.length > 0 ? (
          <nav aria-label={dictionary.products.categoryNavLabel} className="flex flex-wrap gap-2 md:justify-end">
            {data.categories.map(function renderCategoryFilter(category) {
              const categoryName = getLocalizedText(category.name, locale);

              return (
                <AssistantAwareLink
                  className="bg-secondary px-3 py-2 font-button text-sm text-foreground transition-colors hover:bg-primary"
                  href={`/${locale}/categories/${category.slug}`}
                  key={category.id}
                >
                  {categoryName}
                </AssistantAwareLink>
              );
            })}
          </nav>
        ) : null}
      </section>
      {data.products.length > 0 ? (
        <ProductHighlightCards locale={locale} products={data.products} />
      ) : (
        <p className="text-muted-foreground">{dictionary.products.emptyState}</p>
      )}

      <ProductPagination />
    </main>
  );
}
