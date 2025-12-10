/**
 * Shop By Category Component
 * 
 * Purpose: Displays categories in a 1x4 grid with product images
 * Used in: app/page.tsx
 * Why: Separates shop by category logic into a reusable component
 */

'use client';

import React from 'react';
import { useShop } from '@/features/ai-assistant/providers/shop-context';
import { CategoryImageCard } from './CategoryImageCard';

export const ShopByCategory = () => {
  const { products } = useShop();

  // Get unique categories from products
  const uniqueCategories = Array.from(
    new Set(products.map(product => product.category))
  ).sort();

  // Get products for each category
  const categoriesWithProducts = uniqueCategories.map((category) => ({
    category,
    products: products.filter((product) => product.category === category),
  }));

  // Take first 4 categories
  const displayCategories = categoriesWithProducts.slice(0, 4);

  if (displayCategories.length === 0) {
    return null;
  }

  return (
    <div className="w-full px-4 py-6">
      <h2 className="text-2xl font-bold text-black mb-6 text-center">Shop by category</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayCategories.map(({ category, products }) => (
          <CategoryImageCard
            key={category}
            category={category}
            products={products}
          />
        ))}
      </div>
    </div>
  );
};

