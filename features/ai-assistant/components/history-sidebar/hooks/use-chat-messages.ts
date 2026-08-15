/**
 * @file features/ai-assistant/components/history-sidebar/hooks/use-chat-messages.ts
 * Load chat messages when the URL chatId changes.
 * Used in: chat-container.tsx.
 * Used for: Restoring DB or localStorage history into useChat, and resetting artifact state.
 *
 * Function Index:
 * useChatMessages: Fetch/restore messages for a chatId; clear on new chat.
 *
 * Steps:
 * 1. chatId cleared → reset messages + artifact (new chat).
 * 2. Same session URL update → skip fetch (messages already in useChat).
 * 3. Guest → restore from localStorage; signed-in → fetch API messages.
 * 4. Hydrate artifact from data-artifactContent when present.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import type { UIMessage } from 'ai';
import { convertMessagesToUIMessages } from '@/features/ai-assistant/components/history-sidebar/utils/message-conversion';
import { logger } from '@/features/ai-assistant/lib/logger';
import { assistantApiEndpoints } from '@/features/ai-assistant/model/api-endpoints';
import {
  initialArtifactData,
  type UIArtifact,
} from '@/features/ai-assistant/components/artifacts/hooks/use-artifact';
import { buildArtifactStateFromMessages } from '@/features/ai-assistant/lib/build-artifact-state-from-messages';
import { useUserSession } from '@/features/ai-assistant/providers/user-session-context';
import { readLocalChatHistory } from '@/features/ai-assistant/message-persistence/lib/local-chat-history';

interface UseChatMessagesOptions {
  /** URL chatId — null when the user starts a new chat. */
  chatId: string | null;
  setMessages: (messages: UIMessage[]) => void;
  /** Current useChat id — used to skip refetch after URL catches up. */
  currentChatId?: string;
  /** True when useChat already has messages for this session. */
  hasMessages?: boolean;
  setArtifact?: (updater: (artifact: UIArtifact) => UIArtifact) => void;
}

interface UseChatMessagesReturn {
  isLoadingMessages: boolean;
}

/**
 * Load messages when chatId changes; reset artifact on new chat / history switch.
 *
 * @example
 * useChatMessages({ chatId: urlChatId, setMessages, setArtifact })
 */
export function useChatMessages({
  chatId,
  setMessages,
  currentChatId,
  hasMessages = false,
  setArtifact,
}: UseChatMessagesOptions): UseChatMessagesReturn {
  const { user } = useUserSession();
  const lastLoadedChatIdRef = useRef<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(function loadMessagesWhenChatIdChanges() {
    //////////////////////////////////
    // New chat: URL cleared — drop messages and artifact so stale documentIds
    // do not keep calling /api/ai-assistant/document.
    //////////////////////////////////
    if (!chatId) {
      if (lastLoadedChatIdRef.current !== null) {
        logger.info('[useChatMessages] Chat cleared, resetting messages for new chat');
        lastLoadedChatIdRef.current = null;
        setMessages([]);
        setArtifact?.(() => initialArtifactData);
      }
      return;
    }

    // Already loaded this chatId in this mount cycle.
    if (chatId === lastLoadedChatIdRef.current) {
      return;
    }

    // After first message, URL gains chatId while useChat already holds the stream.
    if (currentChatId && chatId === currentChatId && hasMessages) {
      logger.info(`[useChatMessages] Chat ${chatId} already has messages, skipping fetch`);
      lastLoadedChatIdRef.current = chatId;
      return;
    }

    async function loadMessages() {
      setIsLoadingMessages(true);
      // Clear previous chat's artifact before restoring this chat's (if any).
      setArtifact?.(() => initialArtifactData);

      try {
        //////////////////////////////////
        // Guest: restore from localStorage — no DB messages API.
        //////////////////////////////////
        if (!user) {
          const localChat = readLocalChatHistory().chats.find((chat) => chat.id === chatId);

          if (localChat) {
            setMessages(localChat.messages);
            const artifactState = buildArtifactStateFromMessages(localChat.messages);
            if (artifactState) {
              setArtifact?.(() => artifactState);
            }

            lastLoadedChatIdRef.current = chatId;
            logger.info(`[useChatMessages] Restored local chat: ${chatId}`);
            return;
          }
        }

        //////////////////////////////////
        // Signed-in: fetch persisted messages from the chat API.
        //////////////////////////////////
        logger.info(`[useChatMessages] Fetching messages for chat: ${chatId}`);

        const response = await fetch(`${assistantApiEndpoints.chat}/${chatId}/messages`);

        if (!response.ok) {
          if (response.status === 404) {
            logger.info(`[useChatMessages] Chat ${chatId} not found, starting new chat`);
            lastLoadedChatIdRef.current = chatId;
            setMessages([]);
            return;
          }
          throw new Error(`Failed to fetch messages: ${response.statusText}`);
        }

        const data = await response.json();
        const uiMessages = convertMessagesToUIMessages(data.messages || []);

        const artifactState = buildArtifactStateFromMessages(uiMessages);
        if (artifactState) {
          setArtifact?.(() => artifactState);
        }

        setMessages(uiMessages);
        lastLoadedChatIdRef.current = chatId;
        logger.info(`[useChatMessages] Successfully loaded ${uiMessages.length} message(s) for chat: ${chatId}`);
      } catch (error) {
        logger.error('[useChatMessages] Error loading messages:', error);
        lastLoadedChatIdRef.current = null;
      } finally {
        setIsLoadingMessages(false);
      }
    }

    void loadMessages();
  }, [chatId, setMessages, currentChatId, hasMessages, setArtifact, user]);

  return {
    isLoadingMessages,
  };
}
