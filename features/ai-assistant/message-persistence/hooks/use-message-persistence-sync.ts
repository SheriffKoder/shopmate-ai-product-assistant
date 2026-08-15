'use client';

import { useEffect, useState } from 'react';
import { useUserSession } from '@/features/ai-assistant/providers/user-session-context';
import { clearLocalChatHistory, readLocalChatHistory } from '../lib/local-chat-history';

export function useMessagePersistenceSync(onMerged?: () => void) {
  const { user } = useUserSession();
  const [isMerging, setIsMerging] = useState(false);

  useEffect(function mergeGuestHistoryAfterLogin() {
    if (!user || isMerging) return;

    const chats = readLocalChatHistory().chats;
    if (chats.length === 0) return;

    let isCancelled = false;
    setIsMerging(true);

    fetch('/api/ai-assistant/history/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chats }),
    })
      .then(function handleMergeResponse(response) {
        if (!response.ok) throw new Error('Failed to merge local history');
        clearLocalChatHistory();
        if (!isCancelled) onMerged?.();
      })
      .catch(function handleMergeError(error) {
        console.error('[message-persistence] Local history merge failed:', error);
      })
      .finally(function finishMerge() {
        if (!isCancelled) setIsMerging(false);
      });

    return function cancelMerge() {
      isCancelled = true;
    };
  }, [user, isMerging, onMerged]);

  return { isMerging };
}
