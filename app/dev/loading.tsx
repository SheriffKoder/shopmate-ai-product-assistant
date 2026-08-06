/**
 * Dev Loading State
 *
 * Purpose: Route-level fallback while the development segment streams.
 * Used in: Next.js routing at /dev
 * Used for: Keeps loading UI local to the development route.
 */

/**
 * Renders the development loading fallback.
 *
 * @returns A minimal loading region for the development page.
 */
export default function DevLoading() {
  return <main className="min-h-screen p-6">Loading development tools...</main>;
}
