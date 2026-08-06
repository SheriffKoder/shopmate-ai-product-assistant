/**
 * Category Schema
 *
 * Purpose: Validates category rows and domain objects.
 * Used in: category transforms and future seed validation.
 * Used for: Protects server-first pages from malformed catalog data.
 */

import { z } from 'zod';

export const localeTextSchema = z.object({
  en: z.string().min(1),
  ar: z.string().min(1),
});

export const localizedListSchema = z.object({
  en: z.array(z.string().min(1)),
  ar: z.array(z.string().min(1)),
});

export const categorySchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  name: localeTextSchema,
  description: localeTextSchema.nullable(),
  sortOrder: z.number().int(),
});

export const categoryRowSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  name: localeTextSchema,
  description: localeTextSchema.nullable(),
  sort_order: z.number().int(),
});
