/** Route-level product detail loading fallback. */

import { ProductDetailLoadingSkeleton } from '@/shared/ui/page-loading-skeletons';

/**
 * Renders the product detail loading fallback.
 *
 * @returns A minimal loading region for the product detail page.
 */
export default function ProductDetailLoading() {
  return <ProductDetailLoadingSkeleton />;
}
