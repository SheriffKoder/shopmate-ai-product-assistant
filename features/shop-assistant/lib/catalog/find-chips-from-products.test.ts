/**
 * @file features/shop-assistant/lib/catalog/find-chips-from-products.test.ts
 * Unit tests for Find chips derived from lookup rows.
 *
 * Run:
 * npx tsx --test features/shop-assistant/lib/catalog/find-chips-from-products.test.ts
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildFindChipsFromProducts } from './find-chips-from-products';

describe('buildFindChipsFromProducts', () => {
  it('builds Smartphones + Tablets from pen rec rows', () => {
    assert.deepEqual(
      buildFindChipsFromProducts([
        { category: 'smartphone' },
        { category: 'tablet' },
        { category: 'smartphone' },
      ]),
      {
        type: 'buttons',
        items: [
          { label: 'Smartphones', value: 'smartphone' },
          { label: 'Tablets', value: 'tablet' },
        ],
      },
    );
  });

  it('caps at 3 unique categories', () => {
    const metadata = buildFindChipsFromProducts([
      { category: 'smartphone' },
      { category: 'laptop' },
      { category: 'tablet' },
      { category: 'headphones' },
    ]);
    assert.equal(metadata.type, 'buttons');
    assert.equal(metadata.items.length, 3);
  });

  it('returns none when rows have no catalog categories', () => {
    assert.deepEqual(
      buildFindChipsFromProducts([{ category: 'unknown' }]),
      { type: 'none', items: [] },
    );
  });
});
