/**
 * Home Page UI
 *
 * Purpose: Composes the localized server-first home page sections.
 * Used in: views/home/index.tsx
 * Used for: Keeps route composition small while rendering ready-to-use catalog data.
 */

import type { HomePageData } from '@/views/home/queries/get-home-page-data';
import type { AppDictionary } from '@/shared/i18n/model/dictionary';
import type { AppLocale } from '@/shared/i18n/config';
import { CategoryNav } from '@/widgets/category-nav/ui/category-nav';
import { FeaturedProducts } from '@/widgets/featured-products/ui/featured-products';
import { ProductHighlightCards } from '@/widgets/product-highlight-cards/ui/product-highlight-cards';
import { RecentlyViewed } from '@/widgets/recently-viewed/ui/recently-viewed';

type HomePageProps = {
  data: HomePageData;
  dictionary: AppDictionary;
  locale: AppLocale;
};

/**
 * Renders all home page sections from server data.
 *
 * @param props - Catalog data, dictionary copy, and active locale.
 * @returns A complete localized home page.
 */
export function HomePage(props: HomePageProps) {
  const { data, dictionary, locale } = props;

  return (
    <main className="mx-auto flex min-h-screen w-full flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <CategoryNav categories={data.categories} locale={locale} title={dictionary.home.categoriesTitle} />
      <FeaturedProducts
        actionLabel={dictionary.home.featuredAction}
        emptyState={dictionary.home.emptyState}
        locale={locale}
        products={data.featuredProducts}
        title={dictionary.home.featuredTitle}
      />
      <ProductHighlightCards locale={locale} products={data.latestProducts} title={dictionary.home.latestTitle} />
      <RecentlyViewed locale={locale} products={data.products} />
    </main>
  );
}
