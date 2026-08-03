/**
 * Shadow Category Route
 *
 * Purpose: Thin App Router entry for one shadow category page.
 * Used in: Next.js routing at /shadow/[locale]/categories/[slug]
 * Used for: Delegates server-first category composition to a shadow view.
 */

import { ShadowCategoryView } from '@/shadow/views/category';
import { assertShadowLocale } from '@/shadow/shared/i18n/lib/assert-locale';

type ShadowCategoryPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

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
