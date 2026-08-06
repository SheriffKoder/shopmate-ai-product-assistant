/**
 * Category Repository
 *
 * Purpose: Reads category rows from Supabase.
 * Used in: category query use cases.
 * Used for: Isolates database access from views and routes.
 */

import 'server-only';

import { createSupabaseServiceClient } from '@/shared/infrastructure/supabase/server/create-service-client';
import type { Category, CategoryRow, CategorySlugParam } from '@/entities/category/model/category';
import { transformCategoryRow } from '@/entities/category/transform/category-transform';
import { getCatalogTableNames } from '@/shared/config/table-names';

const CATEGORY_COLUMNS = 'id, slug, name, description, sort_order';

/**
 * Lists active categories in display order.
 *
 * @returns Active categories.
 */
export async function listCategories(): Promise<Category[]> {
  const supabase = createSupabaseServiceClient();
  const tableNames = getCatalogTableNames();
  const { data, error } = await supabase
    .from(tableNames.categories)
    .select(CATEGORY_COLUMNS)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('slug', { ascending: true });

  if (error) {
    throw new Error(`Failed to list categories: ${error.message}`);
  }

  return ((data ?? []) as CategoryRow[]).map(transformCategoryRow);
}

/**
 * Finds one active category by slug.
 *
 * @param params - Category slug lookup params.
 * @returns The matching category, or null when missing.
 */
export async function getCategoryBySlug(params: CategorySlugParam): Promise<Category | null> {
  const supabase = createSupabaseServiceClient();
  const tableNames = getCatalogTableNames();
  const { data, error } = await supabase
    .from(tableNames.categories)
    .select(CATEGORY_COLUMNS)
    .eq('is_active', true)
    .eq('slug', params.slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get category ${params.slug}: ${error.message}`);
  }

  return data ? transformCategoryRow(data as CategoryRow) : null;
}

/**
 * Lists active category slugs for static params.
 *
 * @returns Category slug params.
 */
export async function listCategorySlugs(): Promise<CategorySlugParam[]> {
  const categories = await listCategories();

  return categories.map(function mapCategorySlug(category) {
    return { slug: category.slug };
  });
}
