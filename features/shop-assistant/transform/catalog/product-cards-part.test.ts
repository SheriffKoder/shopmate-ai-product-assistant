/**
 * @file features/shop-assistant/transform/catalog/product-cards-part.test.ts
 * Unit tests for persistable product-card payloads.
 * Used in: local `npx tsx --test` runs.
 * Used for: Keeping card parts on real lookup rows until UI remounts them.
 *
 * Run:
 * npx tsx --test features/shop-assistant/transform/catalog/product-cards-part.test.ts
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getInitialProducts } from '@/features/catalog/model/initial-data';
import { buildProductCardsPart } from './product-cards-part';

describe('buildProductCardsPart', () => {
  it('keeps real smartphone rows and a store header', () => {
    const phones = getInitialProducts().filter((product) => product.category === 'smartphone');
    const part = buildProductCardsPart(phones, 'ShopMate smartphones');

    assert.equal(part.header, '## ShopMate smartphones');
    assert.match(part.paragraph, /2 matching products/);
    assert.deepEqual(
      part.products.map((product) => product.name).sort(),
      ['Samsung Galaxy S24 Ultra', 'iPhone 15 Pro Max'].sort(),
    );
  });
});
