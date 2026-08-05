/**
 * Non-Featured Products Grid Component
 * 
 * Purpose: Displays all non-featured products in a 4-per-row grid
 * Used in: app/page.tsx
 * Why: Separates non-featured products grid logic into a reusable component
 */

'use client';

import React from 'react';
import { useProducts } from '@/features/catalog/hooks/use-products';
import { SimpleProductCard } from './SimpleProductCard';

interface NonFeaturedProductsGridProps {
  onProductClick?: (productId: string) => void;
}

export const NonFeaturedProductsGrid = ({ onProductClick }: NonFeaturedProductsGridProps) => {
  const { products } = useProducts();

  // Filter products that are not featured
  const nonFeaturedProducts = products.filter(
    (product) => product.featured !== true
  );

  if (nonFeaturedProducts.length === 0) {
    return null;
  }

  return (
    <div className="w-full px-4 py-6">
      <h2 className="text-2xl font-bold text-black mb-6 text-center">All Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {nonFeaturedProducts.map((product) => (
          <SimpleProductCard
            key={product.id}
            product={product}
            onProductClick={onProductClick}
          />
        ))}
      </div>
    </div>
  );
};
