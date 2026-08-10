/**
 * @file features/shop-assistant/server/store-route-planner.ts
 * Priority route planner for store requests.
 * Used in: shop-assistant-runtime.ts and router.ts.
 * Used for: Mapping typed intents to the currently available ShopMate agents.
 */

import type { StoreIntent, StoreIntentResult } from '../model/assistant-intent';

/** Agent behavior currently available to the ShopMate router. */
export type PlannedAgent = 'products' | 'recommendation' | 'filtering' | 'cart' | 'policy' | 'clarification' | 'unrelated';

/** Planned route with explicit store lookup requirement. */
export interface StoreRoutePlan extends StoreIntentResult {
  requiresCatalogLookup: boolean;
  agent: PlannedAgent;
}

const agentForIntent: Record<StoreIntent, PlannedAgent> = {
  'product-search': 'products',
  'product-lookup': 'products',
  recommendation: 'recommendation',
  comparison: 'recommendation',
  filtering: 'filtering',
  table: 'recommendation',
  availability: 'filtering',
  cart: 'cart',
  'store-policy': 'policy',
  clarification: 'clarification',
  unrelated: 'unrelated',
};

/** Build an explicit route from the extracted store intent. */
export function planStoreRoute(result: StoreIntentResult): StoreRoutePlan {
  const requiresCatalogLookup = [
    'product-search',
    'product-lookup',
    'recommendation',
    'comparison',
    'filtering',
    'table',
    'availability',
  ].includes(result.intent);

  return {
    ...result,
    requiresCatalogLookup,
    agent: agentForIntent[result.intent],
  };
}
