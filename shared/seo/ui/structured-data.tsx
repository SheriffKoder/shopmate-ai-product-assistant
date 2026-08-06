/**
 * @file shared/seo/ui/structured-data.tsx
 * Renders JSON-LD without coupling public routes to a schema library.
 */

type StructuredDataProps = { data: Record<string, unknown> };

/** Render one JSON-LD payload for search crawlers. */
export function StructuredData({ data }: StructuredDataProps) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
