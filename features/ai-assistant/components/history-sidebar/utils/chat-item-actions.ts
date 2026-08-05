'use client';

import { assistantHttpHistoryClient } from '@/features/ai-assistant/client/assistant-history-client';

/**
 * Copy chat link with chatId param to clipboard.
 * Gracefully no-ops on server or if clipboard API is unavailable.
 */
export async function copyChatLink(chatId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const url = `${window.location.origin}/?chatId=${encodeURIComponent(chatId)}`;
    await navigator.clipboard.writeText(url);
    console.log('[chat-item-actions] Copied chat link:', url);
  } catch (error) {
    console.error('[chat-item-actions] Failed to copy chat link', error);
  }
}

/**
 * Delete a chat and its messages via API.
 * Uses the assistant-owned DELETE /api/ai-assistant/chat/[chatId] endpoint.
 */
export async function deleteChatWithMessages(chatId: string): Promise<void> {
  try {
    await assistantHttpHistoryClient.delete({ chatId });
  } catch (error) {
    console.error('[chat-item-actions] Error deleting chat', error);
    throw error;
  }
}
