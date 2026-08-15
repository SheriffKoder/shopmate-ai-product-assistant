/**
 * @file features/ai-assistant/lib/thinking-steps-part.ts
 * Pure helpers for persisted thinking-step message parts.
 * Used in: handle-assistant-request, prepare-guest-chat-save, message-list.
 * Used for: Attaching a non-transient snapshot so refresh/history remounts the thinking panel.
 *
 * Function Index:
 * getThinkingStepsPart: Read steps from a data-assistant-thinking-steps part.
 * attachThinkingStepsToMessages: Upsert the snapshot onto the last assistant message.
 * hasThinkingStepsPart: True when a message already carries the persisted snapshot.
 *
 * Steps:
 * 1. Prefer an existing message part (server streamed it non-transient).
 * 2. Otherwise attach steps from the live collector / client ref.
 * 3. Never duplicate the part type on the same message.
 */

import type { UIMessage } from 'ai';
import type { AssistantStepEvent } from '../model/assistant-events';

/** Persisted message part type for the finished thinking-step list. */
export const THINKING_STEPS_PART_TYPE = 'data-assistant-thinking-steps' as const;

/**
 * Read thinking steps from a persisted message part.
 * Returns null when the part is missing or not an array.
 *
 * @example
 * getThinkingStepsPart({ type: 'data-assistant-thinking-steps', data: [{ id: 'a', label: 'Catalog', status: 'done' }] })
 */
export function getThinkingStepsPart(part: unknown): AssistantStepEvent[] | null {
  // 1. Only the dedicated thinking-steps part type is valid.
  if (!part || typeof part !== 'object') return null;

  const typed = part as { type?: unknown; data?: unknown };
  if (typed.type !== THINKING_STEPS_PART_TYPE || !Array.isArray(typed.data)) {
    return null;
  }

  // 2. Upsert by id so loading → done replacements stay one row per step.
  return typed.data.reduce<AssistantStepEvent[]>((steps, step) => {
    if (!step || typeof step !== 'object') return steps;
    const next = step as AssistantStepEvent;
    if (typeof next.id !== 'string' || typeof next.label !== 'string') return steps;

    const existingIndex = steps.findIndex((current) => current.id === next.id);
    if (existingIndex === -1) return [...steps, next];
    return steps.map((current, index) => (index === existingIndex ? next : current));
  }, []);
}

/**
 * True when the message already has a persisted thinking-steps snapshot.
 *
 * @example
 * hasThinkingStepsPart({ role: 'assistant', parts: [{ type: 'data-assistant-thinking-steps', data: [] }] })
 */
export function hasThinkingStepsPart(message: { parts?: unknown[] } | null | undefined): boolean {
  return Boolean(
    message?.parts?.some(
      (part) => part && typeof part === 'object' && (part as { type?: string }).type === THINKING_STEPS_PART_TYPE,
    ),
  );
}

/**
 * Attach (or replace) thinking steps on the last assistant message.
 * No-op when steps are empty or there is no assistant message.
 *
 * @example
 * attachThinkingStepsToMessages(messages, [{ id: 'resolution', label: 'Products ready', status: 'done', kind: 'resolution' }])
 */
export function attachThinkingStepsToMessages(
  messages: UIMessage[],
  steps: AssistantStepEvent[],
): UIMessage[] {
  // 1. Nothing to persist.
  if (steps.length === 0) return messages;

  // 2. Snapshot belongs on the latest assistant turn only.
  const lastAssistantIndex = messages.findLastIndex((message) => message.role === 'assistant');
  if (lastAssistantIndex < 0) return messages;

  // 3. Replace any prior thinking-steps part so upserts stay a single part.
  return messages.map((message, index) => {
    if (index !== lastAssistantIndex) return message;

    const parts = (message.parts || []).filter(
      (part) => !(part && typeof part === 'object' && (part as { type?: string }).type === THINKING_STEPS_PART_TYPE),
    );

    return {
      ...message,
      parts: [
        ...parts,
        { type: THINKING_STEPS_PART_TYPE, data: steps },
      ],
    } as UIMessage;
  });
}
