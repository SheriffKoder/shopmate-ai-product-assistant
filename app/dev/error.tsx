'use client';

/**
 * Dev Error Boundary
 *
 * Purpose: Route-level recoverable error UI for the development segment.
 * Used in: Next.js routing at /dev
 * Used for: Provides a reset action for development-only operations.
 */

type DevErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

/**
 * Renders a recoverable development error boundary.
 *
 * @param props - Next.js error and reset callback.
 * @returns A local error fallback for the development page.
 */
export default function DevError(props: DevErrorProps) {
  const { error, reset } = props;

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold"> dev tools failed to load</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <button className="mt-4 rounded-md border px-4 py-2" type="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
