/**
 * Shadow Products Loading State
 *
 * Purpose: Route-level fallback while the shadow products segment streams.
 * Used in: Next.js routing at /[locale]/products
 * Used for: Keeps loading UI local to the product listing route.
 */

/**
 * Renders the shadow products loading fallback.
 *
 * @returns A minimal loading region for the shadow products page.
 */
export default function ShadowProductsLoading() {
  return <main className="min-h-screen p-6">Loading shadow products...</main>;
}
