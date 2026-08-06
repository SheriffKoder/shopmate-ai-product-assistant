/**
 * @file features/ai-assistant/test/in-memory-assistant-persistence.ts
 * In-memory assistant persistence adapter.
 *
 * Purpose: Provides isolated persistence for tests and assistant-only development.
 * Used in: unit/integration tests and future provider-free composition examples.
 */

import type { UIMessage } from 'ai';
import type { AssistantPersistence } from '../message-persistence/model/assistant-persistence';

export function createInMemoryAssistantPersistence(): AssistantPersistence {
  const chats = new Set<string>();
  const messages = new Map<string, UIMessage[]>();

  return {
    async loadOrCreateChat({ chatId, messages: incomingMessages }) {
      const id = chatId || `test-chat-${chats.size + 1}`;
      chats.add(id);
      messages.set(id, messages.get(id) || [...incomingMessages]);
      return { chatId: id };
    },

    async saveLatestUserMessage({ chatId, messages: incomingMessages }) {
      const current = messages.get(chatId) || [];
      const latest = incomingMessages.find((message) => message.role === 'user');

      if (latest && !current.some((message) => message.id === latest.id)) {
        messages.set(chatId, [...current, latest]);
      }
    },

    async saveAssistantMessages({ chatId, messages: incomingMessages }) {
      const current = messages.get(chatId) || [];
      const assistantMessages = incomingMessages.filter((message) => message.role === 'assistant');
      messages.set(chatId, [
        ...current,
        ...assistantMessages.filter(
          (message) => !current.some((existing) => existing.id === message.id)
        ),
      ]);
    },
  };
}
