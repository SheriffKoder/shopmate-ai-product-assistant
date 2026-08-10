/**
 * @file features/shop-assistant/model/store-request.ts
 * Structured request model returned by the store request extraction agent.
 * Used in: request extraction, catalog lookup, and route planning.
 * Used for: Separating user intent from catalog data and mutation identity.
 */

import type { StoreIntent } from './assistant-intent';

export type StoreOutputFormat = 'conversation' | 'product-cards' | 'comparison' | 'table';
export type StoreSortMode = 'relevance' | 'rating' | 'price-low' | 'price-high' | 'reviews' | 'name';

/** Structured, catalog-safe interpretation of one user request. */
export interface StoreRequest {
  intent: StoreIntent;
  /** Concise search wording produced for the catalog source, not a product fact. */
  catalogQuery: string;
  productTerms: string[];
  category: string | null;
  useCase: string | null;
  constraints: {
    minPrice: number | null;
    maxPrice: number | null;
    colors: string[];
    features: string[];
    sortBy: StoreSortMode | null;
  };
  outputFormat: StoreOutputFormat;
}
