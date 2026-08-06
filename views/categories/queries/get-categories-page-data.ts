/**
 * Categories Page Data
 *
 * Purpose: Loads categories and their products for the categories landing page.
 * Used in: views/categories/index.tsx
 */

import 'server-only';

import { getCategories } from '@/entities/category/queries/category-queries';
import type { Category } from '@/entities/category/model/category';
import { getProducts } from '@/entities/product/queries/product-queries';
import type { Product } from '@/entities/product/model/product';

export type CategoriesPageData = {
  categories: Category[];
  products: Product[];
};

export async function getCategoriesPageData(): Promise<CategoriesPageData> {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  return { categories, products };
}
