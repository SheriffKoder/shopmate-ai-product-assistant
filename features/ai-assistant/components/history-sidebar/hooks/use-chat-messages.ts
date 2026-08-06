/**
 * Chat Messages Hook
 * 
 * Purpose: Load messages from database when chatId changes
 * Used in: Chat container to fetch and load chat history
 * Why: Separates message loading logic from chat container component
 * 
 * How it works:
 * 1. Watches chatId prop for changes
 * 2. Fetches messages from API when chatId changes
 * 3. Converts database messages to UIMessage format
 * 4. Loads messages into useChat via setMessages
 * 5. Manages loading state
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import type { UIMessage } from 'ai';
import { convertMessagesToUIMessages } from '@/features/ai-assistant/components/history-sidebar/utils/message-conversion';
import { logger } from '@/features/ai-assistant/lib/logger';
import { assistantApiEndpoints } from '@/features/ai-assistant/model/api-endpoints';
import type { UIArtifact } from '@/features/ai-assistant/components/artifacts/hooks/use-artifact';
import { useUserSession } from '@/features/ai-assistant/hooks/use-user-session';
import { readLocalChatHistory } from '@/features/ai-assistant/message-persistence/lib/local-chat-history';

interface UseChatMessagesOptions {
  chatId: string | null; // URL chatId (null when cleared for new chat)
  setMessages: (messages: UIMessage[]) => void;
  currentChatId?: string; // Current chatId from useChat (to detect if we're already on this chat)
  hasMessages?: boolean; // Whether messages already exist in useChat (to skip fetch if already loaded)
  setArtifact?: (updater: (artifact: UIArtifact) => UIArtifact) => void;
}

interface UseChatMessagesReturn {
  isLoadingMessages: boolean;
}

/**
 * Hook to load messages from database when chatId changes
 * 
 * Features:
 * - Fetches messages from API when chatId changes
 * - Converts database messages to UIMessage format
 * - Loads messages into useChat
 * - Prevents duplicate fetches for same chatId
 * - Handles 404 gracefully (new chat, no messages)
 * 
 * @param options - Options object with chatId and setMessages
 * @returns Loading state
 * 
 * @example
 * ```typescript
 * const { messages, setMessages } = useChat({ ... });
 * const { isLoadingMessages } = useChatMessages({
 *   chatId: currentChatId,
 *   setMessages,
 * });
 * ```
 */
export function useChatMessages({
  chatId,
  setMessages,
  currentChatId,
  hasMessages = false,
  setArtifact,
}: UseChatMessagesOptions): UseChatMessagesReturn {
  const { user } = useUserSession();
  // Track last loaded chatId to prevent re-fetching
  const lastLoadedChatIdRef = useRef<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  //////////////////////////////////
  // Load Messages from Database: When chatId changes
  // Why: When user selects a chat from sidebar, load its messages
  // How: Fetch messages from API and load into useChat
  // Note: Only fetch if chatId changed and hasn't been loaded yet
  //////////////////////////////////
  useEffect(() => {
    // If chatId is cleared (new chat), reset messages and ref
    // This happens when user clicks "+" button to start new chat
    if (!chatId) {
      // Only reset if we had a chatId loaded before (not initial mount)
      if (lastLoadedChatIdRef.current !== null) {
        logger.info('[useChatMessages] Chat cleared, resetting messages for new chat');
        lastLoadedChatIdRef.current = null;
        setMessages([]);
      }
      return;
    }

    // Skip if same chatId already loaded
    if (chatId === lastLoadedChatIdRef.current) {
      return;
    }

    // Skip fetch if URL chatId matches current chatId and messages already exist
    // This happens when we update the URL after creating a new chat
    // The messages are already in useChat from the stream, so no need to fetch
    if (currentChatId && chatId === currentChatId && hasMessages) {
      logger.info(`[useChatMessages] Chat ${chatId} already has messages, skipping fetch`);
      lastLoadedChatIdRef.current = chatId;
      return;
    }

    // Skip if this is a new chat (no chatId in URL means new chat)
    // We'll let the API create the chat when first message is sent
    const loadMessages = async () => {
      setIsLoadingMessages(true);
      try {
        // Guest conversations live in localStorage, so restore them without calling the database API.
        if (!user) {
          const localChat = readLocalChatHistory().chats.find((chat) => chat.id === chatId);

          if (localChat) {
            setMessages(localChat.messages);

            const persistedArtifact = localChat.messages
              .flatMap((message) => message.parts || [])
              .find((part) => part.type === 'data-artifactContent');
            const persistedArtifactData = (persistedArtifact as { data?: unknown } | undefined)?.data;

            if (setArtifact && persistedArtifactData && typeof persistedArtifactData === 'object') {
              const artifactData = persistedArtifactData as {
                documentId?: string;
                title?: string;
                kind?: UIArtifact['kind'];
                content?: string;
              };

              setArtifact((currentArtifact) => ({
                ...currentArtifact,
                documentId: artifactData.documentId || currentArtifact.documentId,
                title: artifactData.title || currentArtifact.title,
                kind: artifactData.kind || currentArtifact.kind,
                content: artifactData.content || currentArtifact.content,
                status: 'complete',
              }));
            }

            lastLoadedChatIdRef.current = chatId;
            logger.info(`[useChatMessages] Restored local chat: ${chatId}`);
            return;
          }
        }

        logger.info(`[useChatMessages] Fetching messages for chat: ${chatId}`);
        
        const response = await fetch(`${assistantApiEndpoints.chat}/${chatId}/messages`);
        
        if (!response.ok) {
          // If chat doesn't exist yet, that's okay - it's a new chat
          if (response.status === 404) {
            logger.info(`[useChatMessages] Chat ${chatId} not found, starting new chat`);
            lastLoadedChatIdRef.current = chatId;
            setMessages([]);
            return;
          }
          throw new Error(`Failed to fetch messages: ${response.statusText}`);
        }

        const data = await response.json();
        const dbMessages = data.messages || [];
        
        // Convert database messages to UIMessage format
        const uiMessages = convertMessagesToUIMessages(dbMessages);

        const persistedArtifact = uiMessages
          .flatMap((message) => message.parts || [])
          .find((part) => part.type === 'data-artifactContent');

        const persistedArtifactData = (persistedArtifact as { data?: unknown } | undefined)?.data;

        if (setArtifact && persistedArtifactData && typeof persistedArtifactData === 'object') {
          const artifactData = persistedArtifactData as {
            documentId?: string;
            title?: string;
            kind?: UIArtifact['kind'];
            content?: string;
          };

          setArtifact((currentArtifact) => ({
            ...currentArtifact,
            documentId: artifactData.documentId || currentArtifact.documentId,
            title: artifactData.title || currentArtifact.title,
            kind: artifactData.kind || currentArtifact.kind,
            content: artifactData.content || currentArtifact.content,
            status: 'complete',
          }));
        }
        
        // Load messages into useChat
        setMessages(uiMessages);
        
        // Mark this chatId as loaded
        lastLoadedChatIdRef.current = chatId;
        
        logger.info(`[useChatMessages] Successfully loaded ${uiMessages.length} message(s) for chat: ${chatId}`);
      } catch (error) {
        logger.error('[useChatMessages] Error loading messages:', error);
        // Don't show error toast - just log it
        // User can still start a new conversation
        // Reset to allow retry
        lastLoadedChatIdRef.current = null;
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [chatId, setMessages, currentChatId, hasMessages, setArtifact, user]);

  return {
    isLoadingMessages,
  };
}
