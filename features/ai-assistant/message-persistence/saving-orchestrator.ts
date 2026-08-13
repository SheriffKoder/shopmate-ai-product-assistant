import type { UIMessage } from 'ai';
import {
  clearLocalChatHistory,
  deleteLocalChatHistoryItem,
  readLocalChatHistory,
  writeLocalChatHistory,
} from './lib/local-chat-history';
import type { LocalChatHistoryItem } from './model/local-chat-history';
import type { PersistenceMode } from './model/persistence-mode';

export class MessageSavingOrchestrator {
  constructor(private readonly mode: PersistenceMode) {}

  saveLocalChat(args: {
    chatId: string;
    title: string;
    messages: UIMessage[];
  }): void {
    if (this.mode !== 'local') return;

    const now = new Date().toISOString();
    const current = readLocalChatHistory().chats;
    const existing = current.find((chat) => chat.id === args.chatId);
    const nextChat: LocalChatHistoryItem = {
      id: args.chatId,
      title: args.title,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      messages: args.messages,
    };

    writeLocalChatHistory([
      nextChat,
      ...current.filter((chat) => chat.id !== args.chatId),
    ]);
  }

  getLocalChats(): LocalChatHistoryItem[] {
    return this.mode === 'local' ? readLocalChatHistory().chats : [];
  }

  deleteLocalChat(chatId: string): void {
    if (this.mode !== 'local') return;
    deleteLocalChatHistoryItem(chatId);
  }

  clearLocalChats(): void {
    clearLocalChatHistory();
  }
}
