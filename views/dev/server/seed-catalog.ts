/**
 * Seed Catalog Action
 *
 * Purpose: Seeds catalog tables from development-only initial data.
 * Used in: views/dev/ui/dev-page.tsx
 * Used for: Populates Supabase data for server-first public pages.
 */

'use server';

import { initialCategories, initialProducts } from '@/shadow/development/initial-data/products';
import { getCatalogTableNames } from '@/shared/config/table-names';
import { createSupabaseServiceClient } from '@/shared/supabase/server/create-service-client';
import { redirectDevActionResult } from '@/views/dev/lib/redirect-dev-action-result';
import { revalidatePublicPages } from '@/views/dev/server/revalidate-public-pages';

type SeedCategoryRow = {
  id: string;
  slug: string;
};

/**
 * Seeds categories and products into prefixed catalog tables.
 */
export async function seedCatalog() {
  const supabase = createSupabaseServiceClient();
  const tableNames = getCatalogTableNames();
  const categoryRows = initialCategories.map(function mapSeedCategory(category) {
    return {
      description: category.description,
      is_active: true,
      name: category.name,
      slug: category.slug,
      sort_order: category.sortOrder,
      updated_at: new Date().toISOString(),
    };
  });
  const { error: categoryError } = await supabase.from(tableNames.categories).upsert(categoryRows, {
    onConflict: 'slug',
  });

  if (categoryError) {
    redirectDevActionResult({
      message: `Failed to seed categories: ${categoryError.message}`,
      status: 'error',
    });
  }

  const { data: categories, error: categoryLookupError } = await supabase
    .from(tableNames.categories)
    .select('id, slug')
    .in(
      'slug',
      initialCategories.map(function mapCategorySlug(category) {
        return category.slug;
      }),
    );

  if (categoryLookupError) {
    redirectDevActionResult({
      message: `Failed to read seeded categories: ${categoryLookupError.message}`,
      status: 'error',
    });
  }

  const categoryIdsBySlug = new Map(
    ((categories ?? []) as SeedCategoryRow[]).map(function mapCategoryId(category) {
      return [category.slug, category.id];
    }),
  );
  const productRows = initialProducts.map(function mapSeedProduct(product) {
    const categoryId = categoryIdsBySlug.get(product.categorySlug);

    if (!categoryId) {
      throw new Error(`Missing category for product ${product.slug}.`);
    }

    return {
      category_id: categoryId,
      colors: product.colors,
      description: product.description,
      features: product.features,
      image_url: product.imageUrl,
      image_url_variations: product.imageUrlVariations,
      is_active: true,
      is_featured: product.isFeatured,
      keywords: product.keywords,
      name: product.name,
      price: product.price,
      rating: product.rating,
      reviews_count: product.reviewsCount,
      short_description: product.shortDescription,
      slug: product.slug,
      updated_at: new Date().toISOString(),
    };
  });
  const { error: productError } = await supabase.from(tableNames.products).upsert(productRows, {
    onConflict: 'slug',
  });

  if (productError) {
    redirectDevActionResult({
      message: `Failed to seed products: ${productError.message}`,
      status: 'error',
    });
  }

  revalidatePublicPages();

  redirectDevActionResult({
    message: `Seeded ${categoryRows.length} categories and ${productRows.length} products.`,
    status: 'success',
  });
}
