/** Route-level category loading fallback. */

import { ProductListingLoadingSkeleton } from '@/shared/ui/page-loading-skeletons';

/**
 * Renders the category loading fallback.
 *
 * @returns A minimal loading region for the category page.
 */
export default function CategoryLoading() {
  return <ProductListingLoadingSkeleton label="category" />;
}
