/**
 * @file features/shop-assistant/model/assistant-request.ts
 * Slim schema types for the one Shop Assistant LLM labeler.
 * Used in: schema validation, planFromSchema, request-agent, and runtime.
 * Used for: action + filters + view only. No tools field. No specialist-agent intent.
 *
 * Function Index:
 * AssistantAction: What the runtime should do (lookup / cart / refuse / …).
 * CatalogCategory: Closed catalog categories the schema may hint.
 * CatalogSortMode: Deterministic catalog sort options.
 * AssistantView: Presentation only. cards = listing. answer = product Q&A. conversation = rec/compare.
 * AssistantConstraints: Price, color, feature, and sort filters for lookup.
 * AssistantMetadataType: Which UI file to mount after a conversation reply.
 * AssistantMetadataItem: One chip — label for display, value for the follow-up search.
 * AssistantMetadata: Generic UI payload. Buttons first; other types later.
 * AssistantRequest: Validated labeler output.
 * DEFAULT_ASSISTANT_CONSTRAINTS: Empty filter set for browse-all / fallbacks.
 * DEFAULT_ASSISTANT_METADATA: No chips. Used when view is not conversation.
 *
 * Steps:
 * 1. Schema LLM returns an AssistantRequest.
 * 2. validateAssistantRequest normalizes filters and metadata items.
 * 3. planFromSchema uses action + view only. Lookup uses catalogQuery / category / constraints.
 * 4. Conversation + metadata.buttons streams Find chips. Cards ignore metadata.
 */

/** Runtime branch. Not a specialist-agent name. */
export const ASSISTANT_ACTIONS = ['catalog', 'cart', 'policy', 'technical', 'unrelated'] as const;
export type AssistantAction = (typeof ASSISTANT_ACTIONS)[number];

/** Closed catalog categories. Lookup still owns unique store values. */
export const CATALOG_CATEGORIES = ['smartphone', 'laptop', 'tablet', 'smartwatch', 'headphones'] as const;
export type CatalogCategory = (typeof CATALOG_CATEGORIES)[number];

/** Deterministic catalog sort. Same vocabulary as v1 lookup. */
export const CATALOG_SORT_MODES = [
  'relevance',
  'rating',
  'price-low',
  'price-high',
  'reviews',
  'name',
] as const;
export type CatalogSortMode = (typeof CATALOG_SORT_MODES)[number];

/**
 * How to present. Not an action.
 * cards = show products. answer = ask about a product (features/specs). conversation = rec/compare/advice.
 */
export const ASSISTANT_VIEWS = ['cards', 'sheet', 'document', 'conversation', 'answer'] as const;
export type AssistantView = (typeof ASSISTANT_VIEWS)[number];

/** Which conversation UI to mount. Extend later (links, chips, …). Not an action. */
export const ASSISTANT_METADATA_TYPES = ['none', 'buttons'] as const;
export type AssistantMetadataType = (typeof ASSISTANT_METADATA_TYPES)[number];

/** One Find chip. `label` is display; `value` is the turn-2 catalog search fragment. */
export interface AssistantMetadataItem {
  label: string;
  value: string;
}

/** Generic UI payload after a conversation reply. Runtime ignores this for cards/sheet/document/cart. */
export interface AssistantMetadata {
  type: AssistantMetadataType;
  items: AssistantMetadataItem[];
}

/** Lookup filters only. Never used to pick render. */
export interface AssistantConstraints {
  minPrice: number | null;
  maxPrice: number | null;
  colors: string[];
  features: string[];
  sortBy: CatalogSortMode | null;
}

/**
 * Structured label of one user message.
 *
 * `catalogQuery` empty string means browse-all: matching filters, no keyword search.
 * `metadata` is presentation follow-up only. It never chooses lookup or render.
 */
export interface AssistantRequest {
  action: AssistantAction;
  catalogQuery: string;
  category: CatalogCategory | null;
  constraints: AssistantConstraints;
  view: AssistantView;
  metadata: AssistantMetadata;
}

/** Safe empty filters for browse-all, fallbacks, and tests. */
export const DEFAULT_ASSISTANT_CONSTRAINTS: AssistantConstraints = {
  minPrice: null,
  maxPrice: null,
  colors: [],
  features: [],
  sortBy: null,
};

/** No conversation chips. Cards, sheet, document, cart, and fallbacks use this. */
export const DEFAULT_ASSISTANT_METADATA: AssistantMetadata = {
  type: 'none',
  items: [],
};

/** Default request when schema labeling fails. Catalog + conversation, no invented terms. */
export const DEFAULT_ASSISTANT_REQUEST: AssistantRequest = {
  action: 'catalog',
  catalogQuery: '',
  category: null,
  constraints: DEFAULT_ASSISTANT_CONSTRAINTS,
  view: 'conversation',
  metadata: DEFAULT_ASSISTANT_METADATA,
};

/** True when the string is a supported catalog category. */
export function isCatalogCategory(value: string): value is CatalogCategory {
  return (CATALOG_CATEGORIES as readonly string[]).includes(value);
}

/** True when the string is a supported catalog sort mode. */
export function isCatalogSortMode(value: string): value is CatalogSortMode {
  return (CATALOG_SORT_MODES as readonly string[]).includes(value);
}

/** True when the string is a supported conversation metadata type. */
export function isAssistantMetadataType(value: string): value is AssistantMetadataType {
  return (ASSISTANT_METADATA_TYPES as readonly string[]).includes(value);
}
