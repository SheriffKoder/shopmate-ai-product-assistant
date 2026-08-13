/**
 * @file features/shop-assistant/server/render/reply.ts
 * Deterministic text replies for refuse, policy, empty catalog, and confirm stubs.
 * Used in: shop-assistant-runtime.ts after render (or instead of speaker).
 * Used for: A mergeable UI stream without a speaker LLM.
 *
 * Function Index:
 * createTextReplyStream: Write one assistant text message into a UI stream.
 *
 * Steps:
 * 1. Open a text part.
 * 2. Write the full deterministic string.
 * 3. Close the part so the handler can merge it.
 */

import { createUIMessageStream } from 'ai';

/** Unrelated queries. No lookup. No fake catalog. */
export const REFUSE_MESSAGE =
  "I can only help with ShopMate shopping — products, your cart, store policy, or electronics questions. I can't help with that request.";

/** Store policy. Schema does not invent legal copy; this is the fixed ShopMate summary. */
export const POLICY_MESSAGE = `ShopMate store policy:
- Returns: unused electronics can be returned within 30 days with receipt.
- Shipping: standard shipping is 3–5 business days; express is 1–2 days.
- Warranty: manufacturer warranty applies; ShopMate covers 30-day defects.
- Cart edits: use the cart controls to change quantity or remove items.`;

/** Empty catalog lookup. Do not invent products. */
export const EMPTY_CATALOG_MESSAGE =
  "Sorry, I couldn't find any products matching that request in the store.";

/**
 * Create a mergeable UI stream containing one deterministic text reply.
 *
 * @example
 * createTextReplyStream(REFUSE_MESSAGE)
 */
export function createTextReplyStream(text: string, textId = 'shop-assistant-reply') {
  return createUIMessageStream({
    execute({ writer }) {
      writer.write({ type: 'text-start', id: textId });
      writer.write({ type: 'text-delta', id: textId, delta: text });
      writer.write({ type: 'text-end', id: textId });
    },
  });
}
