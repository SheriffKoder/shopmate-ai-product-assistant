/**
 * Shadow Product Detail Loading State
 *
 * Purpose: Route-level fallback while one shadow product detail segment streams.
 * Used in: Next.js routing at /[locale]/products/[slug]
 * Used for: Keeps loading UI local to the product detail route.
 */

/**
 * Renders the shadow product detail loading fallback.
 *
 * @returns A minimal loading region for the shadow product detail page.
 */
export default function ShadowProductDetailLoading() {
  return <main className="min-h-screen p-6">Loading shadow product...</main>;
}
