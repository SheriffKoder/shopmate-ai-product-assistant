/**
 * Home View
 *
 * Purpose: Server-first composition surface for the home route.
 * Used in: app/[locale]/page.tsx
 * Used for: Loads localized copy and DB-backed catalog data for the home page.
 */

import type { AppLocale } from '@/shared/i18n/config';
import { getDictionary } from '@/shared/i18n/lib/get-dictionary';
import { getHomePageData } from '@/views/home/queries/get-home-page-data';
import { HomePage } from '@/views/home/ui/home-page';

type HomeViewProps = {
  locale: AppLocale;
};

/**
 * Renders the home view placeholder.
 *
 * @param props - Active locale for localized copy and future catalog queries.
 * @returns A server-rendered home page.
 */
export async function HomeView(props: HomeViewProps) {
  const { locale } = props;
  const dictionary = getDictionary(locale);
  const data = await getHomePageData();

  return <HomePage data={data} dictionary={dictionary} locale={locale} />;
}
