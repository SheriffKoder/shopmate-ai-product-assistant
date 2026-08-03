/**
 * Shadow Home View
 *
 * Purpose: Server-first composition surface for the shadow home route.
 * Used in: app/shadow/[locale]/page.tsx
 * Used for: Holds the phase-0 home placeholder until catalog queries are added.
 */

type ShadowHomeViewProps = {
  locale: string;
};

/**
 * Renders the shadow home view placeholder.
 *
 * @param props - Active locale for localized copy and future catalog queries.
 * @returns A server-rendered home placeholder.
 */
export function ShadowHomeView(props: ShadowHomeViewProps) {
  const { locale } = props;

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-3xl font-semibold">Shadow home</h1>
      <p className="mt-2 text-muted-foreground">Locale: {locale}</p>
    </main>
  );
}
