/**
 * use-product-stream Hook
 * 
 * Purpose: Manages product state updates from DataStream
 * Used in: DataStreamHandler
 * Why: Separates stream processing logic from state management
 * 
 * This hook provides functions to update product state when streamed data arrives.
 * It integrates with the existing ShopProvider context to maintain a single source of truth.
 */

'use client';

import { useShop } from '@/features/ai-assistant/providers/shop-context';
import type { Product } from '../types/product';

/**
 * Hook for managing product state updates from streamed data
 * 
 * Provides functions to:
 * - Add products streamed from AI tools
 * - Update product lists
 * - Handle search status updates
 * 
 * @returns Functions to update product state from stream data
 */
export function useProductStream() {
  const { dispatchProductsAction } = useShop();

  /**
   * Add a product streamed from AI tool
   * 
   * @param product - Product to add
   */
  const addProduct = (product: Product) => {
    dispatchProductsAction({
      type: 'ADD_PRODUCT',
      payload: product,
    });
  };

  /**
   * Update product list with multiple products
   * 
   * @param products - Array of products to set
   */
  const updateProducts = (products: Product[]) => {
    dispatchProductsAction({
      type: 'SET_PRODUCTS',
      payload: products,
    });
  };

  /**
   * Add multiple products (append to existing list)
   * 
   * @param products - Array of products to add
   */
  const addProducts = (products: Product[]) => {
    products.forEach((product) => {
      addProduct(product);
    });
  };

  return {
    addProduct,
    updateProducts,
    addProducts,
  };
}

