/**
 * Shadow Product Detail Route
 *
 * Purpose: Thin App Router entry for one shadow product detail page.
 * Used in: Next.js routing at /shadow/[locale]/products/[slug]
 * Used for: Delegates server-first product detail composition to a shadow view.
 */

import { ShadowProductDetailView } from '@/shadow/views/product-detail';
import { assertShadowLocale } from '@/shadow/shared/i18n/lib/assert-locale';

type ShadowProductDetailPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

/**
 * Renders one shadow product detail page.
 *
 * @param props - Locale and product slug route params from Next.js.
 * @returns The server-first shadow product detail view.
 */
export default async function ShadowProductDetailPage(props: ShadowProductDetailPageProps) {
  const { locale: rawLocale, slug } = await props.params;
  const locale = assertShadowLocale(rawLocale);

  return <ShadowProductDetailView locale={locale} slug={slug} />;
}
