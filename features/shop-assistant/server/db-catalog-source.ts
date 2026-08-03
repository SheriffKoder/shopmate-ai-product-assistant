/**
 * @file features/shop-assistant/server/db-catalog-source.ts
 * DB catalog source placeholder: documents the future Supabase/Postgres filtering boundary.
 * Used in: Future ShopMate runtime data-source selection.
 * Used for: Showing exactly where mock catalog reads will be replaced without changing assistant tools.
 */

import type { CatalogSearchInput, CatalogSource } from '@/features/shop-assistant/model/catalog-source';

/**
 * Creates the future DB-backed catalog source.
 *
 * TODO: Implement with Supabase/Postgres once the live catalog schema is promoted.
 * Filter mapping:
 * - `category` -> equality or IN predicate on category slug/name.
 * - `minPrice` / `maxPrice` -> numeric range predicates on price.
 * - `color` -> array/JSON containment or joined product variant predicate.
 * - `minRating` -> numeric predicate on aggregate rating.
 * - `keywords` / `query` -> full-text search over name, description, features, and keywords.
 * - `limit` / `sortBy` -> SQL limit and deterministic order clause.
 */
export function createDbCatalogSource(): CatalogSource {
  return {
    async searchProducts(input: CatalogSearchInput) {
      throw new Error(`DB catalog source is not implemented yet for query: ${input.query}`);
    },
    async getProductContext(input) {
      throw new Error(`DB catalog context is not implemented yet for query: ${input.query}`);
    },
    async getProductById(id) {
      throw new Error(`DB catalog product lookup is not implemented yet for id: ${id}`);
    },
  };
}
