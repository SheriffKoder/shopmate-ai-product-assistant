/**
 * Category Page UI
 *
 * Purpose: Renders one localized server-first category page.
 * Used in: views/category/index.tsx
 * Used for: Displays a DB-backed category product grid without client fetching.
 */

import { AssistantAwareLink } from '@/features/ai-assistant/navigation';
import type { AppDictionary } from '@/shared/i18n/model/dictionary';
import type { AppLocale } from '@/shared/i18n/config';
import { getLocalizedText } from '@/shared/i18n/lib/get-localized-text';
import type { CategoryPageData } from '@/views/category/queries/get-category-page-data';
import { ProductHighlightCards } from '@/widgets/product-highlight-cards/ui/product-highlight-cards';
import { ProductPagination } from '@/widgets/product-pagination/ui/product-pagination';

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
    <main className="flex min-h-screen w-full flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl text-foreground sm:text-4xl">{categoryName}</h1>
          <p className="hidden truncate text-base text-muted-foreground md:block">{categoryDescription}</p>
        </div>
        {data.categories.length > 0 ? (
          <nav aria-label={dictionary.products.categoryNavLabel} className="flex flex-wrap gap-2 md:justify-end">
            {data.categories.map(function renderCategoryLink(category) {
              const name = getLocalizedText(category.name, locale);

              return (
                <AssistantAwareLink
                  className="bg-secondary px-3 py-2 font-button text-sm text-foreground transition-colors hover:bg-primary"
                  href={`/${locale}/categories/${category.slug}`}
                  key={category.id}
                >
                  {name}
                </AssistantAwareLink>
              );
            })}
          </nav>
        ) : null}
      </section>
      {data.products.length > 0 ? (
        <ProductHighlightCards locale={locale} products={data.products} title={dictionary.category.gridTitle} />
      ) : (
        <p className="text-muted-foreground">{dictionary.category.emptyState}</p>
      )}
      <ProductPagination />
    </main>
  );
}
