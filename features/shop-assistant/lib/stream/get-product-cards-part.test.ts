/**
 * @file features/shop-assistant/lib/stream/get-product-cards-part.test.ts
 * Unit tests for persisted data-productCards parsing.
 * Used in: local `npx tsx --test` runs.
 * Used for: Remounting catalog cards from stream parts, not AI tool results.
 *
 * Run:
 * npx tsx --test features/shop-assistant/lib/stream/get-product-cards-part.test.ts
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getInitialProducts } from '@/features/catalog/model/initial-data';
import { buildProductCardsPart } from '../../transform/catalog/product-cards-part';
import { getProductCardsPart } from './get-product-cards-part';

describe('getProductCardsPart', () => {
  it('reads real lookup rows from a data-productCards part', () => {
    const phones = getInitialProducts().filter((product) => product.category === 'smartphone');
    const payload = buildProductCardsPart(phones, 'ShopMate smartphones');
    const part = getProductCardsPart({ type: 'data-productCards', data: payload });

    assert.ok(part);
    assert.equal(part.header, '## ShopMate smartphones');
    assert.deepEqual(
      part.products.map((product) => product.name).sort(),
      ['Samsung Galaxy S24 Ultra', 'iPhone 15 Pro Max'].sort(),
    );
  });

  it('ignores unknown or incomplete parts', () => {
    assert.equal(getProductCardsPart({ type: 'data-productCard', data: { products: [] } }), null);
    assert.equal(getProductCardsPart({ type: 'data-productCards', data: { header: 'x' } }), null);
  });
});
