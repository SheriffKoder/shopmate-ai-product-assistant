/**
 * Product Schema
 *
 * Purpose: Validates product rows and domain objects.
 * Used in: product transforms and future seed validation.
 * Used for: Protects server-first pages from malformed catalog data.
 */

import { z } from 'zod';
import { localizedListSchema, localeTextSchema } from '@/entities/category/schema/category-schema';

export const productSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  categoryId: z.string().uuid(),
  categorySlug: z.string().min(1),
  name: localeTextSchema,
  shortDescription: localeTextSchema,
  description: localeTextSchema,
  price: z.number().nonnegative(),
  rating: z.number().min(0).max(5),
  reviewsCount: z.number().int().nonnegative(),
  features: localizedListSchema,
  imageUrl: z.string().nullable(),
  imageUrlVariations: z.array(z.string()),
  isFeatured: z.boolean(),
  keywords: z.array(z.string()),
  colors: z.array(z.string()),
});

export const productRowSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  category_id: z.string().uuid(),
  name: localeTextSchema,
  short_description: localeTextSchema,
  description: localeTextSchema,
  price: z.union([z.number(), z.string()]),
  rating: z.union([z.number(), z.string()]),
  reviews_count: z.number().int().nonnegative(),
  features: localizedListSchema,
  image_url: z.string().nullable(),
  image_url_variations: z.array(z.string()).nullable(),
  is_featured: z.boolean(),
  keywords: z.array(z.string()).nullable(),
  colors: z.array(z.string()).nullable(),
  category: z
    .object({
      slug: z.string().min(1),
    })
    .nullable(),
});
