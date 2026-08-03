/**
 * Shadow Category View
 *
 * Purpose: Server-first composition surface for one shadow category route.
 * Used in: app/shadow/[locale]/categories/[slug]/page.tsx
 * Used for: Holds the phase-0 category placeholder until catalog queries are added.
 */

type ShadowCategoryViewProps = {
  locale: string;
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

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-3xl font-semibold">Shadow category</h1>
      <p className="mt-2 text-muted-foreground">Locale: {locale}</p>
      <p className="mt-1 text-muted-foreground">Slug: {slug}</p>
    </main>
  );
}
