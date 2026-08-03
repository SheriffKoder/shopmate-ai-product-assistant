/**
 * Search Results Grid Component
 * 
 * Purpose: Displays search results in a product grid
 * Used in: app/page.tsx
 * Why: Separates search results display logic into a reusable component
 */

'use client';

import React from 'react';
import { ProductCard } from './ProductCard';
import type { Product } from '@/features/shop/model/product';

interface SearchResultsGridProps {
  products: Product[];
  searchQuery: string;
  isCategoryFilter?: boolean;
  onBackToHome?: () => void;
  onProductClick?: (productId: string) => void;
}

export const SearchResultsGrid = ({ products, searchQuery, isCategoryFilter = false, onBackToHome, onProductClick }: SearchResultsGridProps) => {
  if (products.length === 0) {
    return (
      <div className="w-full px-4 py-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-6xl mb-6">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="mb-4 px-4 py-2 bg-black/70 text-white rounded-lg font-semibold 
              hover:bg-primary/90 transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              <span>←</span>
              <span>Back to Home</span>
            </button>
          )}
        </div>
        <h2 className="text-2xl font-bold text-black mb-4">No products found</h2>
        <p className="text-gray-600">
          {isCategoryFilter ? 'No products in this category' : 'Try a different search term'}
        </p>
      </div>
    );
  }


  // Format category name for display
  const formatCategoryName = (category: string): string => {
    return category
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const displayTitle = isCategoryFilter 
    ? formatCategoryName(searchQuery)
    : `Search Results for "${searchQuery}"`;

  return (
    <div className="w-full px-4 py-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-6xl mb-6">
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="mb-4 px-4 py-2 bg-black/70 text-white rounded-lg font-semibold 
            hover:bg-primary/90 transition-all duration-300 flex items-center gap-2 cursor-pointer"
          >
            <span>←</span>
            <span>Back to Home</span>
          </button>
        )}
      </div>
      <h2 className="text-2xl font-bold text-black mb-2">
        {displayTitle}
      </h2>
      <p className="text-gray-600 mb-6">{products.length} product{products.length !== 1 ? 's' : ''} found</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mx-auto">
        {products.map((product) => (
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
