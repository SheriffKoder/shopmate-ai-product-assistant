/**
 * Shadow Products Route
 *
 * Purpose: Thin App Router entry for the shadow products listing.
 * Used in: Next.js routing at /shadow/[locale]/products
 * Used for: Delegates server-first product listing composition to a shadow view.
 */

import { ShadowProductsView } from '@/shadow/views/products';
import { assertShadowLocale } from '@/shadow/shared/i18n/lib/assert-locale';
import { SHADOW_PUBLIC_PAGE_REVALIDATE_SECONDS } from '@/shadow/shared/config/cache';

type ShadowProductsPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const revalidate = SHADOW_PUBLIC_PAGE_REVALIDATE_SECONDS;

/**
 * Renders the shadow products listing page.
 *
 * @param props - Locale route params from Next.js.
 * @returns The server-first shadow products view.
 */
export default async function ShadowProductsPage(props: ShadowProductsPageProps) {
  const { locale: rawLocale } = await props.params;
  const searchParams = await props.searchParams;
  const locale = assertShadowLocale(rawLocale);

  return <ShadowProductsView locale={locale} searchParams={searchParams} />;
}
