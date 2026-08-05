/**
 * Shadow Home Page UI
 *
 * Purpose: Composes the localized server-first home page sections.
 * Used in: views/home/index.tsx
 * Used for: Keeps route composition small while rendering ready-to-use catalog data.
 */

import type { ShadowHomePageData } from '@/views/home/queries/get-home-page-data';
import type { ShadowDictionary } from '@/shared/i18n/model/dictionary';
import type { ShadowLocale } from '@/shared/i18n/config';
import { ShadowCategoryNav } from '@/widgets/category-nav/ui/category-nav';
import { ShadowHomeHero } from '@/widgets/home-hero/ui/home-hero';
import { ShadowProductGrid } from '@/widgets/product-grid/ui/product-grid';

type ShadowHomePageProps = {
  data: ShadowHomePageData;
  dictionary: ShadowDictionary;
  locale: ShadowLocale;
};

/**
 * Renders all home page sections from server data.
 *
 * @param props - Catalog data, dictionary copy, and active locale.
 * @returns A complete localized home page.
 */
export function ShadowHomePage(props: ShadowHomePageProps) {
  const { data, dictionary, locale } = props;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <ShadowHomeHero
        actionLabel={dictionary.home.heroAction}
        description={dictionary.home.description}
        eyebrow={dictionary.home.eyebrow}
        locale={locale}
        title={dictionary.home.title}
      />
      <ShadowCategoryNav categories={data.categories} locale={locale} title={dictionary.home.categoriesTitle} />
      <ShadowProductGrid
        emptyState={dictionary.home.emptyState}
        locale={locale}
        products={data.featuredProducts}
        title={dictionary.home.featuredTitle}
      />
      <ShadowProductGrid
        emptyState={dictionary.home.emptyState}
        locale={locale}
        products={data.latestProducts}
        title={dictionary.home.latestTitle}
      />
    </main>
  );
}
