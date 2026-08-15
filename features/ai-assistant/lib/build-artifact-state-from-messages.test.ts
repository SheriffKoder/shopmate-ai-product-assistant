/**
 * @file features/ai-assistant/lib/build-artifact-state-from-messages.test.ts
 * Unit tests for artifact hydrate builder.
 *
 * Run:
 * npx tsx --test features/ai-assistant/lib/build-artifact-state-from-messages.test.ts
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { UIMessage } from 'ai';
import { buildArtifactStateFromMessages } from './build-artifact-state-from-messages';

describe('buildArtifactStateFromMessages', () => {
  it('returns null when no artifact content part exists', () => {
    const messages = [
      { id: 'a1', role: 'assistant', parts: [{ type: 'text', text: 'hi' }] },
    ] as UIMessage[];

    assert.equal(buildArtifactStateFromMessages(messages), null);
  });

  it('maps data-artifactContent onto a complete UIArtifact seed', () => {
    const messages = [
      {
        id: 'a1',
        role: 'assistant',
        parts: [{
          type: 'data-artifactContent',
          data: {
            documentId: 'doc-1',
            title: 'Catalog',
            kind: 'sheet',
            content: 'a,b',
          },
        }],
      },
    ] as UIMessage[];

    const artifact = buildArtifactStateFromMessages(messages);
    assert.equal(artifact?.documentId, 'doc-1');
    assert.equal(artifact?.title, 'Catalog');
    assert.equal(artifact?.kind, 'sheet');
    assert.equal(artifact?.content, 'a,b');
    assert.equal(artifact?.status, 'complete');
    assert.equal(artifact?.isVisible, false);
  });
});
