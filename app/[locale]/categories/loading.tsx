/** Route-level categories loading fallback. */

import { ProductListingLoadingSkeleton } from '@/shared/ui/page-loading-skeletons';

export default function CategoriesLoading() {
  return <ProductListingLoadingSkeleton label="categories" />;
}
