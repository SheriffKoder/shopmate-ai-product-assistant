/**
 * Shadow Products Page Data
 *
 * Purpose: Loads data for the server-first products listing route.
 * Used in: shadow/views/products/index.tsx
 * Used for: Keeps products pages focused on rendering DB-backed catalog data.
 */

import 'server-only';

import type { ShadowCategory } from '@/shadow/entities/category/model/category';
import { getShadowCategories } from '@/shadow/entities/category/queries/category-queries';
import type { ShadowProduct } from '@/shadow/entities/product/model/product';
import { getShadowProducts } from '@/shadow/entities/product/queries/product-queries';

export type ShadowProductsPageData = {
  categories: ShadowCategory[];
  products: ShadowProduct[];
};

/**
 * Loads products listing data.
 *
 * @returns Categories and products ready for rendering.
 */
export async function getShadowProductsPageData(): Promise<ShadowProductsPageData> {
  const [categories, products] = await Promise.all([getShadowCategories(), getShadowProducts()]);

  return {
    categories,
    products,
  };
}
