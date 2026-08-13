/**
 * @file features/shop-assistant/lib/catalog/runtime-lookup.ts
 * Pure lookup query / limit / title helpers for Shop Assistant.
 * Used in: shop-assistant-runtime.ts after planFromSchema.
 * Used for: Browse-all emptying, sheet vs card limits, and artifact titles. No I/O.
 *
 * Function Index:
 * resolveRuntimeLookup: Query + limit decision from schema + plan.
 * catalogRenderTitle: Sheet / card / document title from browse-all vs query.
 *
 * Steps:
 * 1. Browse-all wording or empty catalogQuery empties the lookup query.
 * 2. Conversation skips lookup. Schema view + metadata choose text / Find chips.
 * 3. Sheet uses a larger limit so the full matching catalog can render.
 * 4. Title prefers browse-all labels, else the user query for documents.
 */

import { isBrowseAllCatalogRequest } from './is-browse-all-catalog-request';
import type { AssistantRequest } from '../../model/assistant-request';
import type { ExecutionPlan } from '../../model/execution-plan';

/** Default card / conversation / document lookup size. */
export const DEFAULT_LOOKUP_LIMIT = 8;
/** Sheet artifacts need the full matching catalog, not a card-sized slice. */
export const SHEET_LOOKUP_LIMIT = 50;

/** Deterministic lookup inputs derived from schema + plan. */
export interface RuntimeLookupDecision {
  shouldLookup: boolean;
  browseAll: boolean;
  lookupQuery: string;
  limit: number;
}

/**
 * Decide whether to search, with which query, and how many rows.
 *
 * Empty catalogQuery is browse-all. Browse-all wording also empties invented keywords.
 * Conversation never looks up: speaker + optional Find chips from schema metadata.
 * Category stays on AssistantRequest and is passed separately to CatalogSource.
 *
 * @example
 * resolveRuntimeLookup({
 *   userQuery: 'All available products in a table',
 *   request: { action: 'catalog', catalogQuery: 'all products', category: null, view: 'sheet', constraints: DEFAULT_ASSISTANT_CONSTRAINTS },
 *   plan: planFromSchema({ action: 'catalog', view: 'sheet' }),
 * })
 * // { shouldLookup: true, browseAll: true, lookupQuery: '', limit: 50 }
 */
export function resolveRuntimeLookup(input: {
  userQuery: string;
  request: AssistantRequest;
  plan: Pick<ExecutionPlan, 'requiresCatalogLookup' | 'render'>;
}): RuntimeLookupDecision {
  // 1. Browse-all wording wins even if the labeler invented keywords.
  const browseAllWording = isBrowseAllCatalogRequest(input.userQuery);
  // 2. Empty catalogQuery is the schema signal for browse-all (category may still filter).
  const browseAll = browseAllWording || !input.request.catalogQuery.trim();
  const lookupQuery = browseAll ? '' : input.request.catalogQuery.trim();
  const limit = input.plan.render === 'sheet' ? SHEET_LOOKUP_LIMIT : DEFAULT_LOOKUP_LIMIT;

  return {
    // view: conversation is discussion, not a product listing. Schema metadata owns Find chips.
    shouldLookup: input.plan.requiresCatalogLookup && input.plan.render !== 'conversation',
    browseAll,
    lookupQuery,
    limit,
  };
}

/**
 * Artifact / card title from browse-all vs a specific lookup.
 *
 * @example
 * catalogRenderTitle(true, 'sheet', 'All available products in a table')
 * // 'All available ShopMate products'
 */
export function catalogRenderTitle(
  browseAll: boolean,
  render: 'cards' | 'sheet' | 'document',
  userQuery: string,
): string {
  if (browseAll) {
    return render === 'document' ? 'ShopMate product catalog' : 'All available ShopMate products';
  }
  if (render === 'document') {
    return userQuery.trim() || 'ShopMate buying guide';
  }
  return 'ShopMate products';
}
