'use client';

/**
 * Product Detail Error Boundary
 *
 * Purpose: Route-level recoverable error UI for one product detail segment.
 * Used in: Next.js routing at /[locale]/products/[slug]
 * Used for: Provides a reset action without coupling to current app state.
 */

type ProductDetailErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

/**
 * Renders a recoverable product detail error boundary.
 *
 * @param props - Next.js error and reset callback.
 * @returns A local error fallback for the product detail page.
 */
export default function ProductDetailError(props: ProductDetailErrorProps) {
  const { error, reset } = props;

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold"> product failed to load</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <button className="mt-4 rounded-md border px-4 py-2" type="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
