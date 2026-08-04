/**
 * Cart Item Card Component
 * 
 * Purpose: Displays a single cart item with image, details, and quantity controls
 * Used in: ButtonDropdown.tsx
 * Why: Separates cart item UI logic into a reusable component
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Package, Plus, Minus, Trash2 } from 'lucide-react';
import type { ShopAssistantCommand } from '../../model/shop-assistant-command-handler';

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

export const CartItemCard = ({
  id,
  title,
  description,
  badge,
  price,
  quantity,
  image,
  productId,
  onCommand,
}: CartItemCardProps) => {
  const router = useRouter();

  const handleCardClick = () => {
    if (productId) {
      router.push(`/products/${productId}`);
    }
  };

  /**
   * Removes the current item through the adapter mutation contract.
   */
  const handleRemoveItem = () => {
    if (onCommand && productId) {
      void onCommand({ type: 'cart.remove-item', payload: { productId } });
    }

  };

  /**
   * Decreases the current item quantity through the adapter mutation contract.
   */
  const handleDecreaseQuantity = () => {
    if (onCommand && productId) {
      void onCommand({ type: 'cart.apply-action', payload: { type: 'DECREASE_QUANTITY', payload: productId } });
    }

  };

  /**
   * Increases the current item quantity through the adapter mutation contract.
   */
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
        {/* Product Image */}
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

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-white truncate">{title}</h4>
            {badge && (
              <span className="text-[10px] px-2 py-0.5 bg-[#3b82f6]/20 text-white rounded-full flex-shrink-0">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-white/60 line-clamp-2 mb-1">{description}</p>
          )}
          {price !== undefined && (
            <p className="text-sm font-semibold text-white">
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
      
      {/* Quantity Controls */}
      {onCommand && productId && (
        <div className="flex items-center gap-2 mt-3 w-fit ml-auto">
          {/* Remove Button (Trash Icon) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveItem();
            }}
            className="cursor-pointer p-1.5 rounded hover:bg-white/20 transition-colors w-fit disabled:opacity-50 disabled:cursor-not-allowed"
            title="Remove from cart"
          >
            <Trash2 className="w-4 h-4 text-white/70" />
          </button>
          
          {/* Quantity Controls */}
          <div className="flex items-center gap-2 flex-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDecreaseQuantity();
              }}
              disabled={!quantity || quantity <= 1}
              className="cursor-pointer p-1.5 rounded hover:bg-white/20 transition-colors w-fit disabled:opacity-50 disabled:cursor-not-allowed"
              title="Decrease quantity"
            >
              <Minus className="w-4 h-4 text-white/70" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
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
