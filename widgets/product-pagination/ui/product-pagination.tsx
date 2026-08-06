/**
 * Product Pagination
 *
 * Purpose: Renders the temporary pagination controls for the products page.
 * Used in: views/products/ui/products-page.tsx
 * Used for: Establishing the listing pagination layout before page state is connected.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Renders mock products pagination controls.
 *
 * @returns A rounded pagination control row.
 */
export function ProductPagination() {
  return (
    <nav aria-label="Products pagination" className="flex items-center justify-center gap-3 font-button text-sm">
      <button
        aria-label="Previous page"
        className="flex size-8 items-center justify-center rounded bg-foreground text-background disabled:opacity-40"
        disabled
        type="button"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
      </button>
      <button
        aria-current="page"
        className="flex size-8 items-center justify-center rounded bg-foreground text-primary"
        type="button"
      >
        1
      </button>
      <button
        className="flex size-8 items-center justify-center rounded bg-foreground text-background disabled:opacity-40"
        disabled
        type="button"
      >
        2
      </button>
      <span aria-hidden="true" className="px-1 text-muted-foreground">
        ...
      </span>
      <button
        aria-label="Next page"
        className="flex size-8 items-center justify-center rounded bg-foreground text-background disabled:opacity-40"
        disabled
        type="button"
      >
        <ChevronRight aria-hidden="true" className="size-4" />
      </button>
    </nav>
  );
}
