/**
 * Home Loading State
 *
 * Purpose: Route-level fallback while the home segment streams.
 * Used in: Next.js routing at /[locale]
 * Used for: Keeps loading UI local to the home route.
 */

/**
 * Renders the home route loading fallback.
 *
 * @returns A minimal loading region for the home page.
 */
export default function HomeLoading() {
  return <main className="min-h-screen p-6">Loading home...</main>;
}
