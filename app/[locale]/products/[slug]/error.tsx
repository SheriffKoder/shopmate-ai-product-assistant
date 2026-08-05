'use client';

/**
 * Shadow Product Detail Error Boundary
 *
 * Purpose: Route-level recoverable error UI for one shadow product detail segment.
 * Used in: Next.js routing at /[locale]/products/[slug]
 * Used for: Provides a reset action without coupling to current app state.
 */

type ShadowProductDetailErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

/**
 * Renders a recoverable shadow product detail error boundary.
 *
 * @param props - Next.js error and reset callback.
 * @returns A local error fallback for the shadow product detail page.
 */
export default function ShadowProductDetailError(props: ShadowProductDetailErrorProps) {
  const { error, reset } = props;

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold">Shadow product failed to load</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <button className="mt-4 rounded-md border px-4 py-2" type="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
