/**
 * Shadow Category Schema
 *
 * Purpose: Validates shadow category rows and domain objects.
 * Used in: shadow category transforms and future seed validation.
 * Used for: Protects server-first pages from malformed catalog data.
 */

import { z } from 'zod';

export const shadowLocaleTextSchema = z.object({
  en: z.string().min(1),
  ar: z.string().min(1),
});

export const shadowLocalizedListSchema = z.object({
  en: z.array(z.string().min(1)),
  ar: z.array(z.string().min(1)),
});

export const shadowCategorySchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  name: shadowLocaleTextSchema,
  description: shadowLocaleTextSchema.nullable(),
  sortOrder: z.number().int(),
});

export const shadowCategoryRowSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  name: shadowLocaleTextSchema,
  description: shadowLocaleTextSchema.nullable(),
  sort_order: z.number().int(),
});
