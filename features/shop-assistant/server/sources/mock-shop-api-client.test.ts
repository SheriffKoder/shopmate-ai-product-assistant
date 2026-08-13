/**
 * @file features/shop-assistant/server/sources/mock-shop-api-client.test.ts
 * Integration test that mock searchProducts uses unique-category matching.
 * Used in: local `npx tsx --test` runs.
 * Used for: Confirming the matcher is plugged into the Shop API client.
 *
 * Run:
 * npx tsx --test features/shop-assistant/server/sources/mock-shop-api-client.test.ts
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getInitialProducts } from '@/features/catalog/model/initial-data';
import { createMockShopApiClient } from './mock-shop-api-client';

describe('createMockShopApiClient.searchProducts', () => {
  it('returns only smartphones for smart phones', async () => {
    const client = createMockShopApiClient(getInitialProducts());
    const results = await client.searchProducts({ query: 'smart phones' });

    assert.deepEqual(
      results.map((product) => product.name).sort(),
      ['Samsung Galaxy S24 Ultra', 'iPhone 15 Pro Max'].sort(),
    );
  });

  it('returns the full catalog when query is empty', async () => {
    const catalog = getInitialProducts();
    const client = createMockShopApiClient(catalog);
    const results = await client.searchProducts({ query: '' });

    assert.equal(results.length, catalog.length);
  });
});
