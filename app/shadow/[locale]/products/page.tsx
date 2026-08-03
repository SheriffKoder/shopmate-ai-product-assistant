/**
 * Shadow Products Route
 *
 * Purpose: Thin App Router entry for the shadow products listing.
 * Used in: Next.js routing at /shadow/[locale]/products
 * Used for: Delegates server-first product listing composition to a shadow view.
 */

import { ShadowProductsView } from '@/shadow/views/products';

type ShadowProductsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

/**
 * Renders the shadow products listing page.
 *
 * @param props - Locale route params from Next.js.
 * @returns The server-first shadow products view.
 */
export default async function ShadowProductsPage(props: ShadowProductsPageProps) {
  const { locale } = await props.params;

  return <ShadowProductsView locale={locale} />;
}
