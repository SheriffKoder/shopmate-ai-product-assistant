/**
 * Checkout Success Loading State
 *
 * Purpose: Route-level fallback while the checkout success segment streams.
 * Used in: Next.js routing at /[locale]/checkout/success
 * Used for: Keeps loading UI local to the checkout success route.
 */

/**
 * Renders the checkout success loading fallback.
 *
 * @returns A minimal loading region for checkout success.
 */
export default function ShadowCheckoutSuccessLoading() {
  return <main className="min-h-screen p-6">Loading checkout success...</main>;
}
