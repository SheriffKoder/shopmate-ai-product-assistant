/**
 * @file features/shop-assistant/transform/catalog/product-catalog-csv.test.ts
 * Unit tests for catalog CSV mapping.
 * Used in: local `npx tsx --test` runs.
 * Used for: Guarding sheet artifacts against invented columns or unescaped cells.
 *
 * Run:
 * npx tsx --test features/shop-assistant/transform/catalog/product-catalog-csv.test.ts
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getInitialProducts } from '@/features/catalog/model/initial-data';
import { toProductCatalogCsv } from './product-catalog-csv';

describe('toProductCatalogCsv', () => {
  it('writes a stable header and real catalog names', () => {
    const phones = getInitialProducts().filter((product) => product.category === 'smartphone');
    const csv = toProductCatalogCsv(phones);
    const [header, ...rows] = csv.split('\n');

    assert.equal(header, 'Name,Category,Price,Rating,Reviews,Colors,Short Description');
    assert.equal(rows.length, phones.length);
    assert.match(csv, /iPhone 15 Pro Max/);
    assert.match(csv, /Samsung Galaxy S24 Ultra/);
    assert.doesNotMatch(csv, /Apple Watch/);
  });

  it('quotes cells that contain commas', () => {
    const csv = toProductCatalogCsv([
      {
        ...getInitialProducts()[0],
        name: 'Phone, Pro',
        shortDescription: 'Fast, bright display',
      },
    ]);

    assert.match(csv, /"Phone, Pro"/);
    assert.match(csv, /"Fast, bright display"/);
  });
});
