/**
 * Shadow Product Schema
 *
 * Purpose: Validates shadow product rows and domain objects.
 * Used in: shadow product transforms and future seed validation.
 * Used for: Protects server-first pages from malformed catalog data.
 */

import { z } from 'zod';
import { shadowLocalizedListSchema, shadowLocaleTextSchema } from '@/shadow/entities/category/schema/category-schema';

export const shadowProductSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  categoryId: z.string().uuid(),
  categorySlug: z.string().min(1),
  name: shadowLocaleTextSchema,
  shortDescription: shadowLocaleTextSchema,
  description: shadowLocaleTextSchema,
  price: z.number().nonnegative(),
  rating: z.number().min(0).max(5),
  reviewsCount: z.number().int().nonnegative(),
  features: shadowLocalizedListSchema,
  imageUrl: z.string().nullable(),
  imageUrlVariations: z.array(z.string()),
  isFeatured: z.boolean(),
  keywords: z.array(z.string()),
  colors: z.array(z.string()),
});

export const shadowProductRowSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  category_id: z.string().uuid(),
  name: shadowLocaleTextSchema,
  short_description: shadowLocaleTextSchema,
  description: shadowLocaleTextSchema,
  price: z.union([z.number(), z.string()]),
  rating: z.union([z.number(), z.string()]),
  reviews_count: z.number().int().nonnegative(),
  features: shadowLocalizedListSchema,
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
