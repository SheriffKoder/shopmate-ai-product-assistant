/**
 * Shadow Products View
 *
 * Purpose: Server-first composition surface for the shadow products route.
 * Used in: app/shadow/[locale]/products/page.tsx
 * Used for: Holds the phase-0 products placeholder until catalog queries are added.
 */

type ShadowProductsViewProps = {
  locale: string;
};

/**
 * Renders the shadow products listing placeholder.
 *
 * @param props - Active locale for localized copy and future catalog queries.
 * @returns A server-rendered products placeholder.
 */
export function ShadowProductsView(props: ShadowProductsViewProps) {
  const { locale } = props;

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-3xl font-semibold">Shadow products</h1>
      <p className="mt-2 text-muted-foreground">Locale: {locale}</p>
    </main>
  );
}
