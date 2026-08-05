'use client';

/**
 * Shadow Products Error Boundary
 *
 * Purpose: Route-level recoverable error UI for the shadow products segment.
 * Used in: Next.js routing at /[locale]/products
 * Used for: Provides a reset action without coupling to current app state.
 */

type ShadowProductsErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

/**
 * Renders a recoverable shadow products error boundary.
 *
 * @param props - Next.js error and reset callback.
 * @returns A local error fallback for the shadow products page.
 */
export default function ShadowProductsError(props: ShadowProductsErrorProps) {
  const { error, reset } = props;

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold">Shadow products failed to load</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <button className="mt-4 rounded-md border px-4 py-2" type="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
