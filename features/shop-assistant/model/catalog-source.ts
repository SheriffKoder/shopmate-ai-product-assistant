/**
 * @file features/shop-assistant/model/catalog-source.ts
 * Catalog source contract: describes ShopMate product reads for assistant tools.
 * Used in: ShopMate runtime, product search tool, and catalog source implementations.
 * Used for: Keeping assistant search callers independent from mock/session data or future DB filters.
 */

import type { Product } from '@/features/shop/model/product';

/**
 * Sort modes supported by assistant catalog searches.
 */
export type CatalogSearchSort = 'relevance' | 'rating' | 'price-low' | 'price-high' | 'reviews' | 'name';

/**
 * Structured product search input extracted by AI tools before deterministic querying.
 */
export interface CatalogSearchInput {
  /** Natural-language query preserved for keyword matching and AI ranking. */
  query: string;
  /** Optional product category filter such as smartphone, laptop, tablet, or headphones. */
  category?: string;
  /** Minimum product price, inclusive. */
  minPrice?: number;
  /** Maximum product price, inclusive. */
  maxPrice?: number;
  /** Optional color filter matched against product color labels. */
  color?: string;
  /** Minimum rating, inclusive. */
  minRating?: number;
  /** Additional keywords or feature terms extracted from the user query. */
  keywords?: string[];
  /** Maximum products returned to the assistant. */
  limit?: number;
  /** Deterministic sort applied after filtering and ranking. */
  sortBy?: CatalogSearchSort;
}

/**
 * Catalog context request used when agents need a compact product summary.
 */
export interface CatalogContextInput {
  /** User query used to choose the smallest useful product context. */
  query: string;
  /** Maximum products included in prompt context. */
  limit?: number;
}

/**
 * Catalog source abstraction for current mock data and future DB-backed filters.
 */
export interface CatalogSource {
  /** Search products with structured filters and optional AI relevance ranking. */
  searchProducts(input: CatalogSearchInput): Promise<Product[]>;
  /** Build compact prompt context without exposing the whole catalog by default. */
  getProductContext(input: CatalogContextInput): Promise<Product[]>;
  /** Read one product by id for future actions/renderers. */
  getProductById(id: string): Promise<Product | null>;
}
