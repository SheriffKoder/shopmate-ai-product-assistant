/**
 * Shadow Products Page Data
 *
 * Purpose: Loads data for the server-first products listing route.
 * Used in: views/products/index.tsx
 * Used for: Keeps products pages focused on rendering DB-backed catalog data.
 */

import 'server-only';

import type { ShadowCategory } from '@/entities/category/model/category';
import { getShadowCategories } from '@/entities/category/queries/category-queries';
import type { ShadowProduct } from '@/entities/product/model/product';
import { getShadowProducts } from '@/entities/product/queries/product-queries';

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
