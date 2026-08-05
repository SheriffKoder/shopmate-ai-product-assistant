/**
 * Product Detail Loading State
 *
 * Purpose: Route-level fallback while one product detail segment streams.
 * Used in: Next.js routing at /[locale]/products/[slug]
 * Used for: Keeps loading UI local to the product detail route.
 */

/**
 * Renders the product detail loading fallback.
 *
 * @returns A minimal loading region for the product detail page.
 */
export default function ProductDetailLoading() {
  return <main className="min-h-screen p-6">Loading product...</main>;
}
