/**
 * @file features/shop-assistant/server/render/cart.test.ts
 * Unit tests for persistable cart payloads.
 * Used in: local `npx tsx --test` runs.
 * Used for: Empty vs filled cart copy without AI ranking.
 *
 * Run:
 * npx tsx --test features/shop-assistant/server/render/cart.test.ts
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getInitialProducts } from '@/features/catalog/model/initial-data';
import { buildCartRenderPayload } from './cart';

describe('buildCartRenderPayload', () => {
  it('describes an empty cart', () => {
    const payload = buildCartRenderPayload({ items: [], totalItems: 0, totalPrice: 0 });

    assert.equal(payload.header, 'Your Shopping Cart');
    assert.equal(payload.paragraph, 'Your cart is empty.');
    assert.equal(payload.items.length, 0);
    assert.equal(payload.footer, undefined);
  });

  it('summarizes real cart items without inventing products', () => {
    const product = getInitialProducts().find((item) => item.id === 'iphone-15-pro-max');
    assert.ok(product);

    const payload = buildCartRenderPayload({
      items: [{ productId: product.id, product, quantity: 2 }],
      totalItems: 2,
      totalPrice: product.price * 2,
    });

    assert.match(payload.paragraph, /2 items/);
    assert.equal(payload.items[0]?.product.name, 'iPhone 15 Pro Max');
    assert.equal(payload.footer?.includes('adjust quantities'), true);
  });
});
