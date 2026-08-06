import type { UIMessage } from 'ai';

export interface LocalChatHistoryItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: UIMessage[];
}

export interface LocalChatHistoryStore {
  chats: LocalChatHistoryItem[];
  version: 1;
}
