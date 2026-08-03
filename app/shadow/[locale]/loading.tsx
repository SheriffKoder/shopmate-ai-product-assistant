/**
 * Shadow Home Loading State
 *
 * Purpose: Route-level fallback while the shadow home segment streams.
 * Used in: Next.js routing at /shadow/[locale]
 * Used for: Keeps loading UI local to the shadow home route.
 */

/**
 * Renders the shadow home route loading fallback.
 *
 * @returns A minimal loading region for the shadow home page.
 */
export default function ShadowHomeLoading() {
  return <main className="min-h-screen p-6">Loading shadow home...</main>;
}
