'use client';

/**
 * Shadow Dev Error Boundary
 *
 * Purpose: Route-level recoverable error UI for the shadow dev segment.
 * Used in: Next.js routing at /shadow/dev
 * Used for: Provides a reset action for development-only shadow operations.
 */

type ShadowDevErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

/**
 * Renders a recoverable shadow dev error boundary.
 *
 * @param props - Next.js error and reset callback.
 * @returns A local error fallback for the shadow development page.
 */
export default function ShadowDevError(props: ShadowDevErrorProps) {
  const { error, reset } = props;

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold">Shadow dev tools failed to load</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <button className="mt-4 rounded-md border px-4 py-2" type="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
