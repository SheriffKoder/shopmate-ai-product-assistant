/**
 * Shadow Category Loading State
 *
 * Purpose: Route-level fallback while one shadow category segment streams.
 * Used in: Next.js routing at /[locale]/categories/[slug]
 * Used for: Keeps loading UI local to the category route.
 */

/**
 * Renders the shadow category loading fallback.
 *
 * @returns A minimal loading region for the shadow category page.
 */
export default function ShadowCategoryLoading() {
  return <main className="min-h-screen p-6">Loading shadow category...</main>;
}
