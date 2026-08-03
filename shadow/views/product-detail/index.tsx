/**
 * Shadow Product Detail View
 *
 * Purpose: Server-first composition surface for one shadow product route.
 * Used in: app/shadow/[locale]/products/[slug]/page.tsx
 * Used for: Holds the phase-0 product detail placeholder until catalog queries are added.
 */

type ShadowProductDetailViewProps = {
  locale: string;
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

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-3xl font-semibold">Shadow product</h1>
      <p className="mt-2 text-muted-foreground">Locale: {locale}</p>
      <p className="mt-1 text-muted-foreground">Slug: {slug}</p>
    </main>
  );
}
