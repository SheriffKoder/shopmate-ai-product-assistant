/**
 * @file features/shop-assistant/lib/catalog/match-catalog-products.test.ts
 * Unit tests for unique-category catalog matching.
 * Used in: local `npx tsx --test` runs.
 * Used for: Guarding "smart phones" vs smartwatch/headphones substring OR-match.
 *
 * Run:
 * npx tsx --test features/shop-assistant/lib/catalog/match-catalog-products.test.ts
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getInitialProducts } from '@/features/catalog/model/initial-data';
import { isBrowseAllCatalogRequest } from './is-browse-all-catalog-request';
import {
  getUniqueCatalogCategories,
  matchCatalogProducts,
  resolveCatalogCategory,
} from './match-catalog-products';

const products = getInitialProducts();

function names(query: string, extra: Parameters<typeof matchCatalogProducts>[1] = {}) {
  return matchCatalogProducts(products, { query, ...extra }).map((product) => product.name);
}

describe('getUniqueCatalogCategories', () => {
  it('reads distinct category values from the catalog', () => {
    assert.deepEqual(
      getUniqueCatalogCategories(products).sort(),
      ['headphones', 'laptop', 'smartphone', 'smartwatch', 'tablet'].sort(),
    );
  });
});

describe('resolveCatalogCategory', () => {
  it('maps smart phones to the unique smartphone category', () => {
    assert.equal(resolveCatalogCategory(products, 'smart phones'), 'smartphone');
    assert.equal(resolveCatalogCategory(products, 'Show me smart phones'), 'smartphone');
    assert.equal(resolveCatalogCategory(products, 'phone'), 'smartphone');
  });

  it('does not resolve headphones via the phone substring', () => {
    assert.equal(resolveCatalogCategory(products, 'headphones'), 'headphones');
    assert.equal(resolveCatalogCategory(products, 'sony headphones'), 'headphones');
  });

  it('maps apple watch to smartwatch, not smartphone', () => {
    assert.equal(resolveCatalogCategory(products, 'apple watch'), 'smartwatch');
  });

  it('honors an explicit category when it exists in the catalog', () => {
    assert.equal(resolveCatalogCategory(products, 'samsung', 'smartphone'), 'smartphone');
  });

  it('returns null for browse-all / empty query', () => {
    assert.equal(resolveCatalogCategory(products, ''), null);
    assert.equal(resolveCatalogCategory(products, '   '), null);
  });
});

describe('matchCatalogProducts', () => {
  it('returns only smartphones for "smart phones"', () => {
    assert.deepEqual(names('smart phones').sort(), [
      'Samsung Galaxy S24 Ultra',
      'iPhone 15 Pro Max',
    ].sort());
  });

  it('does not return watch or headphones for phone queries', () => {
    const phoneNames = names('phone');
    assert.deepEqual(phoneNames.sort(), [
      'Samsung Galaxy S24 Ultra',
      'iPhone 15 Pro Max',
    ].sort());
    assert.equal(phoneNames.some((name) => /watch|sony|airpods/i.test(name)), false);
  });

  it('returns only headphones for headphones queries', () => {
    assert.deepEqual(names('headphones').sort(), [
      'AirPods Pro (2nd Generation)',
      'Sony WH-1000XM5',
    ].sort());
  });

  it('returns Apple Watch only for apple watch', () => {
    assert.deepEqual(names('apple watch'), ['Apple Watch Ultra 2']);
  });

  it('returns laptops for laptops', () => {
    assert.deepEqual(names('laptops').sort(), [
      'Dell XPS 15 9530',
      'MacBook Pro 16" M3 Max',
    ].sort());
  });

  it('matches leftover brand tokens inside a resolved category', () => {
    assert.deepEqual(names('samsung phones'), ['Samsung Galaxy S24 Ultra']);
    assert.deepEqual(names('sony headphones'), ['Sony WH-1000XM5']);
  });

  it('matches a model keyword without a category alias', () => {
    assert.deepEqual(names('iphone'), ['iPhone 15 Pro Max']);
  });

  it('returns the full catalog for an empty browse-all query', () => {
    const browseAllQuery = 'All available products in ShopMate in a table';
    assert.equal(isBrowseAllCatalogRequest(browseAllQuery), true);

    const matched = matchCatalogProducts(products, {
      query: isBrowseAllCatalogRequest(browseAllQuery) ? '' : browseAllQuery,
    });
    assert.equal(matched.length, products.length);
    assert.deepEqual(
      matched.map((product) => product.name).sort(),
      products.map((product) => product.name).sort(),
    );
  });

  it('applies price filters on browse-all', () => {
    const matched = matchCatalogProducts(products, { query: '', maxPrice: 500 });
    assert.deepEqual(
      matched.map((product) => product.name).sort(),
      ['AirPods Pro (2nd Generation)', 'Sony WH-1000XM5'].sort(),
    );
  });

  it('applies an explicit category plus leftover brand', () => {
    assert.deepEqual(
      names('samsung', { category: 'smartphone' }),
      ['Samsung Galaxy S24 Ultra'],
    );
  });

  it('sorts by price-low and respects limit', () => {
    const matched = matchCatalogProducts(products, {
      query: 'headphones',
      sortBy: 'price-low',
      limit: 1,
    });
    assert.deepEqual(matched.map((product) => product.name), ['AirPods Pro (2nd Generation)']);
  });
});
