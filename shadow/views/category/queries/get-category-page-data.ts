/**
 * Shadow Category Page Data
 *
 * Purpose: Loads data for one server-first category page.
 * Used in: shadow/views/category/index.tsx
 * Used for: Keeps category lookup and category product selection outside the route file.
 */

import 'server-only';

import type { ShadowCategory } from '@/shadow/entities/category/model/category';
import { getShadowCategory } from '@/shadow/entities/category/queries/category-queries';
import type { ShadowProduct } from '@/shadow/entities/product/model/product';
import { getShadowProducts } from '@/shadow/entities/product/queries/product-queries';

export type ShadowCategoryPageData = {
  category: ShadowCategory | null;
  products: ShadowProduct[];
};

/**
 * Loads one category and its active products.
 *
 * @param slug - Category slug from the route.
 * @returns Category data and matching products.
 */
export async function getShadowCategoryPageData(slug: string): Promise<ShadowCategoryPageData> {
  const [category, products] = await Promise.all([getShadowCategory({ slug }), getShadowProducts()]);

  return {
    category,
    products: products.filter(function filterCategoryProduct(product) {
      return product.categorySlug === slug;
    }),
  };
}
