/**
 * @file features/shop-assistant/ui/cards/product-card.tsx
 * Single catalog product card for chat.
 * Used in: ui/cards/product-cards.tsx.
 * Used for: Rendering lookup rows. Does not search or talk to the model.
 *
 * Function Index:
 * ProductCard: Row layout [image | details] with cart action.
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
import { ProductCartAction } from '@/widgets/product-highlight-cards/ui/product-cart-action';
import { AssistantAwareLink, useAssistantAwareRouter } from '@/features/ai-assistant/navigation';
import { getLocaleFromPathname } from '@/shared/i18n/lib/get-locale-from-pathname';
import type { ShopAssistantCommand } from '../../model/sources/shop-assistant-command-handler';

interface ProductCardProps {
  product: Product;
  cart?: CartState;
  onCommand?: (command: ShopAssistantCommand) => void | Promise<void>;
}

const CHIP_CLASS =
  'bg-background/20 rounded-full px-2 py-0.5 text-xs font-semibold tracking-wide text-background';
const MAX_FEATURE_CHIPS = 3;

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

  const handleCardClick = () => {
    router.push(`/${locale}/products/${productSlug}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="flex w-full flex-row items-stretch gap-3 bg-[#000000] p-2 border-2 border-[#000000] transition-all duration-200 cursor-pointer hover:border-primary"
    >
      <div className="relative w-28 shrink-0 self-stretch overflow-hidden bg-white sm:w-36">
        <Image
          src={product.image_url || '/images/placeholder.png'}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 112px, 144px"
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col py-1">
        <h3 className="text-lg font-semibold text-white mb-1">
          <AssistantAwareLink
            href={`/${locale}/products/${productSlug}`}
            onClick={function stopProductLinkPropagation(event) { event.stopPropagation(); }}
            className="hover:underline"
          >
            {product.name}
          </AssistantAwareLink>
        </h3>

        <p className="text-background tracking-wide text-sm mb-2 line-clamp-2">{product.shortDescription}</p>

        <div className="mb-2 flex flex-wrap gap-1.5 border-t border-[#4E4E4E] pt-2">
          {product.category && (
            <span className={CHIP_CLASS}>{product.category}</span>
          )}
          <span className={`inline-flex items-center gap-1 ${CHIP_CLASS}`}>
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {product.rating}
          </span>
          {product.features.slice(0, MAX_FEATURE_CHIPS).map((feature, index) => (
            <span key={index} className={CHIP_CLASS}>
              {feature}
            </span>
          ))}
          {product.features.length > MAX_FEATURE_CHIPS && (
            <span className={CHIP_CLASS}>
              +{product.features.length - MAX_FEATURE_CHIPS} more
            </span>
          )}
        </div>

        {onCommand && (
          <div className="mt-auto flex items-center justify-between gap-2">
            <span className="text-xl font-bold text-white">${product.price.toFixed(2)}</span>
            <div onClick={function stopCardNavigation(event) { event.stopPropagation(); }}>
              <ProductCartAction cartProduct={product} name={product.name} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
