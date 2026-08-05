/**
 * Products Page Data
 *
 * Purpose: Loads data for the server-first products listing route.
 * Used in: views/products/index.tsx
 * Used for: Keeps products pages focused on rendering DB-backed catalog data.
 */

import 'server-only';

import type { Category } from '@/entities/category/model/category';
import { getCategories } from '@/entities/category/queries/category-queries';
import type { Product } from '@/entities/product/model/product';
import { getProducts } from '@/entities/product/queries/product-queries';

export type ProductsPageData = {
  categories: Category[];
  products: Product[];
};

/**
 * Loads products listing data.
 *
 * @returns Categories and products ready for rendering.
 */
export async function getProductsPageData(): Promise<ProductsPageData> {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  return {
    categories,
    products,
  };
}
