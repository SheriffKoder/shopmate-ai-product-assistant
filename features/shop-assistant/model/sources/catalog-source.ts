/**
 * @file features/shop-assistant/model/sources/catalog-source.ts
 * Catalog source contract: deterministic ShopMate product reads.
 * Used in: shop-assistant runtime, mock Shop API adapters, and lookup tests.
 * Used for: Keeping search callers independent from mock data or a future DB filter.
 *
 * Function Index:
 * CatalogSearchSort: Deterministic sort modes after matching.
 * CatalogSearchInput: Structured lookup input (query + filters).
 * CatalogContextInput: Compact prompt-context read.
 * CatalogSource: Search / context / get-by-id abstraction.
 *
 * Steps:
 * 1. Runtime passes schema filters into searchProducts.
 * 2. Implementation matches unique catalog values (no AI ranking).
 * 3. Callers render from returned rows; they do not search again.
 */

import type { Product } from '@/features/catalog/model/product';

/** Sort modes supported by assistant catalog searches. */
export type CatalogSearchSort =
  | 'relevance'
  | 'rating'
  | 'price-low'
  | 'price-high'
  | 'reviews'
  | 'name';

/** Structured product search input used by deterministic lookup. */
export interface CatalogSearchInput {
  /** Natural-language query for unique category / name matching. Empty = browse-all. */
  query: string;
  /** Optional product category filter such as smartphone, laptop, tablet, or headphones. */
  category?: string;
  /** Minimum product price, inclusive. */
  minPrice?: number;
  /** Maximum product price, inclusive. */
  maxPrice?: number;
  /** Optional color filter matched against product color labels. */
  color?: string;
  /** Optional multi-color filter. Any listed color may match. */
  colors?: string[];
  /** Minimum rating, inclusive. */
  minRating?: number;
  /** Additional feature terms extracted from the user query. */
  keywords?: string[];
  /** Maximum products returned to the assistant. */
  limit?: number;
  /** Deterministic sort applied after filtering. */
  sortBy?: CatalogSearchSort;
}

/** Catalog context request used when a speaker needs a compact product summary. */
export interface CatalogContextInput {
  /** User query used to choose the smallest useful product context. */
  query: string;
  /** Maximum products included in prompt context. */
  limit?: number;
}

/** Catalog source abstraction for mock data and future DB-backed filters. */
export interface CatalogSource {
  /** Search products with structured filters. Deterministic; no AI ranking. */
  searchProducts(input: CatalogSearchInput): Promise<Product[]>;
  /** Build compact prompt context without exposing the whole catalog by default. */
  getProductContext(input: CatalogContextInput): Promise<Product[]>;
  /** Read one product by id for future actions/renderers. */
  getProductById(id: string): Promise<Product | null>;
}
