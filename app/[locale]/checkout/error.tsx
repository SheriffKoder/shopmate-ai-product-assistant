'use client';

/**
 * Checkout Error Boundary
 *
 * Purpose: Route-level recoverable error UI for the checkout segment.
 * Used in: Next.js routing at /[locale]/checkout
 * Used for: Provides a reset action for checkout rendering failures.
 */

type ShadowCheckoutErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

/**
 * Renders a recoverable checkout error boundary.
 *
 * @param props - Next.js error and reset callback.
 * @returns A local error fallback for checkout.
 */
export default function ShadowCheckoutError(props: ShadowCheckoutErrorProps) {
  const { error, reset } = props;

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold">Checkout failed to load</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <button className="mt-4 rounded-md border px-4 py-2" type="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
