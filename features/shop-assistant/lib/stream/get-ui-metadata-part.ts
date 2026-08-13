/**
 * @file features/shop-assistant/lib/stream/get-ui-metadata-part.ts
 * Pure parser and payload builder for persisted data-uiMetadata parts.
 * Used in: ui/metadata/buttons.tsx, ui/integration/stream-part-registry.tsx,
 *          and server/render/ui-metadata.ts.
 * Used for: Conversation Find chips from schema metadata, not AI tools.
 *
 * Function Index:
 * UiMetadataPart: Persistable conversation UI payload.
 * buildUiMetadataPart: Schema metadata → stream payload (or null).
 * getUiMetadataPart: Read type/items/maxPrice from a data-uiMetadata part.
 * buildProvideCatalogPrompt: Turn-2 user text when a Find chip is clicked.
 *
 * Steps:
 * 1. Ignore type none, empty items, and unknown metadata types.
 * 2. Trim items, drop empty values, cap at 3. Category vs product is decided upstream
 *    (schema validate keeps categories for LLM; answer chips are lookup product names).
 * 3. Optional maxPrice is presentation-only for the click prompt.
 */

import {
  isAssistantMetadataType,
  type AssistantMetadata,
  type AssistantMetadataItem,
  type AssistantMetadataType,
} from '../../model/assistant-request';

/** Persisted stream part type for conversation UI metadata. */
export const UI_METADATA_PART_TYPE = 'data-uiMetadata';

/** Persistable conversation UI payload. Chat remounts from data-uiMetadata. */
export interface UiMetadataPart {
  type: Exclude<AssistantMetadataType, 'none'>;
  items: AssistantMetadataItem[];
  maxPrice?: number | null;
}

function normalizeMetadataItems(items: unknown): AssistantMetadataItem[] {
  if (!Array.isArray(items)) return [];

  const seen = new Set<string>();
  const normalized: AssistantMetadataItem[] = [];

  for (const item of items) {
    if (!item || typeof item !== 'object') continue;
    const typed = item as { label?: unknown; value?: unknown };
    const label = typeof typed.label === 'string' ? typed.label.trim() : '';
    const value = typeof typed.value === 'string' ? typed.value.trim().toLowerCase() : '';
    // Allow category or product-name fragments. LLM SKUs are blocked in validateAssistantRequest.
    if (!label || !value || seen.has(value)) continue;
    seen.add(value);
    normalized.push({ label, value });
    if (normalized.length >= 3) break;
  }

  return normalized;
}

function normalizeMaxPrice(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}

/**
 * Build a persistable metadata payload from a validated schema label.
 * Returns null when there is nothing to mount (none, empty, or unknown type).
 *
 * @example
 * buildUiMetadataPart({ type: 'buttons', items: [{ label: 'Tablets', value: 'tablet' }] })
 * // { type: 'buttons', items: [{ label: 'Tablets', value: 'tablet' }], maxPrice: null }
 */
export function buildUiMetadataPart(
  metadata: AssistantMetadata,
  options?: { maxPrice?: number | null },
): UiMetadataPart | null {
  const items = normalizeMetadataItems(metadata.items);
  if (metadata.type !== 'buttons' || items.length === 0) return null;

  return {
    type: 'buttons',
    items,
    maxPrice: normalizeMaxPrice(options?.maxPrice),
  };
}

/**
 * Read a persistable conversation UI payload from a data-uiMetadata part.
 * Returns null when the part is missing, type none, or has no usable items.
 *
 * @example
 * getUiMetadataPart({
 *   type: 'data-uiMetadata',
 *   data: { type: 'buttons', items: [{ label: 'Tablets', value: 'tablet' }] },
 * })
 */
export function getUiMetadataPart(part: unknown): UiMetadataPart | null {
  if (!part || typeof part !== 'object') return null;

  const typed = part as { type?: unknown; data?: unknown };
  if (typed.type !== UI_METADATA_PART_TYPE || !typed.data || typeof typed.data !== 'object') {
    return null;
  }

  const data = typed.data as {
    type?: unknown;
    items?: unknown;
    maxPrice?: unknown;
  };
  const metadataType = typeof data.type === 'string' ? data.type : '';
  // Only buttons are mountable today. Unknown / none types stay unmounted.
  if (!isAssistantMetadataType(metadataType) || metadataType !== 'buttons') return null;

  const items = normalizeMetadataItems(data.items);
  if (items.length === 0) return null;

  return {
    type: 'buttons',
    items,
    maxPrice: normalizeMaxPrice(data.maxPrice),
  };
}

/**
 * Visible follow-up prompt sent when the user clicks a Find chip.
 *
 * @example
 * buildProvideCatalogPrompt('tablet')
 * // 'Provide tablet from the catalog'
 *
 * @example
 * buildProvideCatalogPrompt('headphones', 200)
 * // 'Provide headphones under $200 from the catalog'
 */
export function buildProvideCatalogPrompt(
  value: string,
  maxPrice?: number | null,
): string {
  const fragment = value.trim();
  const catalogFragment = fragment || 'products';
  if (typeof maxPrice === 'number' && Number.isFinite(maxPrice) && maxPrice >= 0) {
    return `Provide ${catalogFragment} under $${Math.round(maxPrice)} from the catalog`;
  }
  return `Provide ${catalogFragment} from the catalog`;
}
