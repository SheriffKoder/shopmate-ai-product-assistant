/**
 * Shadow Category View
 *
 * Purpose: Server-first composition surface for one shadow category route.
 * Used in: app/shadow/[locale]/categories/[slug]/page.tsx
 * Used for: Loads localized copy and DB-backed products for one category.
 */

import { notFound } from 'next/navigation';
import type { ShadowLocale } from '@/shadow/shared/i18n/config';
import { getShadowDictionary } from '@/shadow/shared/i18n/lib/get-dictionary';
import { getShadowCategoryPageData } from '@/shadow/views/category/queries/get-category-page-data';
import { ShadowCategoryPage } from '@/shadow/views/category/ui/category-page';

type ShadowCategoryViewProps = {
  locale: ShadowLocale;
  slug: string;
};

/**
 * Renders one shadow category view.
 *
 * @param props - Active locale and category slug for catalog queries.
 * @returns A server-rendered category page.
 */
export async function ShadowCategoryView(props: ShadowCategoryViewProps) {
  const { locale, slug } = props;
  const dictionary = getShadowDictionary(locale);
  const data = await getShadowCategoryPageData(slug);

  if (!data.category) {
    notFound();
  }

  return <ShadowCategoryPage data={data} dictionary={dictionary} locale={locale} />;
}
