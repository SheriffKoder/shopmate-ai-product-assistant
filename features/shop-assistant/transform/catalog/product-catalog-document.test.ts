/**
 * @file features/shop-assistant/transform/catalog/product-catalog-document.test.ts
 * Unit tests for catalog markdown mapping.
 * Used in: local `npx tsx --test` runs.
 * Used for: Guarding buying-guide artifacts against invented SKUs.
 *
 * Run:
 * npx tsx --test features/shop-assistant/transform/catalog/product-catalog-document.test.ts
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getInitialProducts } from '@/features/catalog/model/initial-data';
import { toProductCatalogDocument } from './product-catalog-document';

describe('toProductCatalogDocument', () => {
  it('fills markdown from lookup rows only', () => {
    const phones = getInitialProducts().filter((product) => product.category === 'smartphone');
    const markdown = toProductCatalogDocument(phones, 'ShopMate smartphones');

    assert.match(markdown, /^# ShopMate smartphones/m);
    assert.match(markdown, /2 products currently in the ShopMate catalog/);
    assert.match(markdown, /## iPhone 15 Pro Max/);
    assert.match(markdown, /## Samsung Galaxy S24 Ultra/);
    assert.match(markdown, /\$1199\.99/);
    assert.doesNotMatch(markdown, /Apple Watch/);
    assert.match(markdown, /No additional products were invented/);
  });
});
