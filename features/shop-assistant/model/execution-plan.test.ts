/**
 * @file features/shop-assistant/model/execution-plan.test.ts
 * Unit tests for planFromSchema using architecture.md examples.
 * Used in: local `node --experimental-strip-types --test` runs.
 * Used for: Guarding lookup vs skip and view-does-not-override-action.
 *
 * Run:
 * npx tsx --test features/shop-assistant/model/execution-plan.test.ts
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DEFAULT_ASSISTANT_CONSTRAINTS,
  DEFAULT_ASSISTANT_METADATA,
  type AssistantRequest,
} from './assistant-request';
import { planFromSchema } from './execution-plan';

function request(
  partial: Pick<AssistantRequest, 'action' | 'view'> & Partial<AssistantRequest>,
): AssistantRequest {
  return {
    catalogQuery: '',
    category: null,
    constraints: DEFAULT_ASSISTANT_CONSTRAINTS,
    metadata: DEFAULT_ASSISTANT_METADATA,
    ...partial,
  };
}

describe('planFromSchema — architecture examples', () => {
  it('Show me smart phones → catalog cards, lookup', () => {
    const plan = planFromSchema(request({
      action: 'catalog',
      catalogQuery: 'smartphone',
      category: 'smartphone',
      view: 'cards',
    }));

    assert.deepEqual(plan, {
      action: 'catalog',
      view: 'cards',
      requiresCatalogLookup: true,
      render: 'cards',
      speaker: 'confirm',
    });
  });

  it('All available products in a table → catalog sheet, lookup', () => {
    const plan = planFromSchema(request({
      action: 'catalog',
      catalogQuery: '',
      category: null,
      view: 'sheet',
    }));

    assert.deepEqual(plan, {
      action: 'catalog',
      view: 'sheet',
      requiresCatalogLookup: true,
      render: 'sheet',
      speaker: 'confirm',
    });
  });

  it('Buying guide for our smartphones → catalog document, lookup', () => {
    const plan = planFromSchema(request({
      action: 'catalog',
      catalogQuery: 'smartphone',
      category: 'smartphone',
      view: 'document',
    }));

    assert.deepEqual(plan, {
      action: 'catalog',
      view: 'document',
      requiresCatalogLookup: true,
      render: 'document',
      speaker: 'confirm',
    });
  });

  it('Windows vs Mac laptops → technical document, no lookup', () => {
    const plan = planFromSchema(request({
      action: 'technical',
      catalogQuery: '',
      category: null,
      view: 'document',
    }));

    assert.deepEqual(plan, {
      action: 'technical',
      view: 'document',
      requiresCatalogLookup: false,
      render: 'document',
      speaker: 'confirm',
    });
  });

  it('Edit my cart → cart UI, no lookup', () => {
    const plan = planFromSchema(request({
      action: 'cart',
      catalogQuery: '',
      category: null,
      view: 'conversation',
    }));

    assert.deepEqual(plan, {
      action: 'cart',
      view: 'conversation',
      requiresCatalogLookup: false,
      render: 'cart',
      speaker: 'confirm',
    });
  });
});

describe('planFromSchema — remaining action/view pairs', () => {
  it('unrelated → refuse, no lookup', () => {
    const plan = planFromSchema(request({ action: 'unrelated', view: 'conversation' }));

    assert.equal(plan.requiresCatalogLookup, false);
    assert.equal(plan.render, 'refuse');
    assert.equal(plan.speaker, 'reply');
  });

  it('policy → policy speaker, no lookup', () => {
    const plan = planFromSchema(request({ action: 'policy', view: 'conversation' }));

    assert.equal(plan.requiresCatalogLookup, false);
    assert.equal(plan.render, 'policy');
    assert.equal(plan.speaker, 'reply');
  });

  it('technical + conversation → speaker, no lookup', () => {
    const plan = planFromSchema(request({ action: 'technical', view: 'conversation' }));

    assert.equal(plan.requiresCatalogLookup, false);
    assert.equal(plan.render, 'conversation');
    assert.equal(plan.speaker, 'reply');
  });

  it('catalog + conversation → lookup flagged then speaker (runtime skips search)', () => {
    const plan = planFromSchema(request({ action: 'catalog', view: 'conversation' }));

    assert.equal(plan.requiresCatalogLookup, true);
    assert.equal(plan.render, 'conversation');
    assert.equal(plan.speaker, 'reply');
  });

  it('catalog + answer → lookup for speaker facts, no cards', () => {
    const plan = planFromSchema(request({
      action: 'catalog',
      catalogQuery: 'iphone 15 pro max',
      category: 'smartphone',
      view: 'answer',
    }));

    assert.deepEqual(plan, {
      action: 'catalog',
      view: 'answer',
      requiresCatalogLookup: true,
      render: 'answer',
      speaker: 'reply',
    });
  });
});

describe('planFromSchema — view never overrides action', () => {
  it('cart + document still renders cart and skips lookup', () => {
    const plan = planFromSchema(request({ action: 'cart', view: 'document' }));

    assert.equal(plan.requiresCatalogLookup, false);
    assert.equal(plan.render, 'cart');
  });

  it('unrelated + sheet still refuses and skips lookup', () => {
    const plan = planFromSchema(request({ action: 'unrelated', view: 'sheet' }));

    assert.equal(plan.requiresCatalogLookup, false);
    assert.equal(plan.render, 'refuse');
  });

  it('technical + cards becomes conversation, not catalog cards', () => {
    const plan = planFromSchema(request({ action: 'technical', view: 'cards' }));

    assert.equal(plan.requiresCatalogLookup, false);
    assert.equal(plan.render, 'conversation');
    assert.equal(plan.speaker, 'reply');
  });

  it('technical + sheet becomes conversation, not a catalog sheet', () => {
    const plan = planFromSchema(request({ action: 'technical', view: 'sheet' }));

    assert.equal(plan.requiresCatalogLookup, false);
    assert.equal(plan.render, 'conversation');
  });

  it('policy + document still speaks policy, not createDocument', () => {
    const plan = planFromSchema(request({ action: 'policy', view: 'document' }));

    assert.equal(plan.requiresCatalogLookup, false);
    assert.equal(plan.render, 'policy');
    assert.equal(plan.speaker, 'reply');
  });
});
