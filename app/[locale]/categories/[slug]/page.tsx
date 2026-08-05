/**
 * Category Route
 *
 * Purpose: Thin App Router entry for one category page.
 * Used in: Next.js routing at /[locale]/categories/[slug]
 * Used for: Delegates server-first category composition to a view.
 */

import { CategoryView } from '@/views/category';
import { getCategoryStaticParams } from '@/entities/category/queries/category-queries';
import { APP_LOCALES } from '@/shared/i18n/config';
import { assertAppLocale } from '@/shared/i18n/lib/assert-locale';

type CategoryPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export const revalidate = 864000; // 10 days

/**
 * Prebuilds known category pages for every supported locale.
 *
 * @returns Locale/category slug combinations for static generation.
 */
export async function generateStaticParams() {
  const categoryParams = await getCategoryStaticParams();

  return APP_LOCALES.flatMap(function mapLocale(locale) {
    return categoryParams.map(function mapCategory(category) {
      return {
        locale,
        slug: category.slug,
      };
    });
  });
}

/**
 * Renders one category page.
 *
 * @param props - Locale and category slug route params from Next.js.
 * @returns The server-first category view.
 */
export default async function CategoryPage(props: CategoryPageProps) {
  const { locale: rawLocale, slug } = await props.params;
  const locale = assertAppLocale(rawLocale);

  return <CategoryView locale={locale} slug={slug} />;
}
