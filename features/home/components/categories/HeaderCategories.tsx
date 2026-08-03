/**
 * Header Categories Component
 * 
 * Purpose: Displays product categories as cards
 * Used in: app/page.tsx
 * Why: Separates category display logic into a reusable component
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/features/shop/providers/shop-context';
import { CategoriesHeader } from './CategoriesHeader';
import { CategoryCard } from './CategoryCard';

interface HeaderCategoriesProps {
  onCategoryClick?: (category: string | null) => void;
  selectedCategory?: string | null;
}

export const HeaderCategories = ({ onCategoryClick, selectedCategory }: HeaderCategoriesProps) => {
  const { products } = useShop();
  const router = useRouter();

  // Get unique categories from products
  const uniqueCategories = Array.from(
    new Set(products.map(product => product.category))
  ).sort();

  const handleCategoryClick = (category: string) => {
    // Navigate to products page with category filter
    router.push(`/products?category=${encodeURIComponent(category)}`);
    
    // Also call the optional callback if provided
    if (onCategoryClick) {
      // Toggle: if same category is clicked, deselect it
      if (selectedCategory?.toLowerCase() === category.toLowerCase()) {
        onCategoryClick(null);
      } else {
        onCategoryClick(category);
      }
    }
  };

  return (
    <div className="w-full px-8 py-2 h-fit rounded-lg relative">
      {/* <CategoriesHeader /> */}
      <div className="grid grid-cols-2 md:grid-cols-1 flex-wrap mt-4 gap-12 pr-4">
        {uniqueCategories.map((category, index) => (
          <CategoryCard
            key={category}
            category={category}
            onClick={() => handleCategoryClick(category)}
            isSelected={selectedCategory?.toLowerCase() === category.toLowerCase()}
            isLast={index === uniqueCategories.length - 1 ? true : false}
          />
        ))}
      </div>
    </div>
  );
};
