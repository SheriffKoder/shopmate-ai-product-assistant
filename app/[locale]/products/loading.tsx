/** Route-level products loading fallback. */

import { ProductListingLoadingSkeleton } from '@/shared/ui/page-loading-skeletons';

/**
 * Renders the products loading fallback.
 *
 * @returns A minimal loading region for the products page.
 */
export default function ProductsLoading() {
  return <ProductListingLoadingSkeleton label="products" />;
}
