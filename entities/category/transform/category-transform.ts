/**
 * Category Transform
 *
 * Purpose: Converts category database rows into domain categories.
 * Used in: category repositories.
 * Used for: Keeps DB naming and validation out of server page composition.
 */

import type { Category, CategoryRow } from '@/entities/category/model/category';
import { categoryRowSchema, categorySchema } from '@/entities/category/schema/category-schema';

/**
 * Converts one Supabase category row into a category domain object.
 *
 * @param row - Raw category row from Supabase.
 * @returns A validated category.
 */
export function transformCategoryRow(row: CategoryRow): Category {
  const parsedRow = categoryRowSchema.parse(row);

  return categorySchema.parse({
    id: parsedRow.id,
    slug: parsedRow.slug,
    name: parsedRow.name,
    description: parsedRow.description,
    sortOrder: parsedRow.sort_order,
  });
}
