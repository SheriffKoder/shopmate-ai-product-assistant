/**
 * @file features/shop-assistant/lib/catalog/is-browse-all-catalog-request.test.ts
 * Unit tests for browse-all wording detection.
 * Used in: local `npx tsx --test` runs.
 * Used for: Emptying catalogQuery before matchCatalogProducts on full-catalog prompts.
 *
 * Run:
 * npx tsx --test features/shop-assistant/lib/catalog/is-browse-all-catalog-request.test.ts
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isBrowseAllCatalogRequest } from './is-browse-all-catalog-request';

describe('isBrowseAllCatalogRequest', () => {
  it('detects full-catalog table wording', () => {
    assert.equal(
      isBrowseAllCatalogRequest('All available products in ShopMate in a table'),
      true,
    );
    assert.equal(isBrowseAllCatalogRequest('show everything in the store'), true);
    assert.equal(isBrowseAllCatalogRequest('entire catalog'), true);
  });

  it('does not treat a category search as browse-all', () => {
    assert.equal(isBrowseAllCatalogRequest('show me smart phones'), false);
    assert.equal(isBrowseAllCatalogRequest('samsung phones'), false);
  });
});
