/**
 * @file features/shop-assistant/lib/catalog/find-chips-from-products.test.ts
 * Unit tests for Find chips derived from lookup product names.
 *
 * Run:
 * npx tsx --test features/shop-assistant/lib/catalog/find-chips-from-products.test.ts
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildFindChipsFromProducts } from './find-chips-from-products';

describe('buildFindChipsFromProducts', () => {
  it('builds a chip from the matched product name', () => {
    assert.deepEqual(
      buildFindChipsFromProducts([{ name: 'iPhone 15 Pro Max' }]),
      {
        type: 'buttons',
        items: [{ label: 'iPhone 15 Pro Max', value: 'iphone 15 pro max' }],
      },
    );
  });

  it('caps at 3 unique product names', () => {
    const metadata = buildFindChipsFromProducts([
      { name: 'A' },
      { name: 'B' },
      { name: 'C' },
      { name: 'D' },
      { name: 'A' },
    ]);
    assert.equal(metadata.type, 'buttons');
    assert.equal(metadata.items.length, 3);
    assert.deepEqual(metadata.items.map((item) => item.label), ['A', 'B', 'C']);
  });

  it('returns none when names are blank', () => {
    assert.deepEqual(
      buildFindChipsFromProducts([{ name: '  ' }]),
      { type: 'none', items: [] },
    );
  });
});
