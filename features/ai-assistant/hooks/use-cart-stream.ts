/**
 * use-cart-stream Hook
 * 
 * Purpose: Manages cart state updates from DataStream
 * Used in: DataStreamHandler
 * Why: Separates stream processing logic from state management
 * 
 * This hook provides functions to update cart state when streamed data arrives.
 * It integrates with the existing ShopProvider context to maintain a single source of truth.
 */

'use client';

import { useShop } from '@/features/ai-assistant/providers/shop-context';
import type { CartState } from '../types/cart';
import type { Product } from '../types/product';

/**
 * Hook for managing cart state updates from streamed data
 * 
 * Provides functions to:
 * - Update cart state from stream
 * - Handle cart item additions/removals
 * - Sync cart state with streamed updates
 * 
 * @returns Functions to update cart state from stream data
 */
export function useCartStream() {
  const { dispatchCartAction } = useShop();

  /**
   * Update cart state from streamed cart update
   * 
   * Note: This replaces the entire cart state with the streamed state.
   * For incremental updates, use addCartItem or removeCartItem instead.
   * 
   * @param cartState - Full cart state from stream
   */
  const updateCart = (cartState: CartState) => {
    // Set entire cart state from stream
    dispatchCartAction({
      type: 'SET_CART',
      payload: cartState,
    });
  };

  /**
   * Add a cart item from streamed data
   * 
   * @param product - Product to add to cart
   * @param quantity - Quantity to add (default: 1)
   */
  const addCartItem = (product: Product, quantity: number = 1) => {
    dispatchCartAction({
      type: 'ADD_TO_CART',
      payload: product,
    });
    
    // If quantity > 1, increase it
    if (quantity > 1) {
      for (let i = 1; i < quantity; i++) {
        dispatchCartAction({
          type: 'INCREASE_QUANTITY',
          payload: product.id,
        });
      }
    }
  };

  /**
   * Remove a cart item from streamed data
   * 
   * @param productId - Product ID to remove
   */
  const removeCartItem = (productId: string) => {
    dispatchCartAction({
      type: 'REMOVE_FROM_CART',
      payload: productId,
    });
  };

  return {
    updateCart,
    addCartItem,
    removeCartItem,
  };
}

