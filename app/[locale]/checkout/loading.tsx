/**
 * Checkout Loading State
 *
 * Purpose: Route-level fallback while the checkout segment streams.
 * Used in: Next.js routing at /[locale]/checkout
 * Used for: Keeps loading UI local to the checkout route.
 */

/**
 * Renders the checkout loading fallback.
 *
 * @returns A minimal loading region for checkout.
 */
export default function CheckoutLoading() {
  return <main className="min-h-screen p-6">Loading checkout...</main>;
}
