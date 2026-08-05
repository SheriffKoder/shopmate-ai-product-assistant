/**
 * Shadow Category Repository
 *
 * Purpose: Reads shadow category rows from Supabase.
 * Used in: shadow category query use cases.
 * Used for: Isolates database access from views and routes.
 */

import 'server-only';

import { createShadowServiceClient } from '@/shared/supabase/server/create-shadow-service-client';
import type { ShadowCategory, ShadowCategoryRow, ShadowCategorySlugParam } from '@/entities/category/model/category';
import { transformShadowCategoryRow } from '@/entities/category/transform/category-transform';
import { getShadowCatalogTableNames } from '@/shared/config/table-names';

const SHADOW_CATEGORY_COLUMNS = 'id, slug, name, description, sort_order';

/**
 * Lists active shadow categories in display order.
 *
 * @returns Active shadow categories.
 */
export async function listShadowCategories(): Promise<ShadowCategory[]> {
  const supabase = createShadowServiceClient();
  const tableNames = getShadowCatalogTableNames();
  const { data, error } = await supabase
    .from(tableNames.categories)
    .select(SHADOW_CATEGORY_COLUMNS)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('slug', { ascending: true });

  if (error) {
    throw new Error(`Failed to list shadow categories: ${error.message}`);
  }

  return ((data ?? []) as ShadowCategoryRow[]).map(transformShadowCategoryRow);
}

/**
 * Finds one active shadow category by slug.
 *
 * @param params - Category slug lookup params.
 * @returns The matching shadow category, or null when missing.
 */
export async function getShadowCategoryBySlug(params: ShadowCategorySlugParam): Promise<ShadowCategory | null> {
  const supabase = createShadowServiceClient();
  const tableNames = getShadowCatalogTableNames();
  const { data, error } = await supabase
    .from(tableNames.categories)
    .select(SHADOW_CATEGORY_COLUMNS)
    .eq('is_active', true)
    .eq('slug', params.slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get shadow category ${params.slug}: ${error.message}`);
  }

  return data ? transformShadowCategoryRow(data as ShadowCategoryRow) : null;
}

/**
 * Lists active category slugs for static params.
 *
 * @returns Category slug params.
 */
export async function listShadowCategorySlugs(): Promise<ShadowCategorySlugParam[]> {
  const categories = await listShadowCategories();

  return categories.map(function mapCategorySlug(category) {
    return { slug: category.slug };
  });
}
