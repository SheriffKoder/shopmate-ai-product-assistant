/**
 * Shadow Category View
 *
 * Purpose: Server-first composition surface for one shadow category route.
 * Used in: app/shadow/[locale]/categories/[slug]/page.tsx
 * Used for: Holds the phase-0 category placeholder until catalog queries are added.
 */

import type { ShadowLocale } from '@/shadow/shared/i18n/config';
import { getShadowDictionary } from '@/shadow/shared/i18n/lib/get-dictionary';

type ShadowCategoryViewProps = {
  locale: ShadowLocale;
  slug: string;
};

/**
 * Renders the shadow category placeholder.
 *
 * @param props - Active locale and category slug for future catalog queries.
 * @returns A server-rendered category placeholder.
 */
export function ShadowCategoryView(props: ShadowCategoryViewProps) {
  const { locale, slug } = props;
  const dictionary = getShadowDictionary(locale);

  return (
    <main className="min-h-screen p-6">
      <p className="text-sm font-medium uppercase text-muted-foreground">
        {dictionary.category.eyebrow}
      </p>
      <h1 className="mt-2 text-3xl font-semibold">{dictionary.category.title}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{dictionary.category.description}</p>
      <p className="mt-4 text-sm text-muted-foreground">Slug: {slug}</p>
    </main>
  );
}
