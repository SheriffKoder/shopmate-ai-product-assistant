/**
 * @file features/ai-assistant/lib/thinking-steps-part.test.ts
 * Unit tests for persisted thinking-step message parts.
 *
 * Run:
 * npx tsx --test features/ai-assistant/lib/thinking-steps-part.test.ts
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { UIMessage } from 'ai';
import {
  THINKING_STEPS_PART_TYPE,
  attachThinkingStepsToMessages,
  getThinkingStepsPart,
  hasThinkingStepsPart,
} from './thinking-steps-part';

describe('thinking-steps-part', () => {
  it('reads and upserts steps from a persisted part', () => {
    const steps = getThinkingStepsPart({
      type: THINKING_STEPS_PART_TYPE,
      data: [
        { id: 'a', label: 'Classifying', status: 'loading' },
        { id: 'a', label: 'Classifying', status: 'done' },
      ],
    });

    assert.equal(steps?.length, 1);
    assert.equal(steps?.[0]?.status, 'done');
  });

  it('attaches steps onto the last assistant message only', () => {
    const messages = [
      { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'hi' }] },
      { id: 'a1', role: 'assistant', parts: [{ type: 'text', text: 'hello' }] },
    ] as UIMessage[];

    const next = attachThinkingStepsToMessages(messages, [
      { id: 'resolution', label: 'Products ready', status: 'done', kind: 'resolution' },
    ]);

    assert.equal(hasThinkingStepsPart(next[1]), true);
    assert.equal(hasThinkingStepsPart(next[0]), false);
  });
});
