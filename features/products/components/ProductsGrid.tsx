/**
 * Products Grid Component
 * 
 * Purpose: Displays products in a grid with filtering capabilities
 * Used in: app/products/page.tsx
 * Why: Separates product grid logic with filtering into a reusable component
 */

'use client';

import { useShop } from '@/features/ai-assistant/providers/shop-context';
import { searchInProduct } from '@/features/ai-assistant/utils/search-utils';
import { ProductCard } from '@/features/home/components/products/ProductCard';

interface ProductsGridProps {
  category?: string | null;
  searchQuery?: string | null;
}

export const ProductsGrid = ({ category, searchQuery }: ProductsGridProps) => {
  const { products } = useShop();

  // Filter products based on category and search query
  let filteredProducts = products;

  // Filter by category
  if (category) {
    filteredProducts = filteredProducts.filter(
      (product) => product.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Filter by search query
  if (searchQuery) {
    filteredProducts = filteredProducts.filter((product) =>
      searchInProduct(searchQuery, product)
    );
  }

  // No need to separate - use ProductCard for all products

  // Build header text
  const getHeaderText = () => {
    if (category && searchQuery) {
      return `Products in "${category}" matching "${searchQuery}"`;
    }
    if (category) {
      return `Products in "${category}"`;
    }
    if (searchQuery) {
      return `Search results for "${searchQuery}"`;
    }
    return 'All Products';
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black mb-2">{getHeaderText()}</h1>
        <p className="text-gray-600">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-2">No products found</p>
          <p className="text-gray-500">
            {category || searchQuery
              ? 'Try adjusting your filters or search query'
              : 'No products available'}
          </p>
        </div>
      )}
    </div>
  );
};

