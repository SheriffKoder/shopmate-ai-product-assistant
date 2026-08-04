/**
 * @file features/ai-assistant/model/assistant-persistence.ts
 * Generic assistant persistence contract.
 *
 * Purpose: Keeps the assistant request handler independent from Supabase details.
 * Used in: assistant request handling and the default Supabase adapter.
 */

import type { UIMessage } from 'ai';

export interface AssistantChatSession {
  chatId: string;
}

export interface AssistantPersistence {
  loadOrCreateChat(args: { chatId?: string; messages: UIMessage[] }): Promise<AssistantChatSession>;
  saveLatestUserMessage(args: { chatId: string; messages: UIMessage[] }): Promise<void>;
  saveAssistantMessages(args: { chatId: string; messages: UIMessage[] }): Promise<void>;
}

export interface AssistantHistoryItem {
  id: string;
  title: string;
  createdAt: string;
}

export interface AssistantHistoryPage {
  chats: AssistantHistoryItem[];
  hasMore: boolean;
  nextCursor?: string;
}

/** Provider-neutral operations required by the history sidebar. */
export interface AssistantHistoryClient {
  list(args: { cursor?: string; limit?: number }): Promise<AssistantHistoryPage>;
  delete(args: { chatId: string }): Promise<void>;
}
