/**
 * Category Loading State
 *
 * Purpose: Route-level fallback while one category segment streams.
 * Used in: Next.js routing at /[locale]/categories/[slug]
 * Used for: Keeps loading UI local to the category route.
 */

/**
 * Renders the category loading fallback.
 *
 * @returns A minimal loading region for the category page.
 */
export default function CategoryLoading() {
  return <main className="min-h-screen p-6">Loading category...</main>;
}
