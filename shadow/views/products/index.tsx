/**
 * Shadow Products View
 *
 * Purpose: Server-first composition surface for the shadow products route.
 * Used in: app/shadow/[locale]/products/page.tsx
 * Used for: Loads localized copy and DB-backed catalog data for product listings.
 */

import type { ShadowLocale } from '@/shadow/shared/i18n/config';
import { getShadowDictionary } from '@/shadow/shared/i18n/lib/get-dictionary';
import { getShadowProductsPageData } from '@/shadow/views/products/queries/get-products-page-data';
import { ShadowProductsPage } from '@/shadow/views/products/ui/products-page';

type ShadowProductsViewProps = {
  locale: ShadowLocale;
};

/**
 * Renders the shadow products listing view.
 *
 * @param props - Active locale for localized products rendering.
 * @returns A server-rendered products page.
 */
export async function ShadowProductsView(props: ShadowProductsViewProps) {
  const { locale } = props;
  const dictionary = getShadowDictionary(locale);
  const data = await getShadowProductsPageData();

  return <ShadowProductsPage data={data} dictionary={dictionary} locale={locale} />;
}
