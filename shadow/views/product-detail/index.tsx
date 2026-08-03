/**
 * Shadow Product Detail View
 *
 * Purpose: Composes one server-first shadow product detail route.
 * Used in: app/shadow/[locale]/products/[slug]/page.tsx
 * Used for: Loads localized dictionary and DB-backed product detail data.
 */

import { notFound } from 'next/navigation';
import type { ShadowLocale } from '@/shadow/shared/i18n/config';
import { getShadowDictionary } from '@/shadow/shared/i18n/lib/get-dictionary';
import { getShadowProductDetailPageData } from '@/shadow/views/product-detail/queries/get-product-detail-page-data';
import { ShadowProductDetailPage } from '@/shadow/views/product-detail/ui/product-detail-page';

type ShadowProductDetailViewProps = {
  locale: ShadowLocale;
  slug: string;
};

/**
 * Loads and renders a single product detail page.
 *
 * @param props - Active locale and product slug.
 * @returns A localized product detail page.
 */
export async function ShadowProductDetailView(props: ShadowProductDetailViewProps) {
  const { locale, slug } = props;
  const dictionary = getShadowDictionary(locale);
  const data = await getShadowProductDetailPageData(slug);

  if (!data.product) {
    notFound();
  }

  return <ShadowProductDetailPage data={data} dictionary={dictionary} locale={locale} />;
}
