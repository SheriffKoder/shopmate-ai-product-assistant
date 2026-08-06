import type { LocalChatHistoryItem, LocalChatHistoryStore } from '../model/local-chat-history';

const LOCAL_CHAT_HISTORY_KEY = 'shopmate-chat-history';
const EMPTY_STORE: LocalChatHistoryStore = { version: 1, chats: [] };

export function readLocalChatHistory(): LocalChatHistoryStore {
  if (typeof window === 'undefined') return EMPTY_STORE;

  const stored = window.localStorage.getItem(LOCAL_CHAT_HISTORY_KEY);
  if (!stored) return EMPTY_STORE;

  try {
    const parsed = JSON.parse(stored) as LocalChatHistoryStore;
    return parsed.version === 1 && Array.isArray(parsed.chats) ? parsed : EMPTY_STORE;
  } catch {
    return EMPTY_STORE;
  }
}

export function writeLocalChatHistory(chats: LocalChatHistoryItem[]): void {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(
    LOCAL_CHAT_HISTORY_KEY,
    JSON.stringify({ version: 1, chats }),
  );
}

export function clearLocalChatHistory(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(LOCAL_CHAT_HISTORY_KEY);
}
