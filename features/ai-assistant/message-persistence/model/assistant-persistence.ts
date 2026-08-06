/** Generic assistant message-persistence contracts. */

import type { UIMessage } from 'ai';

export interface AssistantChatSession { chatId: string; }

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

export interface AssistantHistoryClient {
  list(args: { cursor?: string; limit?: number }): Promise<AssistantHistoryPage>;
  delete(args: { chatId: string }): Promise<void>;
}
