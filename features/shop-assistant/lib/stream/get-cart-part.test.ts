/**
 * @file features/shop-assistant/lib/stream/get-cart-part.test.ts
 * Unit tests for persisted data-cart parsing.
 * Used in: local `npx tsx --test` runs.
 * Used for: Remounting cart UI from stream parts, not AI tool results.
 *
 * Run:
 * npx tsx --test features/shop-assistant/lib/stream/get-cart-part.test.ts
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getInitialProducts } from '@/features/catalog/model/initial-data';
import { buildCartRenderPayload } from '../../server/render/cart';
import { getCartPart } from './get-cart-part';

describe('getCartPart', () => {
  it('reads a filled cart snapshot from a data-cart part', () => {
    const product = getInitialProducts().find((item) => item.id === 'iphone-15-pro-max');
    assert.ok(product);

    const payload = buildCartRenderPayload({
      items: [{ productId: product.id, product, quantity: 2 }],
      totalItems: 2,
      totalPrice: product.price * 2,
    });
    const part = getCartPart({ type: 'data-cart', data: payload });

    assert.ok(part);
    assert.equal(part.items[0]?.product.name, 'iPhone 15 Pro Max');
    assert.equal(part.totalItems, 2);
  });

  it('ignores unknown or incomplete parts', () => {
    assert.equal(getCartPart({ type: 'data-cartUpdate', data: { items: [] } }), null);
    assert.equal(getCartPart({ type: 'data-cart', data: { header: 'Cart' } }), null);
  });
});
