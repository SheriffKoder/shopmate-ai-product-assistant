/**
 * Category Image Card Component
 * 
 * Purpose: Displays a category with a 2x2 grid of product images
 * Used in: ShopByCategory component
 * Why: Separates category card UI logic into a reusable component
 */

'use client';

import React from 'react';
import Image from 'next/image';
import type { Product } from '@/features/ai-assistant/types/product';

interface CategoryImageCardProps {
  category: string;
  products: Product[];
}

export const CategoryImageCard = ({ category, products }: CategoryImageCardProps) => {
  // Get all image URLs from products in this category
  const imageUrls = products
    .map((product) => product.image_url)
    .filter((url): url is string => url !== null);

  // Repeat images if we have less than 4, max 4 images
  const displayImages: string[] = [];
  if (imageUrls.length > 0) {
    for (let i = 0; i < 4; i++) {
      displayImages.push(imageUrls[i % imageUrls.length]);
    }
  }

  // Format category name for display (capitalize first letter)
  const formatCategoryName = (category: string): string => {
    return category
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="flex flex-col items-center">
      {/* Category Name */}
      <h3 className="text-lg font-semibold text-black mb-3 text-center">
        {formatCategoryName(category)}
      </h3>

      {/* Square Card with 2x2 Grid */}
      <div className="w-full aspect-square bg-white rounded-lg border border-gray-200 p-2 hover:shadow-lg transition-all duration-300">
        {displayImages.length > 0 ? (
          <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">
            {displayImages.map((imageUrl, index) => (
              <div
                key={index}
                className="relative w-full h-full rounded overflow-hidden bg-gray-50"
              >
                <Image
                  src={imageUrl}
                  alt={`${category} product ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-sm">No images available</span>
          </div>
        )}
      </div>
    </div>
  );
};

