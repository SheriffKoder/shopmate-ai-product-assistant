/**
 * Shadow Dev Loading State
 *
 * Purpose: Route-level fallback while the shadow dev segment streams.
 * Used in: Next.js routing at /shadow/dev
 * Used for: Keeps loading UI local to the development route.
 */

/**
 * Renders the shadow dev loading fallback.
 *
 * @returns A minimal loading region for the shadow development page.
 */
export default function ShadowDevLoading() {
  return <main className="min-h-screen p-6">Loading shadow dev tools...</main>;
}
