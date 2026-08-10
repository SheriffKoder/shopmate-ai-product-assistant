/**
 * @file features/shop-assistant/model/assistant-intent.ts
 * Store-first assistant intent contracts.
 * Used in: ShopMate intent extraction, route planning, and agent dispatch.
 * Used for: Making store behavior explicit before an agent is selected.
 */

/** Supported ShopMate request intents for catalog and store conversations. */
export type StoreIntent =
  | 'product-search'
  | 'product-lookup'
  | 'recommendation'
  | 'comparison'
  | 'filtering'
  | 'table'
  | 'availability'
  | 'cart'
  | 'store-policy'
  | 'clarification'
  | 'unrelated';

/** Entities extracted from a request before route selection. */
export interface StoreQueryEntities {
  productNames?: string[];
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  features?: string[];
  useCase?: string;
  sortBy?: string;
  wantsTable?: boolean;
  wantsComparison?: boolean;
}

/** Result of the deterministic store intent extraction pass. */
export interface StoreIntentResult {
  intent: StoreIntent;
  entities: StoreQueryEntities;
}
