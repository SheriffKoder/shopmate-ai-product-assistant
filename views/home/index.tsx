/**
 * Shadow Home View
 *
 * Purpose: Server-first composition surface for the shadow home route.
 * Used in: app/[locale]/page.tsx
 * Used for: Loads localized copy and DB-backed catalog data for the home page.
 */

import type { ShadowLocale } from '@/shared/i18n/config';
import { getShadowDictionary } from '@/shared/i18n/lib/get-dictionary';
import { getShadowHomePageData } from '@/views/home/queries/get-home-page-data';
import { ShadowHomePage } from '@/views/home/ui/home-page';

type ShadowHomeViewProps = {
  locale: ShadowLocale;
};

/**
 * Renders the shadow home view placeholder.
 *
 * @param props - Active locale for localized copy and future catalog queries.
 * @returns A server-rendered home page.
 */
export async function ShadowHomeView(props: ShadowHomeViewProps) {
  const { locale } = props;
  const dictionary = getShadowDictionary(locale);
  const data = await getShadowHomePageData();

  return <ShadowHomePage data={data} dictionary={dictionary} locale={locale} />;
}
