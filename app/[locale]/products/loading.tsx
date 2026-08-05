/**
 * Products Loading State
 *
 * Purpose: Route-level fallback while the products segment streams.
 * Used in: Next.js routing at /[locale]/products
 * Used for: Keeps loading UI local to the product listing route.
 */

/**
 * Renders the products loading fallback.
 *
 * @returns A minimal loading region for the products page.
 */
export default function ProductsLoading() {
  return <main className="min-h-screen p-6">Loading products...</main>;
}
