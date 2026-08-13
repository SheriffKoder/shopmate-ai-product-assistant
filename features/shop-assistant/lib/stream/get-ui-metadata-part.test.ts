/**
 * @file features/shop-assistant/lib/stream/get-ui-metadata-part.test.ts
 * Unit tests for persisted data-uiMetadata parsing and click prompts.
 * Used in: local `npx tsx --test` runs.
 * Used for: Remounting conversation Find chips from stream parts.
 *
 * Run:
 * npx tsx --test features/shop-assistant/lib/stream/get-ui-metadata-part.test.ts
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DEFAULT_ASSISTANT_METADATA } from '../../model/assistant-request';
import {
  buildProvideCatalogPrompt,
  buildUiMetadataPart,
  getUiMetadataPart,
} from './get-ui-metadata-part';

describe('buildUiMetadataPart', () => {
  it('builds buttons payload from schema metadata', () => {
    const payload = buildUiMetadataPart({
      type: 'buttons',
      items: [{ label: 'Tablets', value: 'tablet' }],
    });

    assert.deepEqual(payload, {
      type: 'buttons',
      items: [{ label: 'Tablets', value: 'tablet' }],
      maxPrice: null,
    });
  });

  it('returns null for type none or empty items', () => {
    assert.equal(buildUiMetadataPart(DEFAULT_ASSISTANT_METADATA), null);
    assert.equal(buildUiMetadataPart({ type: 'buttons', items: [] }), null);
  });
});

describe('getUiMetadataPart', () => {
  it('reads a buttons payload written by buildUiMetadataPart', () => {
    const payload = buildUiMetadataPart(
      {
        type: 'buttons',
        items: [
          { label: 'Tablets', value: 'tablet' },
          { label: 'Laptops', value: 'laptop' },
        ],
      },
      { maxPrice: 900 },
    );
    const part = getUiMetadataPart({ type: 'data-uiMetadata', data: payload });

    assert.ok(part);
    assert.equal(part.type, 'buttons');
    assert.equal(part.maxPrice, 900);
    assert.deepEqual(part.items, [
      { label: 'Tablets', value: 'tablet' },
      { label: 'Laptops', value: 'laptop' },
    ]);
  });

  it('trims items, drops empty values, keeps product names, and caps at 3', () => {
    const part = getUiMetadataPart({
      type: 'data-uiMetadata',
      data: {
        type: 'buttons',
        items: [
          { label: ' Tablets ', value: 'Tablet' },
          { label: '', value: 'laptop' },
          { label: 'iPhone 15 Pro Max', value: 'iPhone 15 Pro Max' },
          { label: 'Laptops', value: 'laptop' },
          { label: 'Phones', value: 'smartphone' },
          { label: 'Watches', value: 'smartwatch' },
        ],
      },
    });

    assert.deepEqual(part?.items, [
      { label: 'Tablets', value: 'tablet' },
      { label: 'iPhone 15 Pro Max', value: 'iphone 15 pro max' },
      { label: 'Laptops', value: 'laptop' },
    ]);
  });

  it('ignores unknown, none, or incomplete parts', () => {
    assert.equal(getUiMetadataPart({ type: 'data-productCards', data: { type: 'buttons', items: [] } }), null);
    assert.equal(getUiMetadataPart({ type: 'data-uiMetadata', data: { type: 'none', items: [] } }), null);
    assert.equal(getUiMetadataPart({ type: 'data-uiMetadata', data: { type: 'chips', items: [] } }), null);
    assert.equal(getUiMetadataPart({ type: 'data-uiMetadata', data: { type: 'buttons' } }), null);
  });
});

describe('buildProvideCatalogPrompt', () => {
  it('builds a visible Provide-from-catalog follow-up', () => {
    assert.equal(buildProvideCatalogPrompt('tablet'), 'Provide tablet from the catalog');
  });

  it('appends maxPrice when set', () => {
    assert.equal(
      buildProvideCatalogPrompt('headphones', 200),
      'Provide headphones under $200 from the catalog',
    );
  });
});
