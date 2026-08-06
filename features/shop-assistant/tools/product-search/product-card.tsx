/**
 * Product Card Component
 * 
 * Purpose: Displays a single product in a card format
 * Used in: product-search-tool-renderer.tsx
 * Why: Separates product card UI from tool rendering logic
 */

'use client';

import { useRouter } from 'next/navigation';
import { Product } from '@/features/catalog/model/product';
import { Star } from 'lucide-react';
import { CartState } from '@/features/cart/model/cart';
import Image from 'next/image';
import { useFullscreen } from '@/features/ai-assistant/providers/fullscreen-context';
import { ProductCartAction } from '@/widgets/product-highlight-cards/ui/product-cart-action';
import type { ShopAssistantCommand } from '../../model/shop-assistant-command-handler';

interface ProductCardProps {
  product: Product;
  cart?: CartState;
  onCommand?: (command: ShopAssistantCommand) => void | Promise<void>;
}

export const ProductCard = ({ product, cart, onCommand }: ProductCardProps) => {
  const router = useRouter();
  const handleCardClick = () => {
    router.push(`/products/${product.id}`);
  };

  const { isFullScreen } = useFullscreen();

  return (
    <div
      onClick={handleCardClick}
      className={`bg-[#000000] ${isFullScreen ? 'lg:w-[630px] lg:h-[320px] lg:flex-row lg:flex lg:gap-4' : 'w-[320px] h-[630px] flex flex-col'} p-2 border-2 border-[#000000] transition-all duration-200 cursor-pointer hover:border-primary`}
    >

      <div className={`${isFullScreen ? 'lg:h-[100%] lg:w-[40%]' : 'h-[40%]'}`}>
        <Image src={product.image_url || '/images/placeholder.png'} alt={product.name} width={200} height={200}
        className='w-full h-full object-cover bg-white' />
      </div>


      <div className={`flex flex-col p-2 ${isFullScreen ? 'lg:h-[100%] lg:w-[60%]' : 'h-[60%]'}`}>

      {/* Product Name */}
      <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>

      {/* Category and Rating - Flex Row */}
      <div className="flex gap-2 mb-2">
        {/* Category Badge */}
        {product.category && (
          <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white">
            {product.category}
          </span>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 px-2 py-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-white text-sm font-medium">{product.rating}</span>
        </div>
      </div>

      {/* Short Description */}
      <p className="text-background tracking-wide text-sm mb-3 line-clamp-2">{product.shortDescription}</p>

      {/* Key Features (show first 3) */}
      {product.features.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#4E4E4E]">
          <ul className="space-y-1">
            {product.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="text-background tracking-wide font-semibold text-xs flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>{feature}</span>
              </li>
            ))}
            {product.features.length > 3 && (
              <li className="text-background tracking-wide font-semibold">+{product.features.length - 3} more features</li>
            )}
          </ul>
        </div>
      )}

      {/* Cart Action Buttons */}
      {onCommand && (
        <div className="mt-auto flex gap-2 justify-between">

          {/* Price */}
          <div className="flex items-center justify-start">
            <span className="text-xl font-bold text-white">${product.price.toFixed(2)}</span>
          </div>

          <div onClick={function stopCardNavigation(event) { event.stopPropagation(); }}>
            <ProductCartAction cartProduct={product} name={product.name} />
          </div>

        </div>
      )}
      </div>
    </div>
  );
};
