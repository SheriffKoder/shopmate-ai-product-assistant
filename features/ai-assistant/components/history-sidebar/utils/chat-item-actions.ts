'use client';

import { assistantHttpHistoryClient } from '@/features/ai-assistant/client/assistant-history-client';
import { buildAssistantAwareHref } from '@/features/ai-assistant/navigation';
import type { PersistenceMode } from '@/features/ai-assistant/message-persistence/model/persistence-mode';
import { MessageSavingOrchestrator } from '@/features/ai-assistant/message-persistence/saving-orchestrator';

/**
 * Copy chat link with chatId param to clipboard.
 * Gracefully no-ops on server or if clipboard API is unavailable.
 */
export async function copyChatLink(chatId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);
    params.set('chatId', chatId);
    const href = buildAssistantAwareHref(window.location.pathname, params);
    const url = new URL(href, window.location.origin);

    await navigator.clipboard.writeText(url.toString());
    console.log('[chat-item-actions] Copied chat link:', url.toString());
  } catch (error) {
    console.error('[chat-item-actions] Failed to copy chat link', error);
  }
}

/**
 * Delete a chat from the active persistence store.
 * Guest chats live in localStorage; signed-in chats use DELETE /api/ai-assistant/chat/[chatId].
 */
export async function deleteChatWithMessages(
  chatId: string,
  persistenceMode: PersistenceMode = 'database',
): Promise<void> {
  if (persistenceMode === 'local') {
    new MessageSavingOrchestrator('local').deleteLocalChat(chatId);
    return;
  }

  try {
    await assistantHttpHistoryClient.delete({ chatId });
  } catch (error) {
    console.error('[chat-item-actions] Error deleting chat', error);
    throw error;
  }
}
