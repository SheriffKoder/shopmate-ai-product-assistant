/**
 * @file features/ai-assistant/lib/order-message-parts-for-display.test.ts
 * Unit tests for orderMessagePartsForDisplay.
 * Used in: local `npx tsx --test` runs.
 * Used for: Find chips after speaker text regardless of stream write order.
 *
 * Run:
 * npx tsx --test features/ai-assistant/lib/order-message-parts-for-display.test.ts
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { orderMessagePartsForDisplay } from './order-message-parts-for-display';

describe('orderMessagePartsForDisplay', () => {
  it('moves data-uiMetadata after the last text part', () => {
    const ordered = orderMessagePartsForDisplay([
      { type: 'reasoning' },
      { type: 'data-uiMetadata' },
      { type: 'text' },
    ]);

    assert.deepEqual(ordered.map((entry) => entry.part.type), [
      'reasoning',
      'text',
      'data-uiMetadata',
    ]);
    assert.deepEqual(ordered.map((entry) => entry.index), [0, 2, 1]);
  });

  it('keeps metadata after text when stream order is already correct', () => {
    const ordered = orderMessagePartsForDisplay([
      { type: 'text' },
      { type: 'data-uiMetadata' },
    ]);

    assert.deepEqual(ordered.map((entry) => entry.part.type), [
      'text',
      'data-uiMetadata',
    ]);
  });

  it('inserts metadata before later non-text parts such as cards', () => {
    const ordered = orderMessagePartsForDisplay([
      { type: 'text' },
      { type: 'data-productCards' },
      { type: 'data-uiMetadata' },
    ]);

    assert.deepEqual(ordered.map((entry) => entry.part.type), [
      'text',
      'data-uiMetadata',
      'data-productCards',
    ]);
  });

  it('appends metadata when there is no text part yet', () => {
    const ordered = orderMessagePartsForDisplay([
      { type: 'reasoning' },
      { type: 'data-uiMetadata' },
    ]);

    assert.deepEqual(ordered.map((entry) => entry.part.type), [
      'reasoning',
      'data-uiMetadata',
    ]);
  });

  it('returns an empty list for missing parts', () => {
    assert.deepEqual(orderMessagePartsForDisplay(undefined), []);
  });
});
