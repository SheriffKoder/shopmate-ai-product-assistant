/**
 * Product Grid Component
 * 
 * Purpose: Maps over products with image variations and displays them in a grid
 * Used in: app/page.tsx
 * Why: Separates product grid logic into a reusable component
 */

'use client';

import React from 'react';
import { useProducts } from '@/features/catalog/hooks/use-products';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  onProductClick?: (productId: string) => void;
}

export const ProductGrid = ({ onProductClick }: ProductGridProps) => {
  const { products } = useProducts();

  // Filter products that are featured
  const featuredProducts = products.filter(
    (product) => product.featured === true
  );

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <div className="w-full px-4 py-6 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-black mb-6">Featured Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mx-auto">
        {featuredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onProductClick={onProductClick}
          />
        ))}
      </div>
    </div>
  );
};
