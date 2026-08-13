/**
 * @file features/shop-assistant/server/speaker.test.ts
 * Unit tests for speaker prompt selection.
 * Used in: local `npx tsx --test` runs.
 * Used for: Skipping deterministic paths and keeping confirm/reply on real context.
 *
 * Run:
 * npx tsx --test features/shop-assistant/server/speaker.test.ts
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildSpeakerMessages } from './speaker';

describe('buildSpeakerMessages', () => {
  it('skips refuse, policy, none, and empty lookup', () => {
    assert.equal(
      buildSpeakerMessages({ speaker: 'reply', render: 'refuse', userQuery: 'Who is Elon Musk?' }),
      null,
    );
    assert.equal(
      buildSpeakerMessages({ speaker: 'reply', render: 'policy', userQuery: 'What is the return policy?' }),
      null,
    );
    assert.equal(
      buildSpeakerMessages({ speaker: 'none', render: 'conversation', userQuery: 'Hi' }),
      null,
    );
    assert.equal(
      buildSpeakerMessages({
        speaker: 'confirm',
        render: 'cards',
        userQuery: 'Show me smart phones',
        lookupEmpty: true,
      }),
      null,
    );
  });

  it('confirms cards using only lookup names', () => {
    const messages = buildSpeakerMessages({
      speaker: 'confirm',
      render: 'cards',
      userQuery: 'Show me smart phones',
      catalogNames: ['Samsung Galaxy S24 Ultra', 'iPhone 15 Pro Max'],
    });

    assert.ok(messages);
    assert.match(messages.system, /Do not invent product names/);
    assert.match(messages.prompt, /STORE CONTEXT: Samsung Galaxy S24 Ultra, iPhone 15 Pro Max/);
    assert.match(messages.prompt, /Product cards already rendered/);
  });

  it('answers conversation in full without SKUs or a brief confirm', () => {
    const messages = buildSpeakerMessages({
      speaker: 'reply',
      render: 'conversation',
      userQuery: 'which is better tablets or laptops for travel?',
      catalogNames: ['iPhone 15 Pro Max'],
      categoryHints: ['Tablets', 'Laptops'],
    });

    assert.ok(messages);
    assert.match(messages.system, /reply in full/i);
    assert.match(messages.prompt, /Answer the question in full/);
    assert.match(messages.prompt, /CATEGORY HINTS: Tablets, Laptops/);
    assert.doesNotMatch(messages.prompt, /Confirm briefly/);
    assert.doesNotMatch(messages.prompt, /STORE CONTEXT/);
    assert.doesNotMatch(messages.prompt, /iPhone 15 Pro Max/);
  });

  it('still speaks conversation when lookupEmpty is set after a skipped search', () => {
    const messages = buildSpeakerMessages({
      speaker: 'reply',
      render: 'conversation',
      userQuery: 'what products can be matching for writing on the go?',
      lookupEmpty: true,
    });

    assert.ok(messages);
    assert.match(messages.prompt, /Answer the question in full/);
  });
});
