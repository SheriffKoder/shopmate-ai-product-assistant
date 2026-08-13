/**
 * @file features/shop-assistant/lib/catalog/runtime-lookup.test.ts
 * Unit tests for resolveRuntimeLookup and catalogRenderTitle.
 * Used in: local `npx tsx --test` runs.
 * Used for: Browse-all emptying, sheet limits, skip-lookup, and artifact titles.
 *
 * Run:
 * npx tsx --test features/shop-assistant/lib/catalog/runtime-lookup.test.ts
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DEFAULT_ASSISTANT_CONSTRAINTS,
  DEFAULT_ASSISTANT_REQUEST,
  type AssistantRequest,
} from '../../model/assistant-request';
import { planFromSchema } from '../../model/execution-plan';
import {
  DEFAULT_LOOKUP_LIMIT,
  SHEET_LOOKUP_LIMIT,
  catalogRenderTitle,
  resolveRuntimeLookup,
} from './runtime-lookup';

function request(partial: Partial<AssistantRequest> = {}): AssistantRequest {
  const { constraints, ...rest } = partial;

  return {
    ...DEFAULT_ASSISTANT_REQUEST,
    ...rest,
    constraints: {
      ...DEFAULT_ASSISTANT_CONSTRAINTS,
      ...constraints,
    },
  };
}

describe('resolveRuntimeLookup', () => {
  it('empties invented keywords for browse-all table wording', () => {
    const assistantRequest = request({
      action: 'catalog',
      catalogQuery: 'all products',
      view: 'sheet',
    });
    const plan = planFromSchema(assistantRequest);
    const lookup = resolveRuntimeLookup({
      userQuery: 'All available products in ShopMate in a table',
      request: assistantRequest,
      plan,
    });

    assert.equal(lookup.shouldLookup, true);
    assert.equal(lookup.browseAll, true);
    assert.equal(lookup.lookupQuery, '');
    assert.equal(lookup.limit, SHEET_LOOKUP_LIMIT);
  });

  it('treats empty catalogQuery as browse-all', () => {
    const assistantRequest = request({
      action: 'catalog',
      catalogQuery: '',
      view: 'cards',
    });
    const plan = planFromSchema(assistantRequest);
    const lookup = resolveRuntimeLookup({
      userQuery: 'What products do you have?',
      request: assistantRequest,
      plan,
    });

    assert.equal(lookup.shouldLookup, true);
    assert.equal(lookup.browseAll, true);
    assert.equal(lookup.lookupQuery, '');
    assert.equal(lookup.limit, DEFAULT_LOOKUP_LIMIT);
  });

  it('keeps a smartphone catalogQuery for show-me prompts', () => {
    const assistantRequest = request({
      action: 'catalog',
      catalogQuery: 'smartphone',
      category: 'smartphone',
      view: 'cards',
    });
    const plan = planFromSchema(assistantRequest);
    const lookup = resolveRuntimeLookup({
      userQuery: 'Show me smart phones',
      request: assistantRequest,
      plan,
    });

    assert.equal(lookup.shouldLookup, true);
    assert.equal(lookup.browseAll, false);
    assert.equal(lookup.lookupQuery, 'smartphone');
    assert.equal(lookup.limit, DEFAULT_LOOKUP_LIMIT);
  });

  it('skips lookup for cart even if catalogQuery is filled', () => {
    const assistantRequest = request({
      action: 'cart',
      catalogQuery: 'iphone',
      view: 'conversation',
    });
    const plan = planFromSchema(assistantRequest);
    const lookup = resolveRuntimeLookup({
      userQuery: 'Edit my cart',
      request: assistantRequest,
      plan,
    });

    assert.equal(plan.requiresCatalogLookup, false);
    assert.equal(lookup.shouldLookup, false);
  });

  it('looks up for conversation when category is set even if catalogQuery is empty', () => {
    const assistantRequest = request({
      action: 'catalog',
      catalogQuery: '',
      category: 'tablet',
      view: 'conversation',
    });
    const plan = planFromSchema(assistantRequest);
    const lookup = resolveRuntimeLookup({
      userQuery: 'what tablets would work for travel notes?',
      request: assistantRequest,
      plan,
    });

    assert.equal(plan.requiresCatalogLookup, true);
    assert.equal(plan.render, 'conversation');
    assert.equal(lookup.shouldLookup, true);
  });

  it('skips lookup for open conversation with no category and no query', () => {
    const assistantRequest = request({
      action: 'catalog',
      catalogQuery: '',
      category: null,
      view: 'conversation',
    });
    const plan = planFromSchema(assistantRequest);
    const lookup = resolveRuntimeLookup({
      userQuery: 'i plan to write often my diary on the go, what products can be matching?',
      request: assistantRequest,
      plan,
    });

    assert.equal(lookup.shouldLookup, false);
  });

  it('looks up for conversation when comparing products in one aisle', () => {
    const assistantRequest = request({
      action: 'catalog',
      catalogQuery: '',
      category: 'smartphone',
      view: 'conversation',
    });
    const plan = planFromSchema(assistantRequest);
    const lookup = resolveRuntimeLookup({
      userQuery: 'should i get an iphone or a samsung galaxy?',
      request: assistantRequest,
      plan,
    });

    assert.equal(plan.render, 'conversation');
    assert.equal(lookup.shouldLookup, true);
  });

  it('looks up for catalog answer so the speaker can cite store facts', () => {
    const assistantRequest = request({
      action: 'catalog',
      catalogQuery: 'iphone 15 pro max',
      category: 'smartphone',
      view: 'answer',
    });
    const plan = planFromSchema(assistantRequest);
    const lookup = resolveRuntimeLookup({
      userQuery: 'what features the iphone 15 pro max has?',
      request: assistantRequest,
      plan,
    });

    assert.equal(plan.render, 'answer');
    assert.equal(lookup.shouldLookup, true);
    assert.equal(lookup.browseAll, false);
    assert.equal(lookup.lookupQuery, 'iphone 15 pro max');
  });

  it('skips lookup for unrelated and technical', () => {
    const unrelated = request({ action: 'unrelated', view: 'conversation' });
    const technical = request({ action: 'technical', view: 'document' });

    assert.equal(
      resolveRuntimeLookup({
        userQuery: 'Who is Elon Musk?',
        request: unrelated,
        plan: planFromSchema(unrelated),
      }).shouldLookup,
      false,
    );
    assert.equal(
      resolveRuntimeLookup({
        userQuery: 'Windows vs Mac laptops',
        request: technical,
        plan: planFromSchema(technical),
      }).shouldLookup,
      false,
    );
  });
});

describe('catalogRenderTitle', () => {
  it('uses the all-products sheet title for browse-all', () => {
    assert.equal(
      catalogRenderTitle(true, 'sheet', 'All available products in a table'),
      'All available ShopMate products',
    );
  });

  it('uses the user query for a catalog buying guide', () => {
    assert.equal(
      catalogRenderTitle(false, 'document', 'Buying guide for our smartphones'),
      'Buying guide for our smartphones',
    );
  });
});
