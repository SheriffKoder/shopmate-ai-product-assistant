/**
 * Shadow Products View
 *
 * Purpose: Server-first composition surface for the shadow products route.
 * Used in: app/shadow/[locale]/products/page.tsx
 * Used for: Holds the phase-0 products placeholder until catalog queries are added.
 */

import type { ShadowLocale } from '@/shadow/shared/i18n/config';
import { getShadowDictionary } from '@/shadow/shared/i18n/lib/get-dictionary';

type ShadowProductsViewProps = {
  locale: ShadowLocale;
};

/**
 * Renders the shadow products listing placeholder.
 *
 * @param props - Active locale for localized copy and future catalog queries.
 * @returns A server-rendered products placeholder.
 */
export function ShadowProductsView(props: ShadowProductsViewProps) {
  const { locale } = props;
  const dictionary = getShadowDictionary(locale);

  return (
    <main className="min-h-screen p-6">
      <p className="text-sm font-medium uppercase text-muted-foreground">
        {dictionary.products.eyebrow}
      </p>
      <h1 className="mt-2 text-3xl font-semibold">{dictionary.products.title}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{dictionary.products.description}</p>
    </main>
  );
}
