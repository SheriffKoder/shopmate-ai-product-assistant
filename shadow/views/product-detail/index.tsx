/**
 * Shadow Product Detail View
 *
 * Purpose: Server-first composition surface for one shadow product route.
 * Used in: app/shadow/[locale]/products/[slug]/page.tsx
 * Used for: Holds the phase-0 product detail placeholder until catalog queries are added.
 */

import type { ShadowLocale } from '@/shadow/shared/i18n/config';
import { getShadowDictionary } from '@/shadow/shared/i18n/lib/get-dictionary';

type ShadowProductDetailViewProps = {
  locale: ShadowLocale;
  slug: string;
};

/**
 * Renders the shadow product detail placeholder.
 *
 * @param props - Active locale and product slug for future catalog queries.
 * @returns A server-rendered product detail placeholder.
 */
export function ShadowProductDetailView(props: ShadowProductDetailViewProps) {
  const { locale, slug } = props;
  const dictionary = getShadowDictionary(locale);

  return (
    <main className="min-h-screen p-6">
      <p className="text-sm font-medium uppercase text-muted-foreground">
        {dictionary.productDetail.eyebrow}
      </p>
      <h1 className="mt-2 text-3xl font-semibold">{dictionary.productDetail.title}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        {dictionary.productDetail.description}
      </p>
      <p className="mt-4 text-sm text-muted-foreground">Slug: {slug}</p>
    </main>
  );
}
