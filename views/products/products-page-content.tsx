/**
 * Products Page Content Component
 * 
 * Purpose: Client component that reads search params and displays products
 * Used in: app/products/page.tsx
 * Why: Separates client-side logic from server component page
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { ProductsGrid } from '@/views/products/components/ProductsGrid';

export function ProductsPageContent() {
  const searchParams = useSearchParams();
  
  // Get filter params from URL
  const category = searchParams.get('category') || null;
  const search = searchParams.get('search') || null;

  return (
    <div className="w-full min-h-screen flex flex-col gap-4 p-4">
      <div className='max-w-5xl mx-auto'>
        <ProductsGrid category={category} searchQuery={search} />
      </div>
    </div>
  );
}

