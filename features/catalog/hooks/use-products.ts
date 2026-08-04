/** Catalog product hook backed by the Shop products API. */
'use client';

import { useProductsAPI } from '@/features/catalog/client/use-products-api-swr';

/** Exposes catalog data without exposing cart or ShopProvider concerns. */
export function useProducts() {
  const { products } = useProductsAPI();
  return { products };
}
