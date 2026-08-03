/**
 * Product Card Component
 * 
 * Purpose: Displays a product with main image, variations, and details
 * Used in: ProductGrid component
 * Why: Separates product card UI logic into a reusable component
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Product } from '@/features/shop/model/product';

interface ProductCardProps {
  product: Product;
  onProductClick?: (productId: string) => void;
}

export const ProductCard = ({ product, onProductClick }: ProductCardProps) => {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Get all images: main image + variations
  const allImages = product.image_url
    ? [
        product.image_url,
        ...(product.image_url_variations || []),
      ]
    : [];

  // Use main image as default if no variations
  const displayImage = allImages[selectedImageIndex] || product.image_url;

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleCardClick = () => {
    // Navigate to product detail page
    router.push(`/products/${product.id}`);
    
    // Also call the optional callback if provided
    if (onProductClick) {
      onProductClick(product.id);
    }
  };

  // Removed handleMainImageClick - images are now part of the card click

  const handleThumbnailClickWithStop = (index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking thumbnail
    handleThumbnailClick(index);
  };

  return (
    <div 
      className="bg-[#F3F3F3] max-w-[300px] rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Main Product Image */}
      <div className="relative w-full h-64 mb-4 bg-white rounded-lg overflow-hidden">
        {displayImage ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Radial gradient background */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(0, 0, 0, 0.05) 0%, transparent 70%)',
              }}
            />
            <Image
              src={displayImage}
              alt={product.name}
              width={300}
              height={256}
              className="relative z-10 object-contain max-h-full max-w-full"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="mb-4 text-center">
        <h3 className="text-lg font-semibold text-black mb-2 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.shortDescription}
        </p>
        
        {/* Price */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl font-bold text-primary">
            ${product.price.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Image Variations Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 pb-2 justify-center">
          {allImages.map((imageUrl, index) => (
            <button
              key={index}
              onClick={(e) => handleThumbnailClickWithStop(index, e)}
              className={`relative flex-1 aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                selectedImageIndex === index
                  ? 'border-primary shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Image
                src={imageUrl}
                alt={`${product.name} view ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
