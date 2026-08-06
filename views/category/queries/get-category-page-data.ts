/**
 * Category Page Data
 *
 * Purpose: Loads data for one server-first category page.
 * Used in: views/category/index.tsx
 * Used for: Keeps category lookup and category product selection outside the route file.
 */

import 'server-only';

import type { Category } from '@/entities/category/model/category';
import { getCategories, getCategory } from '@/entities/category/queries/category-queries';
import type { Product } from '@/entities/product/model/product';
import { getProducts } from '@/entities/product/queries/product-queries';

export type CategoryPageData = {
  category: Category | null;
  categories: Category[];
  products: Product[];
};

/**
 * Loads one category and its active products.
 *
 * @param slug - Category slug from the route.
 * @returns Category data and matching products.
 */
export async function getCategoryPageData(slug: string): Promise<CategoryPageData> {
  const [category, categories, products] = await Promise.all([getCategory({ slug }), getCategories(), getProducts()]);

  return {
    category,
    categories,
    products: products.filter(function filterCategoryProduct(product) {
      return product.categorySlug === slug;
    }),
  };
}
