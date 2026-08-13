/**
 * @file features/shop-assistant/ui/cart/cart-item-card.tsx
 * Single cart row with quantity controls.
 * Used in: ui/cart/cart-panel.tsx.
 * Used for: Cart mutations from chat UI, not from schema action: cart.
 *
 * Function Index:
 * CartItemCard: Image, details, remove / decrease / increase controls.
 *
 * Steps:
 * 1. Navigate to the product page on row click.
 * 2. Dispatch cart commands through onCommand.
 */

'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Package, Plus, Minus, Trash2 } from 'lucide-react';
import { useAssistantAwareRouter } from '@/features/ai-assistant/navigation';
import { getLocaleFromPathname } from '@/shared/i18n/lib/get-locale-from-pathname';
import type { ShopAssistantCommand } from '../../model/sources/shop-assistant-command-handler';

interface CartItemCardProps {
  id: string;
  title: string;
  description?: string;
  badge?: string;
  price?: number;
  quantity?: number;
  image?: string;
  productId?: string;
  onCommand?: (command: ShopAssistantCommand) => void | Promise<void>;
}

/**
 * Render one cart item with quantity controls.
 *
 * @example
 * <CartItemCard id="iphone-15-pro-max" title="iPhone 15 Pro Max" productId="iphone-15-pro-max" onCommand={commandHandler} />
 */
export const CartItemCard = ({
  title,
  description,
  badge,
  price,
  quantity,
  image,
  productId,
  onCommand,
}: CartItemCardProps) => {
  const router = useAssistantAwareRouter();
  const locale = getLocaleFromPathname(usePathname());

  const handleCardClick = () => {
    if (productId) {
      router.push(`/${locale}/products/${productId}`);
    }
  };

  const handleRemoveItem = () => {
    if (onCommand && productId) {
      void onCommand({ type: 'cart.remove-item', payload: { productId } });
    }
  };

  const handleDecreaseQuantity = () => {
    if (onCommand && productId) {
      void onCommand({ type: 'cart.apply-action', payload: { type: 'DECREASE_QUANTITY', payload: productId } });
    }
  };

  const handleIncreaseQuantity = () => {
    if (onCommand && productId) {
      void onCommand({ type: 'cart.apply-action', payload: { type: 'INCREASE_QUANTITY', payload: productId } });
    }
  };

  return (
    <div
      className="bg-black px-4 py-3 text-black transition-all duration-200 border-b border-white/5 last:border-b-0 cursor-pointer hover:bg-black/80"
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white border border-[#4E4E4E] flex items-center justify-center overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={title}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-6 h-6 text-white/60" />
          )}
        </div>

        <div className="flex-1 min-w-0 leading-tight tracking-wide">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-white truncate">{title}</h4>
            {badge && (
              <span className="text-[10px] px-2 py-0.5 bg-[#3b82f6]/20 text-white rounded-full flex-shrink-0">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="font-semibold text-white/60 line-clamp-2 mb-1">{description}</p>
          )}
          {price !== undefined && (
            <p className="text-sm font-semibold text-white tracking-wider">
              ${(price * (quantity || 1)).toFixed(2)}
              {quantity && quantity > 1 && (
                <span className="text-xs text-white/60 ml-1">
                  (${price.toFixed(2)} each)
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {onCommand && productId && (
        <div className="flex items-center gap-2 mt-3 w-fit ml-auto">
          <button
            onClick={(event) => {
              event.stopPropagation();
              handleRemoveItem();
            }}
            className="cursor-pointer p-1.5 rounded hover:bg-white/20 transition-colors w-fit disabled:opacity-50 disabled:cursor-not-allowed"
            title="Remove from cart"
          >
            <Trash2 className="w-4 h-4 text-white/70" />
          </button>

          <div className="flex items-center gap-2 flex-1">
            <button
              onClick={(event) => {
                event.stopPropagation();
                handleDecreaseQuantity();
              }}
              disabled={!quantity || quantity <= 1}
              className="cursor-pointer p-1.5 rounded hover:bg-white/20 transition-colors w-fit disabled:opacity-50 disabled:cursor-not-allowed"
              title="Decrease quantity"
            >
              <Minus className="w-4 h-4 text-white/70" />
            </button>

            <button
              onClick={(event) => {
                event.stopPropagation();
                handleIncreaseQuantity();
              }}
              className="cursor-pointer p-1.5 rounded hover:bg-white/20 transition-colors w-fit"
              title="Increase quantity"
            >
              <Plus className="w-4 h-4 text-white/70" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
