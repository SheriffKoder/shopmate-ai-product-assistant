/**
 * @file features/shop-assistant/schema/store-request-schema.ts
 * Zod schema and validation for structured store request extraction.
 * Used in: request-extraction-agent.ts and ShopMate runtime.
 * Used for: Rejecting unsafe or unsupported model-extracted constraints.
 */

import { z } from 'zod';
import type { StoreRequest } from '../model/store-request';

const supportedCategories = new Set(['smartphone', 'laptop', 'tablet', 'smartwatch', 'headphones']);
const supportedSortModes = new Set(['relevance', 'rating', 'price-low', 'price-high', 'reviews', 'name']);

/** Structured output schema supplied to the LLM extractor. */
export const storeRequestSchema = z.object({
  intent: z.enum([
    'product-search',
    'product-lookup',
    'recommendation',
    'comparison',
    'filtering',
    'table',
    'availability',
    'cart',
    'store-policy',
    'clarification',
    'unrelated',
  ]),
  catalogQuery: z.string().min(1),
  productTerms: z.array(z.string()),
  category: z.string().nullable(),
  useCase: z.string().nullable(),
  constraints: z.object({
    minPrice: z.number().nullable(),
    maxPrice: z.number().nullable(),
    colors: z.array(z.string()),
    features: z.array(z.string()),
    sortBy: z.enum(['relevance', 'rating', 'price-low', 'price-high', 'reviews', 'name']).nullable(),
  }),
  outputFormat: z.enum(['conversation', 'product-cards', 'comparison', 'table']),
});

/** Normalize and validate model output before it can constrain catalog lookup. */
export function validateStoreRequest(request: StoreRequest): StoreRequest {
  const normalizeList = (values: string[]) => [...new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean))];
  const normalizePrice = (value: number | null) => (
    value === null || !Number.isFinite(value) || value < 0 ? null : value
  );
  const normalizedCategory = request.category?.trim().toLowerCase() || null;

  return {
    ...request,
    catalogQuery: request.catalogQuery.trim() || request.productTerms.join(' '),
    productTerms: normalizeList(request.productTerms),
    category: normalizedCategory && supportedCategories.has(normalizedCategory) ? normalizedCategory : null,
    useCase: request.useCase?.trim() || null,
    constraints: {
      ...request.constraints,
      minPrice: normalizePrice(request.constraints.minPrice),
      maxPrice: normalizePrice(request.constraints.maxPrice),
      colors: normalizeList(request.constraints.colors),
      features: normalizeList(request.constraints.features),
      sortBy: request.constraints.sortBy && supportedSortModes.has(request.constraints.sortBy)
        ? request.constraints.sortBy
        : null,
    },
  };
}
