/**
 * @file features/shop-assistant/schema/assistant-request-schema.ts
 * Zod schema and validation for the one Shop Assistant LLM labeler.
 * Used in: request-agent generateObject and runtime fallback.
 * Used for: Closed enums only. Reject unsafe filters before lookup.
 *
 * Function Index:
 * assistantRequestSchema: Structured output schema supplied to the LLM.
 * validateAssistantRequest: Normalize and validate model output before planning.
 *
 * Steps:
 * 1. Constrain action, category, sortBy, view, and metadata.type to closed enums.
 * 2. Trim and de-duplicate color/feature lists. Drop invalid prices.
 * 3. Keep empty catalogQuery for browse-all. Do not invent search terms.
 * 4. Normalize metadata items: trim, drop empty / non-category values, cap at 3.
 */

import { z } from 'zod';
import {
  ASSISTANT_ACTIONS,
  ASSISTANT_METADATA_TYPES,
  ASSISTANT_VIEWS,
  CATALOG_CATEGORIES,
  CATALOG_SORT_MODES,
  DEFAULT_ASSISTANT_CONSTRAINTS,
  DEFAULT_ASSISTANT_METADATA,
  isAssistantMetadataType,
  isCatalogCategory,
  isCatalogSortMode,
  type AssistantMetadata,
  type AssistantMetadataItem,
  type AssistantRequest,
} from '../model/assistant-request';

/** One Find chip. Label is display; value is the follow-up catalog search fragment. */
const assistantMetadataItemSchema = z.object({
  label: z.string(),
  value: z.string(),
});

/** Structured output schema supplied to the one schema LLM. */
export const assistantRequestSchema = z.object({
  action: z.enum(ASSISTANT_ACTIONS),
  // Empty string is valid for browse-all catalog requests.
  catalogQuery: z.string(),
  // Optional so omitting category does not drop a valid label.
  category: z.enum(CATALOG_CATEGORIES).nullable().optional().default(null),
  // Constraint fields are optional. Omitting sortBy used to fail the whole parse.
  constraints: z.object({
    minPrice: z.number().nullable().optional().default(null),
    maxPrice: z.number().nullable().optional().default(null),
    colors: z.array(z.string()).optional().default([]),
    features: z.array(z.string()).optional().default([]),
    sortBy: z.enum(CATALOG_SORT_MODES).nullable().optional().default(null),
  }).optional().default(DEFAULT_ASSISTANT_CONSTRAINTS),
  view: z.enum(ASSISTANT_VIEWS).describe(
    'cards = user asked to see products (show me / do you have / Provide X). conversation = broader rec, compare, or advice. sheet/document = artifacts.',
  ),
  // Conversation Find chips. Cards / sheet / document / cart leave this at none.
  metadata: z.object({
    type: z.enum(ASSISTANT_METADATA_TYPES).optional().default('none').describe(
      'buttons only for catalog conversation rec/compare. none for cards, sheet, document, cart, policy, unrelated.',
    ),
    items: z.array(assistantMetadataItemSchema).max(3).optional().default([]).describe(
      '1-3 catalog categories. value is smartphone|laptop|tablet|smartwatch|headphones. Include every matching aisle (pen diary → smartphone + tablet). No SKU names.',
    ),
  }).optional().default(DEFAULT_ASSISTANT_METADATA),
});

/**
 * Trim, drop empty / invented chips, de-dupe by catalog value, and cap at 3.
 *
 * `value` must be a closed catalog category so turn-2 "Provide X from the catalog"
 * cannot invent SKUs.
 */
function normalizeMetadata(metadata: AssistantMetadata | undefined): AssistantMetadata {
  const type = metadata?.type && isAssistantMetadataType(metadata.type)
    ? metadata.type
    : 'none';
  // Cards and non-button types never keep leftover items.
  if (type !== 'buttons') {
    return DEFAULT_ASSISTANT_METADATA;
  }

  const seen = new Set<string>();
  const items: AssistantMetadataItem[] = [];

  for (const item of metadata?.items ?? []) {
    const label = item.label.trim();
    const value = item.value.trim().toLowerCase();
    // Drop blank chips and anything that is not a real catalog category.
    if (!label || !value || !isCatalogCategory(value) || seen.has(value)) continue;
    seen.add(value);
    items.push({ label, value });
    if (items.length >= 3) break;
  }

  // Buttons with no surviving items collapse to none so the UI does not mount empty Find.
  if (items.length === 0) return DEFAULT_ASSISTANT_METADATA;
  return { type: 'buttons', items };
}

/**
 * Normalize and validate model output before planning or lookup.
 *
 * @example
 * validateAssistantRequest({
 *   action: 'catalog',
 *   catalogQuery: '  smartphone  ',
 *   category: 'smartphone',
 *   constraints: { minPrice: -1, maxPrice: 900, colors: ['Black', 'black'], features: [], sortBy: 'price-low' },
 *   view: 'cards',
 *   metadata: { type: 'none', items: [] },
 * })
 * // catalogQuery trimmed, minPrice null, colors ['black']
 *
 * @example
 * validateAssistantRequest({
 *   action: 'catalog',
 *   catalogQuery: '',
 *   category: null,
 *   constraints: DEFAULT_ASSISTANT_CONSTRAINTS,
 *   view: 'conversation',
 *   metadata: { type: 'buttons', items: [{ label: ' Tablets ', value: 'Tablet' }, { label: '', value: 'laptop' }] },
 * })
 * // metadata.items → [{ label: 'Tablets', value: 'tablet' }]
 */
export function validateAssistantRequest(request: AssistantRequest): AssistantRequest {
  // 1. Normalize list fields so duplicate or noisy extraction cannot bias search.
  const normalizeList = (values: string[]) => [
    ...new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean)),
  ];
  // 2. Drop invalid prices instead of inventing bounds.
  const normalizePrice = (value: number | null) => (
    value === null || !Number.isFinite(value) || value < 0 ? null : value
  );
  const normalizedCategory = request.category?.trim().toLowerCase() || null;
  const normalizedSortBy = request.constraints.sortBy?.trim().toLowerCase() || null;

  return {
    action: request.action,
    // Keep empty catalogQuery for browse-all. Do not backfill from conversational wording.
    catalogQuery: request.catalogQuery.trim(),
    category: normalizedCategory && isCatalogCategory(normalizedCategory) ? normalizedCategory : null,
    constraints: {
      minPrice: normalizePrice(request.constraints.minPrice),
      maxPrice: normalizePrice(request.constraints.maxPrice),
      colors: normalizeList(request.constraints.colors),
      features: normalizeList(request.constraints.features),
      sortBy: normalizedSortBy && isCatalogSortMode(normalizedSortBy) ? normalizedSortBy : null,
    },
    view: request.view,
    // 3. Conversation chips only. Never invent SKUs; never keep more than three.
    metadata: normalizeMetadata(request.metadata),
  };
}
