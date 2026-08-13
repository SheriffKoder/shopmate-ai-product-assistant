/**
 * @file features/ai-assistant/lib/order-message-parts-for-display.ts
 * Pure display order for assistant message parts.
 * Used in: components/message-list.tsx
 * Used for: Conversation UI metadata (Find chips) after spoken text, even if written first.
 *
 * Function Index:
 * AFTER_TEXT_STREAM_PART_TYPES: data-* types that must follow text.
 * orderMessagePartsForDisplay: Reorder parts without mutating the original list.
 *
 * Steps:
 * 1. Keep original indexes for React keys and partIndex.
 * 2. Pull after-text types out of stream order.
 * 3. Insert them immediately after the last text part.
 */

/** Stream part types that must render after spoken text on the same message. */
export const AFTER_TEXT_STREAM_PART_TYPES = new Set(['data-uiMetadata']);

/** One part plus its original index in message.parts. */
export interface OrderedMessagePart {
  part: any;
  index: number;
}

/**
 * Display order: text first, then conversation metadata, then remaining parts.
 *
 * Stream order can write `data-uiMetadata` before the speaker text. Chat still
 * shows Find chips under the reply. Original indexes stay on `index`.
 *
 * @example
 * orderMessagePartsForDisplay([
 *   { type: 'data-uiMetadata' },
 *   { type: 'text' },
 * ])
 * // [{ type: 'text', index: 1 }, { type: 'data-uiMetadata', index: 0 }]
 */
export function orderMessagePartsForDisplay(
  parts: any[] | undefined,
): OrderedMessagePart[] {
  const indexed = (parts ?? []).map((part, index) => ({ part, index }));
  const afterText = indexed.filter((entry) => (
    AFTER_TEXT_STREAM_PART_TYPES.has(entry.part?.type ?? '')
  ));
  const rest = indexed.filter((entry) => (
    !AFTER_TEXT_STREAM_PART_TYPES.has(entry.part?.type ?? '')
  ));

  if (afterText.length === 0) return rest;

  const lastTextAt = rest.findLastIndex((entry) => entry.part?.type === 'text');
  // No spoken text yet (streaming metadata first): keep chips after other non-text parts.
  if (lastTextAt === -1) return [...rest, ...afterText];

  return [
    ...rest.slice(0, lastTextAt + 1),
    ...afterText,
    ...rest.slice(lastTextAt + 1),
  ];
}
