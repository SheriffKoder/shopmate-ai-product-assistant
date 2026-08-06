/**
 * Categories View
 *
 * Purpose: Server-first composition for the categories landing page.
 * Used in: app/[locale]/categories/page.tsx
 */

import type { AppLocale } from '@/shared/i18n/config';
import { getDictionary } from '@/shared/i18n/lib/get-dictionary';
import { getCategoriesPageData } from '@/views/categories/queries/get-categories-page-data';
import { CategoriesPage } from '@/views/categories/ui/categories-page';

export async function CategoriesView({ locale }: { locale: AppLocale }) {
  const [dictionary, data] = await Promise.all([getDictionary(locale), getCategoriesPageData()]);

  return <CategoriesPage data={data} locale={locale} title={dictionary.home.categoriesTitle} />;
}
