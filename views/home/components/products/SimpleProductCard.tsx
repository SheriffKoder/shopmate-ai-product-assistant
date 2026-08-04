/**
 * Simple Product Card Component
 * 
 * Purpose: Displays a simple product card with image, name, and price
 * Used in: NonFeaturedProductsGrid component
 * Why: Separates simple product card UI logic into a reusable component
 */

'use client';

import React from 'react';
import Image from 'next/image';
import type { Product } from '@/features/catalog/model/product';

interface SimpleProductCardProps {
  product: Product;
  onClick?: (productId: string) => void;
  onProductClick?: (productId: string) => void;
}

export const SimpleProductCard = ({ product, onClick, onProductClick }: SimpleProductCardProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick(product.id);
    }
  };

  const handleProductClick = () => {
    if (onProductClick) {
      onProductClick(product.id);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={handleProductClick}
    >
      {/* Product Image */}
      <div className="relative w-full aspect-square bg-white">
        {product.image_url ? (
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <Image
              src={product.image_url}
              alt={product.name}
              width={300}
              height={300}
              className="object-contain max-h-full max-w-full"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 bg-white">
        {/* Product Name */}
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-black mb-2 line-clamp-2">
            {product.name}
          </h3>
        </div>

        {/* Color Badges */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {/* Show first 2 colors */}
            {product.colors.slice(0, 1).map((color, index) => (
              <span
                key={index}
                className="px-2 py-1 text-[10px] font-medium text-white bg-primary rounded-full"
              >
                {color}
              </span>
            ))}
            {/* Show "+x more options" if there are more than 2 colors */}
            {product.colors.length > 1 && (
              <span className="px-2 py-1 text-[10px] font-medium text-white bg-primary rounded-full">
                +{product.colors.length - 2} more options
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div>
          <span className="text-lg font-bold text-primary">
            ${product.price.toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
};
