/**
 * @file features/shop-assistant/ui/cards/product-card.tsx
 * Single catalog product card for chat.
 * Used in: ui/cards/product-cards.tsx.
 * Used for: Rendering lookup rows. Does not search or talk to the model.
 *
 * Function Index:
 * ProductCard: Product image, details, and cart action.
 *
 * Steps:
 * 1. Navigate to the product page on card click.
 * 2. Show rating, features, and price from the lookup row.
 * 3. Cart mutations go through ProductCartAction / onCommand, not schema.
 */

'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Star } from 'lucide-react';
import type { Product } from '@/features/catalog/model/product';
import type { CartState } from '@/features/cart/model/cart';
import { useFullscreen } from '@/features/ai-assistant/providers/fullscreen-context';
import { ProductCartAction } from '@/widgets/product-highlight-cards/ui/product-cart-action';
import { AssistantAwareLink, useAssistantAwareRouter } from '@/features/ai-assistant/navigation';
import { getLocaleFromPathname } from '@/shared/i18n/lib/get-locale-from-pathname';
import type { ShopAssistantCommand } from '../../model/sources/shop-assistant-command-handler';

interface ProductCardProps {
  product: Product;
  cart?: CartState;
  onCommand?: (command: ShopAssistantCommand) => void | Promise<void>;
}

/**
 * Render one catalog product as a chat card.
 *
 * @example
 * <ProductCard product={iphone} onCommand={commandHandler} />
 */
export const ProductCard = ({ product, onCommand }: ProductCardProps) => {
  const router = useAssistantAwareRouter();
  const locale = getLocaleFromPathname(usePathname());
  const productSlug = product.slug ?? product.id;
  const { isFullScreen } = useFullscreen();

  const handleCardClick = () => {
    router.push(`/${locale}/products/${productSlug}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-[#000000] ${isFullScreen ? 'lg:w-[630px] lg:h-[320px] lg:flex-row lg:flex lg:gap-4' : 'w-[320px] h-[630px] flex flex-col'} p-2 border-2 border-[#000000] transition-all duration-200 cursor-pointer hover:border-primary`}
    >
      <div className={`${isFullScreen ? 'lg:h-[100%] lg:w-[40%]' : 'h-[40%]'}`}>
        <Image
          src={product.image_url || '/images/placeholder.png'}
          alt={product.name}
          width={200}
          height={200}
          className="w-full h-full object-cover bg-white"
        />
      </div>

      <div className={`flex flex-col p-2 ${isFullScreen ? 'lg:h-[100%] lg:w-[60%]' : 'h-[60%]'}`}>
        <h3 className="text-lg font-semibold text-white mb-2">
          <AssistantAwareLink
            href={`/${locale}/products/${productSlug}`}
            onClick={function stopProductLinkPropagation(event) { event.stopPropagation(); }}
            className="hover:underline"
          >
            {product.name}
          </AssistantAwareLink>
        </h3>

        <div className="flex gap-2 mb-2">
          {product.category && (
            <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white">
              {product.category}
            </span>
          )}
          <div className="flex items-center gap-1 px-2 py-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-white text-sm font-medium">{product.rating}</span>
          </div>
        </div>

        <p className="text-background tracking-wide text-sm mb-3 line-clamp-2">{product.shortDescription}</p>

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

        {onCommand && (
          <div className="mt-auto flex gap-2 justify-between">
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
