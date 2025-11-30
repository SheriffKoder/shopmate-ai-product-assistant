/**
 * Banner Slider Component
 * 
 * Purpose: Displays a carousel of featured products as banners
 * Used in: app/page.tsx
 * Why: Separates banner slider UI logic into a reusable component
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/providers/shop-context';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { Product } from '@/features/ai-assistant/types/product';

interface BannerSlideProps {
  product: Product;
  onShopNow?: (productId: string) => void;
}

const BannerSlide = ({ product, onShopNow }: BannerSlideProps) => {
  const router = useRouter();

  const handleClick = () => {
    // Navigate to product detail page
    router.push(`/products/${product.id}`);
    
    // Also call the optional callback if provided
    if (onShopNow) {
      onShopNow(product.id);
    }
  };

  return (
    <div 
      className="w-full min-h-[300px] md:h-[400px] bg-gradient-to-r from-primary to-secondary rounded-lg p-4 md:p-8 flex flex-col md:flex-row items-center cursor-pointer hover:opacity-95 transition-opacity"
      onClick={handleClick}
    >
      {/* Left side: Content */}
      <div className="flex-1 flex flex-col justify-center gap-2 md:gap-4 pr-0 md:pr-8 w-full md:w-auto">
        <h2 className="text-2xl md:text-4xl font-bold text-white">{product.name}</h2>
        <p className="text-sm md:text-lg text-white">{product.shortDescription}</p>
        <div className="flex items-center gap-4">
          <span className="text-xl md:text-3xl font-bold text-primary">
            ${product.price.toFixed(2)}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent double-triggering
            handleClick();
          }}
          className="cursor-pointer w-fit px-4 md:px-6 py-2 md:py-3 text-sm md:text-base bg-white text-primary rounded-lg font-semibold 
          hover:bg-primary border-1 border-primary hover:border-white hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Shop now
        </button>
      </div>

      {/* Right side: Image */}
      <div className="flex-1 flex items-center justify-center w-full md:w-auto mt-4 md:mt-0">
        {product.image_url ? (
          <div className="relative w-full h-[200px] md:h-[300px] max-w-md flex items-center justify-center">
            {/* Radial gradient background */}
            <div 
              className="absolute h-[150%] rounded-full aspect-square"
              style={{
                background: 'radial-gradient(circle,rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 70%)',
              }}
            />
            <Image
              src={product.image_url}
              alt={product.name}
              width={400}
              height={300}
              className="relative z-10 object-contain max-h-full max-w-full"
              priority
              unoptimized
            />
          </div>
        ) : (
          <div className="w-full h-[200px] md:h-[300px] max-w-md bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
      </div>
    </div>
  );
};

interface BannerSliderProps {
  onProductClick?: (productId: string) => void;
}

export const BannerSlider = ({ onProductClick }: BannerSliderProps) => {
  const { products } = useShop();

  // Use first 5 products for the banner (or all if less than 5)
  const featuredProducts = products.slice(0, 5);

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <div className="w-full px-4 py-6">
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {featuredProducts.map((product) => (
            <CarouselItem key={product.id}>
              <BannerSlide product={product} onShopNow={onProductClick} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className='cursor-pointer absolute top-1/2 -translate-y-1/2 left-2 opacity-50 hover:opacity-100 transition-all duration-300' />
        <CarouselNext className='cursor-pointer absolute top-1/2 -translate-y-1/2 right-2 opacity-50 hover:opacity-100 transition-all duration-300' />
      </Carousel>
    </div>
  );
};

