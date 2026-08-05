/**
 * Product Repository
 *
 * Purpose: Reads product rows from Supabase.
 * Used in: product query use cases.
 * Used for: Isolates database access from views and routes.
 */

import 'server-only';

import { createSupabaseServiceClient } from '@/shared/supabase/server/create-service-client';
import type { Product, ProductRow, ProductSlugParam } from '@/entities/product/model/product';
import { transformProductRow } from '@/entities/product/transform/product-transform';
import { getCatalogTableNames } from '@/shared/config/table-names';

/**
 * Builds product columns with a dynamic category relation table name.
 *
 * @param categoryTableName - Prefixed category table name from runtime config.
 * @returns Supabase select columns for products.
 */
function getProductColumns(categoryTableName: string) {
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
 * Lists active products in stable slug order.
 *
 * @returns Active products.
 */
export async function listProducts(): Promise<Product[]> {
  const supabase = createSupabaseServiceClient();
  const tableNames = getCatalogTableNames();
  const productColumns = getProductColumns(tableNames.categories);
  const { data, error } = await supabase
    .from(tableNames.products)
    .select(productColumns)
    .eq('is_active', true)
    .order('slug', { ascending: true });

  if (error) {
    throw new Error(`Failed to list products: ${error.message}`);
  }

  return ((data ?? []) as unknown as ProductRow[]).map(transformProductRow);
}

/**
 * Lists active featured products in stable slug order.
 *
 * @returns Active featured products.
 */
export async function listFeaturedProducts(): Promise<Product[]> {
  const supabase = createSupabaseServiceClient();
  const tableNames = getCatalogTableNames();
  const productColumns = getProductColumns(tableNames.categories);
  const { data, error } = await supabase
    .from(tableNames.products)
    .select(productColumns)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('slug', { ascending: true });

  if (error) {
    throw new Error(`Failed to list featured products: ${error.message}`);
  }

  return ((data ?? []) as unknown as ProductRow[]).map(transformProductRow);
}

/**
 * Finds one active product by slug.
 *
 * @param params - Product slug lookup params.
 * @returns The matching product, or null when missing.
 */
export async function getProductBySlug(params: ProductSlugParam): Promise<Product | null> {
  const supabase = createSupabaseServiceClient();
  const tableNames = getCatalogTableNames();
  const productColumns = getProductColumns(tableNames.categories);
  const { data, error } = await supabase
    .from(tableNames.products)
    .select(productColumns)
    .eq('is_active', true)
    .eq('slug', params.slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get product ${params.slug}: ${error.message}`);
  }

  return data ? transformProductRow(data as unknown as ProductRow) : null;
}

/**
 * Lists active product slugs for static params.
 *
 * @returns Product slug params.
 */
export async function listProductSlugs(): Promise<ProductSlugParam[]> {
  const products = await listProducts();

  return products.map(function mapProductSlug(product) {
    return { slug: product.slug };
  });
}
