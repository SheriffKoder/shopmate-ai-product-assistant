/**
 * @file features/shop-assistant/lib/catalog/build-catalog-facts.test.ts
 * Unit tests for buildCatalogFacts.
 *
 * Run:
 * npx tsx --test features/shop-assistant/lib/catalog/build-catalog-facts.test.ts
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Product } from '@/features/catalog/model/product';
import { buildCatalogFacts } from './build-catalog-facts';

function product(partial: Partial<Product> & Pick<Product, 'name'>): Product {
  return {
    id: partial.id ?? 'p1',
    name: partial.name,
    category: partial.category ?? 'smartphone',
    rating: partial.rating ?? 4.5,
    shortDescription: partial.shortDescription ?? 'Short',
    description: partial.description ?? 'Long',
    price: partial.price ?? 999,
    reviewsCount: partial.reviewsCount ?? 10,
    features: partial.features ?? ['Feature A'],
    image_url: null,
    image_url_variations: null,
    featured: false,
    keywords: [],
    colors: [],
  };
}

describe('buildCatalogFacts', () => {
  it('builds factual lines from product rows', () => {
    const facts = buildCatalogFacts([
      product({
        name: 'iPhone 15 Pro Max',
        price: 1199,
        rating: 4.7,
        features: ['A17 Pro', 'Titanium'],
        shortDescription: 'Apple flagship',
      }),
    ]);

    assert.equal(facts.length, 1);
    assert.match(facts[0]!, /iPhone 15 Pro Max/);
    assert.match(facts[0]!, /\$1199/);
    assert.match(facts[0]!, /A17 Pro; Titanium/);
    assert.match(facts[0]!, /Apple flagship/);
  });

  it('caps at 3 products', () => {
    const facts = buildCatalogFacts([
      product({ name: 'A' }),
      product({ name: 'B' }),
      product({ name: 'C' }),
      product({ name: 'D' }),
    ]);
    assert.equal(facts.length, 3);
  });
});
