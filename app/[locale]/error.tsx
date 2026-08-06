'use client';

/**
 * Home Error Boundary
 *
 * Purpose: Route-level recoverable error UI for the home segment.
 * Used in: Next.js routing at /[locale]
 * Used for: Provides a reset action without coupling to current app state.
 */

type HomeErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

/**
 * Renders a recoverable home error boundary.
 *
 * @param props - Next.js error and reset callback.
 * @returns A local error fallback for the home page.
 */
export default function HomeError(props: HomeErrorProps) {
  const { error, reset } = props;

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold"> home failed to load</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <button className="mt-4 rounded-md border px-4 py-2" type="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
