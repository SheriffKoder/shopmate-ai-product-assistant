/**
 * @file features/shop-assistant/server/render/ui-metadata.ts
 * Deterministic conversation metadata renderer (not an AI tool).
 * Used in: shop-assistant-runtime.ts after a conversation label with metadata.buttons.
 * Used for: Streaming Find chips. Click starts a visible user turn.
 *
 * Function Index:
 * renderUiMetadata: Write a persisted data-uiMetadata part when chips exist.
 *
 * Steps:
 * 1. Build payload from schema metadata. Skip type none / empty items.
 * 2. Stream a non-transient data-uiMetadata part for remount.
 */

import type { UIMessageStreamWriter } from 'ai';
import { logger } from '@/features/ai-assistant/lib/logger';
import type { AssistantMetadata } from '../../model/assistant-request';
import {
  UI_METADATA_PART_TYPE,
  buildUiMetadataPart,
  type UiMetadataPart,
} from '../../lib/stream/get-ui-metadata-part';

/**
 * Stream conversation Find chips from schema metadata.
 * Returns the payload when written, or null when there is nothing to mount.
 *
 * @example
 * renderUiMetadata({
 *   metadata: { type: 'buttons', items: [{ label: 'Tablets', value: 'tablet' }] },
 *   dataStream,
 * })
 */
export function renderUiMetadata(input: {
  metadata: AssistantMetadata;
  maxPrice?: number | null;
  dataStream?: UIMessageStreamWriter<any>;
}): UiMetadataPart | null {
  // 1. Nothing to show: none, empty, or invented non-category chips already dropped.
  const payload = buildUiMetadataPart(input.metadata, { maxPrice: input.maxPrice });

  if (!payload) {
    logger.node({
      name: 'RENDER',
      input: { render: 'ui-metadata', type: input.metadata.type, itemCount: input.metadata.items.length },
      details: 'No conversation metadata chips to stream.',
      result: null,
      status: 'skipped',
    });
    return null;
  }

  if (!input.dataStream) {
    logger.node({
      name: 'RENDER',
      input: { render: 'ui-metadata', type: payload.type, itemCount: payload.items.length },
      details: 'No dataStream. Metadata payload built but not streamed.',
      result: payload,
      status: 'skipped',
    });
    return payload;
  }

  try {
    // 2. Persist so refresh remounts Find chips under the speaker reply.
    input.dataStream.write({
      type: UI_METADATA_PART_TYPE,
      data: payload,
    });
    logger.node({
      name: 'RENDER',
      input: { render: 'ui-metadata', type: payload.type, maxPrice: payload.maxPrice },
      details: 'Streamed conversation metadata buttons. No cards. No lookup.',
      result: {
        itemCount: payload.items.length,
        values: payload.items.map((item) => item.value),
      },
      status: 'success',
    });
    return payload;
  } catch (error) {
    logger.node({
      name: 'RENDER',
      input: { render: 'ui-metadata', type: payload.type },
      details: 'Conversation metadata render failed.',
      status: 'error',
      error,
    });
    throw error;
  }
}
