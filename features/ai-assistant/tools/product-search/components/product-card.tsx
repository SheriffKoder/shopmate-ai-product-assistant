/**
 * Product Card Component
 * 
 * Purpose: Displays a single product in a card format
 * Used in: product-search-tool-renderer.tsx
 * Why: Separates product card UI from tool rendering logic
 */

'use client';

import { useRouter } from 'next/navigation';
import { Product } from '@/features/ai-assistant/types/product';
import { Star, Trash2 } from 'lucide-react';
import { CartAction, CartState } from '@/features/ai-assistant/types/cart';
import Image from 'next/image';
import { useFullscreen } from '@/features/ai-assistant/providers/fullscreen-context';

interface ProductCardProps {
  product: Product;
  dispatchCartAction?: (action: CartAction) => void;
  cart?: CartState;
}

export const ProductCard = ({ product, dispatchCartAction, cart }: ProductCardProps) => {
  const router = useRouter();
  // Check if product is in cart
  const isInCart = cart?.items.some((item) => item.productId === product.id) || false;

  const handleCardClick = () => {
    router.push(`/products/${product.id}`);
  };

  const { isFullScreen } = useFullscreen();

  return (
    <div
      onClick={handleCardClick}
      className={`bg-[#000000] ${isFullScreen ? 'lg:w-[630px] lg:h-[320px] lg:flex-row lg:flex lg:gap-4' : 'w-[320px] h-[630px] flex flex-col'} rounded-lg p-2 border-2 border-[#000000] transition-all duration-200 cursor-pointer hover:border-primary`}
    >

      <div className={`${isFullScreen ? 'lg:h-[100%] lg:w-[40%]' : 'h-[40%]'}`}>
        <Image src={product.image_url || '/images/placeholder.png'} alt={product.name} width={100} height={100}
        className='w-full h-full object-contain rounded-md bg-white' />
      </div>


      <div className={`flex flex-col p-2 ${isFullScreen ? 'lg:h-[100%] lg:w-[60%]' : 'h-[60%]'}`}>

      {/* Product Name */}
      <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>

      {/* Category and Rating - Flex Row */}
      <div className="flex gap-2 mb-2">
        {/* Category Badge */}
        {product.category && (
          <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white rounded border border-white">
            {product.category}
          </span>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 px-2 py-1 rounded border border-white">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-white text-sm font-medium">{product.rating}</span>
        </div>
      </div>

      {/* Short Description */}
      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{product.shortDescription}</p>

      {/* Key Features (show first 3) */}
      {product.features.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#4E4E4E]">
          <ul className="space-y-1">
            {product.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="text-gray-400 text-xs flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>{feature}</span>
              </li>
            ))}
            {product.features.length > 3 && (
              <li className="text-gray-500 text-xs">+{product.features.length - 3} more features</li>
            )}
          </ul>
        </div>
      )}

      {/* Cart Action Buttons */}
      {dispatchCartAction && (
        <div className="mt-auto flex gap-2">

          {/* Price */}
          <div className="flex items-center justify-start">
            <span className="text-xl font-bold text-white">${product.price.toFixed(2)}</span>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card onClick from firing
              if (!isInCart) {
                dispatchCartAction({
                  type: 'ADD_TO_CART',
                  payload: product,
                });
              }
            }}
            disabled={isInCart}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${
              isInCart
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-primary to-secondary text-white cursor-pointer'
            }`}
          >
            Add to Cart
          </button>

          {/* Trash Icon Button */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card onClick from firing
              if (isInCart) {
                dispatchCartAction({
                  type: 'REMOVE_FROM_CART',
                  payload: product.id,
                });
              }
            }}
            disabled={!isInCart}
            className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg transition-colors font-medium ${
              isInCart
                ? 'bg-secondary hover:bg-secondary/90 text-white cursor-pointer'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
            }`}
          >
            <Trash2 className="w-4 h-4" />
          </button>

        </div>
      )}
      </div>
    </div>
  );
};

