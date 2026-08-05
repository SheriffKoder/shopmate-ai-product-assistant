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
import { HomeHero } from '@/widgets/home-hero/ui/home-hero';
import { ProductGrid } from '@/widgets/product-grid/ui/product-grid';

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
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <HomeHero
        actionLabel={dictionary.home.heroAction}
        description={dictionary.home.description}
        eyebrow={dictionary.home.eyebrow}
        locale={locale}
        title={dictionary.home.title}
      />
      <CategoryNav categories={data.categories} locale={locale} title={dictionary.home.categoriesTitle} />
      <ProductGrid
        emptyState={dictionary.home.emptyState}
        locale={locale}
        products={data.featuredProducts}
        title={dictionary.home.featuredTitle}
      />
      <ProductGrid
        emptyState={dictionary.home.emptyState}
        locale={locale}
        products={data.latestProducts}
        title={dictionary.home.latestTitle}
      />
    </main>
  );
}
