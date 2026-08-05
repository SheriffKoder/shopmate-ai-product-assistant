/**
 * Shadow Product Transform
 *
 * Purpose: Converts shadow product database rows into domain products.
 * Used in: shadow product repositories.
 * Used for: Keeps DB naming and validation out of server page composition.
 */

import type { ShadowProduct, ShadowProductRow } from '@/entities/product/model/product';
import { shadowProductRowSchema, shadowProductSchema } from '@/entities/product/schema/product-schema';

/**
 * Converts one Supabase product row into a shadow product domain object.
 *
 * @param row - Raw product row from Supabase with its category slug relation.
 * @returns A validated shadow product.
 */
export function transformShadowProductRow(row: ShadowProductRow): ShadowProduct {
  const parsedRow = shadowProductRowSchema.parse(row);

  if (!parsedRow.category?.slug) {
    throw new Error(`Shadow product ${parsedRow.slug} is missing its category relation.`);
  }

  return shadowProductSchema.parse({
    id: parsedRow.id,
    slug: parsedRow.slug,
    categoryId: parsedRow.category_id,
    categorySlug: parsedRow.category.slug,
    name: parsedRow.name,
    shortDescription: parsedRow.short_description,
    description: parsedRow.description,
    price: Number(parsedRow.price),
    rating: Number(parsedRow.rating),
    reviewsCount: parsedRow.reviews_count,
    features: parsedRow.features,
    imageUrl: parsedRow.image_url,
    imageUrlVariations: parsedRow.image_url_variations ?? [],
    isFeatured: parsedRow.is_featured,
    keywords: parsedRow.keywords ?? [],
    colors: parsedRow.colors ?? [],
  });
}
