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

  it('answers conversation in full and may cite store products when present', () => {
    const messages = buildSpeakerMessages({
      speaker: 'reply',
      render: 'conversation',
      userQuery: 'should i get an iphone or a samsung galaxy?',
      catalogNames: ['Samsung Galaxy S24 Ultra', 'iPhone 15 Pro Max'],
      catalogFacts: [
        'iPhone 15 Pro Max | $1199 | rating 4.7 | features: A17 Pro | Apple flagship',
        'Samsung Galaxy S24 Ultra | $1299 | rating 4.8 | features: S Pen | Android flagship',
      ],
      categoryHints: ['iPhone 15 Pro Max', 'Samsung Galaxy S24 Ultra'],
    });

    assert.ok(messages);
    assert.match(messages.system, /reply in full/i);
    assert.match(messages.prompt, /STORE CONTEXT:/);
    assert.match(messages.prompt, /iPhone 15 Pro Max/);
    assert.match(messages.prompt, /FIND CHIPS: iPhone 15 Pro Max, Samsung Galaxy S24 Ultra/);
    assert.doesNotMatch(messages.prompt, /Confirm briefly/);
  });

  it('answers open conversation without inventing SKUs when lookup is empty', () => {
    const messages = buildSpeakerMessages({
      speaker: 'reply',
      render: 'conversation',
      userQuery: 'which is better tablets or laptops for travel?',
      catalogNames: [],
      categoryHints: ['Tablets', 'Laptops'],
    });

    assert.ok(messages);
    assert.match(messages.prompt, /No matching store products/);
    assert.match(messages.prompt, /FIND CHIPS: Tablets, Laptops/);
    assert.doesNotMatch(messages.prompt, /Confirm briefly/);
  });

  it('answers product Q&A from catalog facts without dumping cards', () => {
    const messages = buildSpeakerMessages({
      speaker: 'reply',
      render: 'answer',
      userQuery: 'what features the iphone 15 pro max has?',
      catalogNames: ['iPhone 15 Pro Max'],
      catalogFacts: [
        'iPhone 15 Pro Max | $1199 | rating 4.7 | features: A17 Pro; Titanium | Apple flagship',
      ],
      categoryHints: ['iPhone 15 Pro Max'],
    });

    assert.ok(messages);
    assert.match(messages.prompt, /STORE CONTEXT:/);
    assert.match(messages.prompt, /A17 Pro; Titanium/);
    assert.match(messages.prompt, /Answer the question in full using only STORE CONTEXT/);
    assert.match(messages.prompt, /CATEGORY HINTS: iPhone 15 Pro Max/);
    assert.doesNotMatch(messages.prompt, /Product cards already rendered/);
    assert.doesNotMatch(messages.prompt, /Confirm briefly/);
  });

  it('still speaks answer when lookup is empty', () => {
    const messages = buildSpeakerMessages({
      speaker: 'reply',
      render: 'answer',
      userQuery: 'what features does the Pixel Ultra have?',
      lookupEmpty: true,
      catalogFacts: [],
    });

    assert.ok(messages);
    assert.match(messages.prompt, /no matching products/i);
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
