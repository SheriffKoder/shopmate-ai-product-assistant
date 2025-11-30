/**
 * Category Card Component
 * 
 * Purpose: Displays a single category as a card
 * Used in: HeaderCategories.tsx
 * Why: Separates category card UI logic into a reusable component
 */

'use client';

import React from 'react';
import { useShop } from '@/providers/shop-context';
import { getFirstProductImageByCategory } from '@/features/home/utils/category-utils';
import Image from 'next/image';

interface CategoryCardProps {
  category: string;
  onClick?: () => void;
  isSelected?: boolean;
  isLast?: boolean;
}

export const CategoryCard = ({ category, onClick, isSelected = false, isLast = false }: CategoryCardProps) => {
  const { products } = useShop();
  
  // Get the first product image for this category
  const categoryImage = getFirstProductImageByCategory(category, products);

  // Format category name for display (capitalize first letter)
  const formatCategoryName = (category: string): string => {
    return category
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };


  return (
    <div
      className={`flex-1 pr-12 pl-3 py-2 bg-white rounded-lg border transition-all duration-300 cursor-pointer
      md:min-w-[120px] text-start relative group ${
        isSelected
          ? 'border-primary shadow-md bg-primary/5'
          : 'border-gray-200 hover:border-primary hover:shadow-md'
      }
      ${isLast ? 'col-span-2 md:col-span-1' : ''}`}
      onClick={onClick}
    >
      <span className="text-black font-semibold text-[10px] md:text-sm">
        {formatCategoryName(category)}
      </span>

      <div className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 group-hover:scale-90 transition-all duration-300">
        {categoryImage && (
          <Image src={categoryImage} alt={category} width={100} height={100} />
        )}
      </div>
    </div>
  );
};

