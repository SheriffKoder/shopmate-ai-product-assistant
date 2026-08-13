/**
 * @file features/shop-assistant/schema/assistant-request-schema.test.ts
 * Unit tests for assistantRequestSchema and validateAssistantRequest.
 * Used in: local `npx tsx --test` runs.
 * Used for: Optional constraints, conversation metadata, and dropping unsafe filters.
 *
 * Run:
 * npx tsx --test features/shop-assistant/schema/assistant-request-schema.test.ts
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DEFAULT_ASSISTANT_CONSTRAINTS,
  DEFAULT_ASSISTANT_METADATA,
  type AssistantRequest,
} from '../model/assistant-request';
import { assistantRequestSchema, validateAssistantRequest } from './assistant-request-schema';

function request(partial: Partial<AssistantRequest> = {}): AssistantRequest {
  const { constraints, metadata, ...rest } = partial;

  return {
    action: 'catalog',
    catalogQuery: '',
    category: null,
    view: 'conversation',
    ...rest,
    constraints: {
      ...DEFAULT_ASSISTANT_CONSTRAINTS,
      ...constraints,
    },
    metadata: {
      ...DEFAULT_ASSISTANT_METADATA,
      ...metadata,
      items: metadata?.items ?? DEFAULT_ASSISTANT_METADATA.items,
    },
  };
}

describe('assistantRequestSchema', () => {
  it('accepts the slim closed-enum shape', () => {
    const parsed = assistantRequestSchema.parse({
      action: 'catalog',
      catalogQuery: 'smartphone',
      category: 'smartphone',
      constraints: {
        minPrice: null,
        maxPrice: 900,
        colors: ['black'],
        features: [],
        sortBy: 'price-low',
      },
      view: 'cards',
    });

    assert.equal(parsed.action, 'catalog');
    assert.equal(parsed.view, 'cards');
    assert.equal(parsed.category, 'smartphone');
    assert.deepEqual(parsed.metadata, { type: 'none', items: [] });
  });

  it('accepts constraints without sortBy', () => {
    const parsed = assistantRequestSchema.parse({
      action: 'catalog',
      catalogQuery: '',
      category: 'tablet',
      constraints: {
        minPrice: null,
        maxPrice: null,
        colors: [],
        features: [],
      },
      view: 'conversation',
    });

    assert.equal(parsed.category, 'tablet');
    assert.equal(parsed.constraints.sortBy, null);
    assert.deepEqual(parsed.metadata, { type: 'none', items: [] });
  });

  it('accepts metadata.buttons with catalog-category items', () => {
    const parsed = assistantRequestSchema.parse({
      action: 'catalog',
      catalogQuery: '',
      category: null,
      view: 'conversation',
      metadata: {
        type: 'buttons',
        items: [
          { label: 'Tablets', value: 'tablet' },
          { label: 'Laptops', value: 'laptop' },
        ],
      },
    });

    assert.equal(parsed.metadata.type, 'buttons');
    assert.deepEqual(parsed.metadata.items, [
      { label: 'Tablets', value: 'tablet' },
      { label: 'Laptops', value: 'laptop' },
    ]);
  });

  it('rejects unknown metadata.type', () => {
    assert.throws(() => assistantRequestSchema.parse({
      action: 'catalog',
      catalogQuery: '',
      category: null,
      view: 'conversation',
      metadata: { type: 'chips', items: [] },
    }));
  });

  it('rejects unknown actions and views', () => {
    assert.throws(() => assistantRequestSchema.parse({
      action: 'recommendation',
      catalogQuery: '',
      category: null,
      constraints: DEFAULT_ASSISTANT_CONSTRAINTS,
      view: 'table',
    }));
  });
});

describe('validateAssistantRequest', () => {
  it('keeps empty catalogQuery for browse-all', () => {
    const validated = validateAssistantRequest(request({ catalogQuery: '   ', view: 'sheet' }));

    assert.equal(validated.catalogQuery, '');
    assert.equal(validated.view, 'sheet');
  });

  it('trims catalogQuery and keeps a supported category', () => {
    const validated = validateAssistantRequest(request({
      catalogQuery: '  smart phones  ',
      category: 'smartphone',
    }));

    assert.equal(validated.catalogQuery, 'smart phones');
    assert.equal(validated.category, 'smartphone');
  });

  it('drops an unsupported category at runtime', () => {
    const validated = validateAssistantRequest(request({
      category: 'phones' as AssistantRequest['category'],
    }));

    assert.equal(validated.category, null);
  });

  it('drops negative prices, dedupes colors, and keeps sortBy', () => {
    const validated = validateAssistantRequest(request({
      constraints: {
        minPrice: -10,
        maxPrice: 900,
        colors: ['Black', ' black ', 'BLACK', ''],
        features: [' OLED ', 'oled'],
        sortBy: 'price-low',
      },
    }));

    assert.deepEqual(validated.constraints, {
      minPrice: null,
      maxPrice: 900,
      colors: ['black'],
      features: ['oled'],
      sortBy: 'price-low',
    });
  });

  it('trims metadata items, drops empty and non-category values, and caps at 3', () => {
    const validated = validateAssistantRequest(request({
      view: 'conversation',
      metadata: {
        type: 'buttons',
        items: [
          { label: ' Tablets ', value: 'Tablet' },
          { label: '', value: 'laptop' },
          { label: 'iPhone 16', value: 'iphone 16' },
          { label: 'Laptops', value: 'laptop' },
          { label: 'Phones', value: 'smartphone' },
          { label: 'Watches', value: 'smartwatch' },
          { label: 'Headphones', value: 'headphones' },
        ],
      },
    }));

    assert.deepEqual(validated.metadata, {
      type: 'buttons',
      items: [
        { label: 'Tablets', value: 'tablet' },
        { label: 'Laptops', value: 'laptop' },
        { label: 'Phones', value: 'smartphone' },
      ],
    });
  });

  it('collapses buttons with no surviving items to none', () => {
    const validated = validateAssistantRequest(request({
      view: 'conversation',
      metadata: {
        type: 'buttons',
        items: [{ label: 'iPhone', value: 'iphone' }],
      },
    }));

    assert.deepEqual(validated.metadata, { type: 'none', items: [] });
  });

  it('clears leftover items when metadata.type is none', () => {
    const validated = validateAssistantRequest(request({
      metadata: {
        type: 'none',
        items: [{ label: 'Tablets', value: 'tablet' }],
      },
    }));

    assert.deepEqual(validated.metadata, { type: 'none', items: [] });
  });
});
