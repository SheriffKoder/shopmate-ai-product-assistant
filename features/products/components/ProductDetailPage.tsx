/**
 * Product Detail Page Component
 * 
 * Purpose: Displays detailed view of a single product
 * Used in: app/page.tsx
 * Why: Separates product detail page UI logic into a reusable component
 */

'use client';

import React from 'react';
import Image from 'next/image';
import type { Product } from '@/features/shop/model/product';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onAddToCart?: (productId: string) => void;
  isInCart?: boolean;
}

export const ProductDetailPage = ({ 
  product, 
  onBack, 
  onAddToCart,
  isInCart = false 
}: ProductDetailPageProps) => {
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product.id);
    }
  };

  return (
    <div className="w-full px-4 py-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 px-4 py-2 bg-black/70 text-white rounded-lg font-semibold 
        hover:bg-primary/90 transition-all duration-300 flex items-center gap-2 cursor-pointer"
      >
        <span>←</span>
        <span>Back</span>
      </button>

      {/* Product Detail Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative w-full aspect-square bg-white rounded-lg border border-gray-200 p-8">
            {product.image_url ? (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Radial gradient background */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(0, 0, 0, 0.05) 0%, transparent 70%)',
                  }}
                />
                <Image
                  src={product.image_url}
                  alt={product.name}
                  width={500}
                  height={500}
                  className="relative z-10 object-contain max-h-full max-w-full"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>

          {/* Image Variations */}
          {product.image_url_variations && product.image_url_variations.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {product.image_url_variations.map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative aspect-square bg-white rounded-lg border border-gray-200 overflow-hidden"
                >
                  <Image
                    src={imageUrl}
                    alt={`${product.name} view ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-primary">★</span>
                <span className="text-lg font-semibold text-black">{product.rating}</span>
              </div>
              <span className="text-gray-600">({product.reviewsCount} reviews)</span>
            </div>
            <p className="text-xl text-gray-700 mb-4">{product.shortDescription}</p>
            <p className="text-lg text-gray-600">{product.description}</p>
          </div>

          {/* Price */}
          <div className="border-t border-b border-gray-200 py-6">
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-primary">
                ${product.price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-black mb-3">Available Colors</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm font-medium text-white bg-primary rounded-full"
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-black mb-3">Key Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Add to Cart Button */}
          <div className="pt-4">
            {isInCart ? (
              <button
                disabled
                className="w-full px-6 py-3 bg-gray-300 text-gray-500 rounded-lg font-semibold 
                cursor-not-allowed"
              >
                Added to Cart
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold 
                hover:bg-primary/90 transition-all duration-300"
              >
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
