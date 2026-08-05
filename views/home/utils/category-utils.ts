/**
 * Category Utility Functions
 * 
 * Purpose: Utility functions for category-related operations
 * Used in: CategoryCard, HeaderCategories
 * Why: Centralizes category logic for reusability
 */

import type { Product } from '@/features/catalog/model/product';

/**
 * Get the first product image URL for a given category
 * @param category - The category to search for
 * @param products - Array of products to search through
 * @returns The image URL of the first product matching the category, or null if not found
 */
export function getFirstProductImageByCategory(
  category: string,
  products: Product[]
): string | null {
  const product = products.find(
    (p) => p.category.toLowerCase() === category.toLowerCase()
  );

  return product?.image_url || null;
}
