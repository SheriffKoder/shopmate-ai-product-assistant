/**
 * use-products-api Hook (SWR-based)
 * 
 * Purpose: Fetch products from API using SWR
 * Used in: ShopProvider (replaces useProducts)
 * Why: Enables SWR usage and database-ready architecture
 * 
 * Development: Uses sessionStorage directly (client-side)
 * Production: Will use API routes with database
 */

'use client';

import useSWR from 'swr';
import { storage, STORAGE_KEYS, initStorage } from '@/lib/storage/session-storage';
import { getInitialProducts } from '@/features/catalog/model/initial-data';
import type { Product } from '@/features/catalog/model/product';

/**
 * Fetcher function for SWR
 * 
 * Development: Reads from sessionStorage directly
 * Production: Will fetch from API route
 */
const fetcher = async (key: string): Promise<Product[]> => {
  // For development: use sessionStorage directly
  if (typeof window !== 'undefined') {
    const products = initStorage<Product[]>(
      STORAGE_KEYS.PRODUCTS,
      getInitialProducts()
    );
    return products;
  }

  // For server-side or production: fetch from API
  const response = await fetch('/api/shop/products');
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
};

/**
 * Mutate function for updating products
 */
const updateProducts = async (newProducts: Product[]): Promise<Product[]> => {
  // For development: update sessionStorage directly
  if (typeof window !== 'undefined') {
    storage.set(STORAGE_KEYS.PRODUCTS, newProducts);
    return newProducts;
  }

  // For production: update via API
  const response = await fetch('/api/shop/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ products: newProducts }),
  });

  if (!response.ok) {
    throw new Error('Failed to update products');
  }

  const result = await response.json();
  return result.products;
};

/**
 * Hook for fetching products with SWR
 * 
 * @returns Products data, loading state, error, and update function
 */
export function useProductsAPI() {
  const { data, error, isLoading, mutate } = useSWR<Product[]>(
    'products', // Cache key
    fetcher,
    {
      fallbackData: getInitialProducts(), // Initial data
      revalidateOnFocus: false, // Don't refetch on window focus
      revalidateOnReconnect: false, // Don't refetch on reconnect
    }
  );

  /**
   * Update products
   */
  const updateProductsData = async (newProducts: Product[]) => {
    // Optimistic update
    await mutate(updateProducts(newProducts), {
      optimisticData: newProducts,
      rollbackOnError: true,
    });
  };

  return {
    products: data || getInitialProducts(),
    isLoading,
    error,
    updateProducts: updateProductsData,
    mutate, // Expose mutate for manual revalidation
  };
}
