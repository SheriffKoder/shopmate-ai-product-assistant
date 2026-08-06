/**
 * Product Transform
 *
 * Purpose: Converts product database rows into domain products.
 * Used in: product repositories.
 * Used for: Keeps DB naming and validation out of server page composition.
 */

import type { Product, ProductRow } from '@/entities/product/model/product';
import { productRowSchema, productSchema } from '@/entities/product/schema/product-schema';

/**
 * Converts one Supabase product row into a product domain object.
 *
 * @param row - Raw product row from Supabase with its category slug relation.
 * @returns A validated product.
 */
export function transformProductRow(row: ProductRow): Product {
  const parsedRow = productRowSchema.parse(row);

  if (!parsedRow.category?.slug) {
    throw new Error(` product ${parsedRow.slug} is missing its category relation.`);
  }

  return productSchema.parse({
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
