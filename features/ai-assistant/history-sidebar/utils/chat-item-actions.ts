'use client';

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
 * Assumes a DELETE /api/chat/[chatId] endpoint exists.
 */
export async function deleteChatWithMessages(chatId: string): Promise<void> {
  try {
    const res = await fetch(`/api/chat/${chatId}`, { method: 'DELETE' });
    if (!res.ok) {
      const text = await res.text();
      console.error('[chat-item-actions] Delete failed', res.status, text);
      throw new Error(`Failed to delete chat: ${res.status}`);
    }
    console.log('[chat-item-actions] Deleted chat:', chatId);
  } catch (error) {
    console.error('[chat-item-actions] Error deleting chat', error);
    throw error;
  }
}

