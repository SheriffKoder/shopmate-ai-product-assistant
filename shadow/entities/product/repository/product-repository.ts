/**
 * Shadow Product Repository
 *
 * Purpose: Reads shadow product rows from Supabase.
 * Used in: shadow product query use cases.
 * Used for: Isolates database access from views and routes.
 */

import 'server-only';

import { createShadowServiceClient } from '@/shadow/shared/supabase/server/create-shadow-service-client';
import type { ShadowProduct, ShadowProductRow, ShadowProductSlugParam } from '@/shadow/entities/product/model/product';
import { transformShadowProductRow } from '@/shadow/entities/product/transform/product-transform';
import { getShadowCatalogTableNames } from '@/shadow/shared/config/table-names';

/**
 * Builds product columns with a dynamic category relation table name.
 *
 * @param categoryTableName - Prefixed category table name from runtime config.
 * @returns Supabase select columns for shadow products.
 */
function getShadowProductColumns(categoryTableName: string) {
  return `
    id,
    slug,
    category_id,
    name,
    short_description,
    description,
    price,
    rating,
    reviews_count,
    features,
    image_url,
    image_url_variations,
    is_featured,
    keywords,
    colors,
    category:${categoryTableName}!inner(slug)
  `;
}

/**
 * Lists active shadow products in stable slug order.
 *
 * @returns Active shadow products.
 */
export async function listShadowProducts(): Promise<ShadowProduct[]> {
  const supabase = createShadowServiceClient();
  const tableNames = getShadowCatalogTableNames();
  const productColumns = getShadowProductColumns(tableNames.categories);
  const { data, error } = await supabase
    .from(tableNames.products)
    .select(productColumns)
    .eq('is_active', true)
    .order('slug', { ascending: true });

  if (error) {
    throw new Error(`Failed to list shadow products: ${error.message}`);
  }

  return ((data ?? []) as unknown as ShadowProductRow[]).map(transformShadowProductRow);
}

/**
 * Lists active featured shadow products in stable slug order.
 *
 * @returns Active featured shadow products.
 */
export async function listShadowFeaturedProducts(): Promise<ShadowProduct[]> {
  const supabase = createShadowServiceClient();
  const tableNames = getShadowCatalogTableNames();
  const productColumns = getShadowProductColumns(tableNames.categories);
  const { data, error } = await supabase
    .from(tableNames.products)
    .select(productColumns)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('slug', { ascending: true });

  if (error) {
    throw new Error(`Failed to list shadow featured products: ${error.message}`);
  }

  return ((data ?? []) as unknown as ShadowProductRow[]).map(transformShadowProductRow);
}

/**
 * Finds one active shadow product by slug.
 *
 * @param params - Product slug lookup params.
 * @returns The matching shadow product, or null when missing.
 */
export async function getShadowProductBySlug(params: ShadowProductSlugParam): Promise<ShadowProduct | null> {
  const supabase = createShadowServiceClient();
  const tableNames = getShadowCatalogTableNames();
  const productColumns = getShadowProductColumns(tableNames.categories);
  const { data, error } = await supabase
    .from(tableNames.products)
    .select(productColumns)
    .eq('is_active', true)
    .eq('slug', params.slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get shadow product ${params.slug}: ${error.message}`);
  }

  return data ? transformShadowProductRow(data as unknown as ShadowProductRow) : null;
}

/**
 * Lists active product slugs for static params.
 *
 * @returns Product slug params.
 */
export async function listShadowProductSlugs(): Promise<ShadowProductSlugParam[]> {
  const products = await listShadowProducts();

  return products.map(function mapProductSlug(product) {
    return { slug: product.slug };
  });
}
