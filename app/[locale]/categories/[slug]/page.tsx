/**
 * Shadow Category Route
 *
 * Purpose: Thin App Router entry for one shadow category page.
 * Used in: Next.js routing at /[locale]/categories/[slug]
 * Used for: Delegates server-first category composition to a shadow view.
 */

import { ShadowCategoryView } from '@/views/category';
import { getShadowCategoryStaticParams } from '@/entities/category/queries/category-queries';
import { SHADOW_PUBLIC_PAGE_REVALIDATE_SECONDS } from '@/shared/config/cache';
import { SHADOW_LOCALES } from '@/shared/i18n/config';
import { assertShadowLocale } from '@/shared/i18n/lib/assert-locale';

type ShadowCategoryPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export const revalidate = SHADOW_PUBLIC_PAGE_REVALIDATE_SECONDS;

/**
 * Prebuilds known shadow category pages for every supported locale.
 *
 * @returns Locale/category slug combinations for static generation.
 */
export async function generateStaticParams() {
  const categoryParams = await getShadowCategoryStaticParams();

  return SHADOW_LOCALES.flatMap(function mapLocale(locale) {
    return categoryParams.map(function mapCategory(category) {
      return {
        locale,
        slug: category.slug,
      };
    });
  });
}

/**
 * Renders one shadow category page.
 *
 * @param props - Locale and category slug route params from Next.js.
 * @returns The server-first shadow category view.
 */
export default async function ShadowCategoryPage(props: ShadowCategoryPageProps) {
  const { locale: rawLocale, slug } = await props.params;
  const locale = assertShadowLocale(rawLocale);

  return <ShadowCategoryView locale={locale} slug={slug} />;
}
