/**
 * @file features/ai-assistant/message-persistence/lib/prepare-guest-chat-save.ts
 * Pure prep for guest (localStorage) chat saves after a turn finishes.
 * Used in: chat-container onFinish when persistenceMode is local.
 * Used for: Title + thinking-step snapshot without bloating the chat orchestrator.
 *
 * Function Index:
 * getLocalChatTitle: First user text, or a fallback label.
 * prepareGuestChatSave: Messages ready for MessageSavingOrchestrator.saveLocalChat.
 *
 * Steps:
 * 1. Derive a sidebar title from the first user text part.
 * 2. Keep an existing thinking-steps part when the server already streamed one.
 * 3. Otherwise attach steps from the live client collector ref.
 */

import type { UIMessage } from 'ai';
import type { AssistantStepEvent } from '../../model/assistant-events';
import {
  attachThinkingStepsToMessages,
  hasThinkingStepsPart,
} from '../../lib/thinking-steps-part';

/**
 * Sidebar title for a guest chat: first user text, else "New conversation".
 *
 * @example
 * getLocalChatTitle([{ id: 'u1', role: 'user', parts: [{ type: 'text', text: 'Show phones' }] }])
 */
export function getLocalChatTitle(messages: UIMessage[]): string {
  // 1. Find the first user message with a text part.
  const firstUser = messages.find((message) => message.role === 'user');
  const firstTextPart = firstUser?.parts?.find(
    (part) => part && typeof part === 'object' && (part as { type?: string }).type === 'text',
  ) as { text?: string } | undefined;

  const text = firstTextPart?.text?.trim();
  // 2. Fall back when the turn has no displayable user text.
  return text || 'New conversation';
}

/**
 * Prepare title + messages for a guest localStorage save.
 * Prefer the server's non-transient thinking-steps part; fall back to live steps.
 *
 * @example
 * prepareGuestChatSave({ messages, thinkingSteps: assistantStepsRef.current })
 */
export function prepareGuestChatSave(input: {
  messages: UIMessage[];
  thinkingSteps: AssistantStepEvent[];
}): {
  title: string;
  messages: UIMessage[];
} {
  // 1. Title for the sidebar history list.
  const title = getLocalChatTitle(input.messages);

  // 2. Last assistant already has the snapshot from the stream — keep messages as-is.
  const lastAssistant = [...input.messages].reverse().find((message) => message.role === 'assistant');
  if (hasThinkingStepsPart(lastAssistant) || input.thinkingSteps.length === 0) {
    return { title, messages: input.messages };
  }

  // 3. Stream missed the snapshot (race / older turn) — attach from the live ref.
  return {
    title,
    messages: attachThinkingStepsToMessages(input.messages, input.thinkingSteps),
  };
}
