/**
 * Category View
 *
 * Purpose: Server-first composition surface for one category route.
 * Used in: app/[locale]/categories/[slug]/page.tsx
 * Used for: Loads localized copy and DB-backed products for one category.
 */

import { notFound } from 'next/navigation';
import type { AppLocale } from '@/shared/i18n/config';
import { getDictionary } from '@/shared/i18n/lib/get-dictionary';
import { getCategoryPageData } from '@/views/category/queries/get-category-page-data';
import { CategoryPage } from '@/views/category/ui/category-page';

type CategoryViewProps = {
  locale: AppLocale;
  slug: string;
};

/**
 * Renders one category view.
 *
 * @param props - Active locale and category slug for catalog queries.
 * @returns A server-rendered category page.
 */
export async function CategoryView(props: CategoryViewProps) {
  const { locale, slug } = props;
  const dictionary = getDictionary(locale);
  const data = await getCategoryPageData(slug);

  if (!data.category) {
    notFound();
  }

  return <CategoryPage data={data} dictionary={dictionary} locale={locale} />;
}
