/**
 * Products Page
 * 
 * Purpose: Displays products with filtering by category and search
 * Used in: Next.js routing (/products)
 * Why: Provides a dedicated page for browsing and filtering products
 */

import { Suspense } from 'react';
import { ProductsPageContent } from '@/features/products/products-page-content';

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="w-full min-h-screen p-4">Loading products...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}

