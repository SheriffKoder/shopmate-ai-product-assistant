/**
 * Product Detail Page
 * 
 * Purpose: Displays individual product details
 * Used in: Next.js routing (/products/[id])
 * Why: Provides a dedicated page for viewing product details
 */

import { Suspense } from 'react';
import { ProductDetailPageContent } from '@/views/products/product-detail-page-content';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const resolvedParams = await params;
  
  return (
    <Suspense fallback={<div className="w-full min-h-screen p-4">Loading product...</div>}>
      <ProductDetailPageContent productId={resolvedParams.id} />
    </Suspense>
  );
}

