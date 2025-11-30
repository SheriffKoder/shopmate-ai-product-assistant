/**
 * Promotional Card Component
 * 
 * Purpose: Displays a promotional card with product info and image
 * Used in: PromotionalCards component
 * Why: Separates promotional card UI logic into a reusable component
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { PromotionalCardConfig } from '@/features/home/config/promotional-cards';
import type { Product } from '@/features/ai-assistant/types/product';

interface PromotionalCardProps {
  config: PromotionalCardConfig;
  product: Product | null;
  onButtonClick?: (productId: string) => void;
}

export const PromotionalCard = ({ config, product, onButtonClick }: PromotionalCardProps) => {
  const router = useRouter();

  const handleButtonClick = () => {
    // Navigate to product detail page
    router.push(`/products/${config.productId}`);
    
    // Also call the optional callback if provided
    if (onButtonClick) {
      onButtonClick(config.productId);
    }
  };

  return (
    <div 
      className="w-full min-h-[300px] md:h-[400px] rounded-lg overflow-hidden flex flex-col md:flex-row relative"
      style={{
        background: `linear-gradient(to top left, ${config.backgroundColor1}, ${config.backgroundColor2})`,
      }}
    >
      {/* Left Side: Text Content */}
      <div className="flex-1 flex flex-col justify-center p-4 md:p-8 text-white relative z-10">
        <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">{config.header}</h2>
        <p className="text-sm md:text-lg mb-4 md:mb-6 text-gray-300">{config.catchyText}</p>
        <div className="mb-4 md:mb-6">
          {product && (
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm text-gray-200">at Just</span>
              <span 
                className="text-xl md:text-3xl font-bold"
                style={{ color: config.accentColor }}
              >
                ${product.price.toFixed(0)} $
              </span>
            </div>
          )}
        </div>
        <button
          onClick={handleButtonClick}
          className="cursor-pointer w-fit px-4 md:px-6 py-2 md:py-3 text-sm md:text-base text-white font-semibold rounded-lg 
          hover:opacity-90 transition-all duration-300 uppercase"
          style={{ backgroundColor: config.accentColor }}
        >
          {config.buttonText}
        </button>
      </div>

      {/* Right Side: Product Image */}
      <div className="flex-1 relative min-h-[200px] md:min-h-0">
        {product?.image_url ? (
          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
            <Image
              src={product.image_url}
              alt={config.header}
              width={500}
              height={400}
              className="object-contain max-h-full max-w-full"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-500">No image available</span>
          </div>
        )}
      </div>
    </div>
  );
};

