/**
 * @file features/shop-assistant/lib/runtime-steps.test.ts
 * Unit tests for runtime thinking-step labels.
 *
 * Run:
 * npx tsx --test features/shop-assistant/lib/runtime-steps.test.ts
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  RUNTIME_STEP_IDS,
  getActionStep,
  getCheckingStoreStep,
  getClassifyingStep,
  getRenderStep,
  getResolutionStep,
} from './runtime-steps';

describe('runtime-steps', () => {
  it('classifying uses a stable id for loading → done upsert', () => {
    assert.equal(getClassifyingStep('loading').id, RUNTIME_STEP_IDS.classifying);
    assert.equal(getClassifyingStep('done').label, 'Classifying');
  });

  it('maps actions to user-facing gate labels', () => {
    assert.equal(getActionStep('catalog').label, 'Catalog');
    assert.equal(getActionStep('cart').label, 'Cart');
    assert.equal(getActionStep('policy').label, 'Store policy');
    assert.equal(getActionStep('technical').label, 'Technical discussion');
    assert.equal(getActionStep('unrelated').label, 'Not related');
  });

  it('checking store is only the lookup progress step', () => {
    assert.deepEqual(getCheckingStoreStep('loading'), {
      id: RUNTIME_STEP_IDS.checkingStore,
      label: 'Checking store',
      summary: 'Looking up matching products.',
      status: 'loading',
    });
  });

  it('skips render steps when action already covers the outcome', () => {
    assert.equal(getRenderStep('refuse'), null);
    assert.equal(getRenderStep('cart'), null);
  });

  it('maps catalog presentations to distinct step ids', () => {
    assert.equal(getRenderStep('cards')?.id, RUNTIME_STEP_IDS.showingCards);
    assert.equal(getRenderStep('sheet')?.label, 'Preparing table');
    assert.equal(getRenderStep('document')?.id, RUNTIME_STEP_IDS.preparingDocument);
    assert.equal(getRenderStep('answer')?.label, 'Answering product');
    assert.equal(getRenderStep('conversation')?.id, RUNTIME_STEP_IDS.preparingResponse);
    assert.equal(getRenderStep('policy')?.label, 'Preparing response');
  });

  it('resolution is a stable group header with kind resolution', () => {
    const step = getResolutionStep({
      action: 'catalog',
      render: 'cards',
      status: 'done',
    });
    assert.equal(step.id, RUNTIME_STEP_IDS.resolution);
    assert.equal(step.kind, 'resolution');
    assert.equal(step.label, 'Products ready');
    assert.equal(step.status, 'done');
  });

  it('maps resolution labels from action and render', () => {
    assert.equal(
      getResolutionStep({ action: 'cart', render: 'cart', status: 'done' }).label,
      'Cart ready',
    );
    assert.equal(
      getResolutionStep({ action: 'catalog', render: 'sheet', status: 'done' }).label,
      'Table ready',
    );
    assert.equal(
      getResolutionStep({ action: 'catalog', render: 'answer', status: 'done' }).label,
      'Answer ready',
    );
    assert.equal(
      getResolutionStep({ action: 'unrelated', render: 'refuse', status: 'done' }).label,
      'Not related',
    );
  });

  it('marks resolution as failed when status is error', () => {
    const step = getResolutionStep({
      action: 'catalog',
      render: 'cards',
      status: 'error',
    });
    assert.equal(step.label, 'Products failed');
    assert.equal(step.status, 'error');
  });
});
