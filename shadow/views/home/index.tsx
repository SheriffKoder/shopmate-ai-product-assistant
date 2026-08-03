/**
 * Shadow Home View
 *
 * Purpose: Server-first composition surface for the shadow home route.
 * Used in: app/shadow/[locale]/page.tsx
 * Used for: Holds the phase-0 home placeholder until catalog queries are added.
 */

import type { ShadowLocale } from '@/shadow/shared/i18n/config';
import { getShadowDictionary } from '@/shadow/shared/i18n/lib/get-dictionary';

type ShadowHomeViewProps = {
  locale: ShadowLocale;
};

/**
 * Renders the shadow home view placeholder.
 *
 * @param props - Active locale for localized copy and future catalog queries.
 * @returns A server-rendered home placeholder.
 */
export function ShadowHomeView(props: ShadowHomeViewProps) {
  const { locale } = props;
  const dictionary = getShadowDictionary(locale);

  return (
    <main className="min-h-screen p-6">
      <p className="text-sm font-medium uppercase text-muted-foreground">{dictionary.home.eyebrow}</p>
      <h1 className="mt-2 text-3xl font-semibold">{dictionary.home.title}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{dictionary.home.description}</p>
    </main>
  );
}
