/**
 * Seed Shadow Catalog Action
 *
 * Purpose: Seeds shadow catalog tables from development-only initial data.
 * Used in: views/dev/ui/dev-page.tsx
 * Used for: Populates Supabase data for server-first shadow public pages.
 */

'use server';

import { shadowInitialCategories, shadowInitialProducts } from '@/shadow/development/initial-data/products';
import { getShadowCatalogTableNames } from '@/shared/config/table-names';
import { createShadowServiceClient } from '@/shared/supabase/server/create-shadow-service-client';
import { redirectShadowDevActionResult } from '@/views/dev/lib/redirect-dev-action-result';
import { revalidateShadowPages } from '@/views/dev/server/revalidate-shadow-pages';

type ShadowSeedCategoryRow = {
  id: string;
  slug: string;
};

/**
 * Seeds categories and products into prefixed shadow catalog tables.
 */
export async function seedShadowCatalog() {
  const supabase = createShadowServiceClient();
  const tableNames = getShadowCatalogTableNames();
  const categoryRows = shadowInitialCategories.map(function mapSeedCategory(category) {
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
    redirectShadowDevActionResult({
      message: `Failed to seed shadow categories: ${categoryError.message}`,
      status: 'error',
    });
  }

  const { data: categories, error: categoryLookupError } = await supabase
    .from(tableNames.categories)
    .select('id, slug')
    .in(
      'slug',
      shadowInitialCategories.map(function mapCategorySlug(category) {
        return category.slug;
      }),
    );

  if (categoryLookupError) {
    redirectShadowDevActionResult({
      message: `Failed to read seeded shadow categories: ${categoryLookupError.message}`,
      status: 'error',
    });
  }

  const categoryIdsBySlug = new Map(
    ((categories ?? []) as ShadowSeedCategoryRow[]).map(function mapCategoryId(category) {
      return [category.slug, category.id];
    }),
  );
  const productRows = shadowInitialProducts.map(function mapSeedProduct(product) {
    const categoryId = categoryIdsBySlug.get(product.categorySlug);

    if (!categoryId) {
      throw new Error(`Missing shadow category for product ${product.slug}.`);
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
    redirectShadowDevActionResult({
      message: `Failed to seed shadow products: ${productError.message}`,
      status: 'error',
    });
  }

  revalidateShadowPages();

  redirectShadowDevActionResult({
    message: `Seeded ${categoryRows.length} shadow categories and ${productRows.length} shadow products.`,
    status: 'success',
  });
}
