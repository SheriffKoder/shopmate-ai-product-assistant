/**
 * @file features/shop-assistant/server/intent-extractor.ts
 * Deterministic first-pass extraction for store requests.
 * Used in: shop-assistant-runtime.ts before model-based routing.
 * Used for: Giving high-confidence store requests an explicit route.
 */

import type { StoreIntentResult } from '../model/assistant-intent';

const CATEGORY_PATTERN = /\b(smartphones?|iphones?|laptops?|tablets?|smartwatches?|headphones?|earbuds?)\b/i;
const PRICE_PATTERN = /(?:under|below|less than|up to)\s*\$?([\d,]+)/i;
const COMPARISON_PATTERN = /\b(compare|comparison|versus|\bvs\.?\b|difference between)\b/i;
const TABLE_PATTERN = /\b(table|spreadsheet|tabular|structured list)\b/i;
const AVAILABILITY_PATTERN = /\b(available|availability|in stock|do you have|stock)\b/i;
const CART_PATTERN = /\b(cart|checkout|add to|remove from|quantity|order total)\b/i;
const POLICY_PATTERN = /\b(return policy|refund|shipping|delivery|payment methods|warranty)\b/i;
const RECOMMENDATION_PATTERN = /\b(recommend|best|suggest|which should|what should|good for|ideal for)\b/i;
const FILTER_PATTERN = /\b(filter|only|cheapest|most expensive|rated|rating|under|below|between|budget|color|colour|with)\b/i;
const LOOKUP_PATTERN = /\b(tell me about|details|specifications|specs|how much|price of|what is)\b/i;

/** Map natural product labels to the catalog's canonical category values. */
function normalizeCategory(category: string) {
  const normalizedCategory = category.toLowerCase();
  if (/^(iphone|iphones|smartphone|smartphones|phone|phones)$/.test(normalizedCategory)) return 'smartphone';
  if (/^(laptop|laptops)$/.test(normalizedCategory)) return 'laptop';
  if (/^(tablet|tablets)$/.test(normalizedCategory)) return 'tablet';
  if (/^(smartwatch|smartwatches|watch|watches)$/.test(normalizedCategory)) return 'smartwatch';
  if (/^(headphone|headphones|earbud|earbuds)$/.test(normalizedCategory)) return 'headphones';
  return normalizedCategory;
}

/** Extract a small, stable set of routing entities from a user query. */
export function extractStoreIntent(query: string): StoreIntentResult {
  const normalizedQuery = query.trim();
  const categoryMatch = normalizedQuery.match(CATEGORY_PATTERN);
  const priceMatch = normalizedQuery.match(PRICE_PATTERN);
  const entities = {
    ...(categoryMatch ? { category: normalizeCategory(categoryMatch[1]) } : {}),
    ...(priceMatch ? { maxPrice: Number(priceMatch[1].replace(/,/g, '')) } : {}),
    ...(TABLE_PATTERN.test(normalizedQuery) ? { wantsTable: true } : {}),
    ...(COMPARISON_PATTERN.test(normalizedQuery) ? { wantsComparison: true } : {}),
  };

  let intent: StoreIntentResult['intent'] = 'unrelated';
  if (CART_PATTERN.test(normalizedQuery)) intent = 'cart';
  else if (POLICY_PATTERN.test(normalizedQuery)) intent = 'store-policy';
  else if (TABLE_PATTERN.test(normalizedQuery)) intent = 'table';
  else if (COMPARISON_PATTERN.test(normalizedQuery)) intent = 'comparison';
  else if (AVAILABILITY_PATTERN.test(normalizedQuery)) intent = 'availability';
  else if (LOOKUP_PATTERN.test(normalizedQuery) && categoryMatch) intent = 'product-lookup';
  else if (RECOMMENDATION_PATTERN.test(normalizedQuery)) intent = 'recommendation';
  else if (FILTER_PATTERN.test(normalizedQuery)) intent = 'filtering';
  else if (categoryMatch || /\b(product|products|show|find|list)\b/i.test(normalizedQuery)) intent = 'product-search';
  else intent = 'clarification';

  return { intent, entities };
}
