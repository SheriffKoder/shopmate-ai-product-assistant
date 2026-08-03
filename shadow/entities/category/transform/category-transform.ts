/**
 * Shadow Category Transform
 *
 * Purpose: Converts shadow category database rows into domain categories.
 * Used in: shadow category repositories.
 * Used for: Keeps DB naming and validation out of server page composition.
 */

import type { ShadowCategory, ShadowCategoryRow } from '@/shadow/entities/category/model/category';
import { shadowCategoryRowSchema, shadowCategorySchema } from '@/shadow/entities/category/schema/category-schema';

/**
 * Converts one Supabase category row into a shadow category domain object.
 *
 * @param row - Raw category row from Supabase.
 * @returns A validated shadow category.
 */
export function transformShadowCategoryRow(row: ShadowCategoryRow): ShadowCategory {
  const parsedRow = shadowCategoryRowSchema.parse(row);

  return shadowCategorySchema.parse({
    id: parsedRow.id,
    slug: parsedRow.slug,
    name: parsedRow.name,
    description: parsedRow.description,
    sortOrder: parsedRow.sort_order,
  });
}
