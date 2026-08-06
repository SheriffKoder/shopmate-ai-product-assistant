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
import { getCategory } from '@/entities/category/queries/category-queries';
import { getLocalizedText } from '@/shared/i18n/lib/get-localized-text';
import { createPageMetadata } from '@/shared/seo/metadata';
import type { Metadata } from 'next';
import { StructuredData } from '@/shared/seo/ui/structured-data';
import { getLocalizedUrl } from '@/shared/seo/config';

type CategoryPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export const revalidate = 864000; // 10 days

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = assertAppLocale(rawLocale);
  const category = await getCategory({ slug });

  if (!category) return { title: 'Category not found' };

  return createPageMetadata({
    locale,
    pathname: `/categories/${category.slug}`,
    title: getLocalizedText(category.name, locale),
    description: category.description ? getLocalizedText(category.description, locale) : 'Browse products in this category.',
  });
}

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

  const category = await getCategory({ slug });
  const categoryName = category ? getLocalizedText(category.name, locale) : 'Category';

  return (
    <>
      <StructuredData data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Categories', item: getLocalizedUrl(locale, '/categories') },
        { '@type': 'ListItem', position: 2, name: categoryName, item: getLocalizedUrl(locale, `/categories/${slug}`) },
      ] }} />
      <CategoryView locale={locale} slug={slug} />
    </>
  );
}
