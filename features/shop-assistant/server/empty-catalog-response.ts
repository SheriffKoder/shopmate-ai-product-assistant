/**
 * @file features/shop-assistant/server/empty-catalog-response.ts
 * Shared deterministic response for empty store lookups.
 * Used in: catalog-facing ShopMate agents.
 * Used for: Preventing model calls and invented products when the store has no match.
 */

import { createUIMessageStream } from 'ai';

export const EMPTY_CATALOG_MESSAGE = "Sorry, I couldn't find any products matching that request in the store.";

/** Create a mergeable UI stream containing the standard empty-catalog apology. */
export function createEmptyCatalogResponse() {
  return createUIMessageStream({
    execute({ writer }) {
      const textId = 'empty-catalog-response';
      writer.write({ type: 'text-start', id: textId });
      writer.write({ type: 'text-delta', id: textId, delta: EMPTY_CATALOG_MESSAGE });
      writer.write({ type: 'text-end', id: textId });
    },
  });
}
