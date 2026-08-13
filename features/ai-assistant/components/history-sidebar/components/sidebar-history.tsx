/**
 * Sidebar History Component
 * 
 * Purpose: Display user's chat history in sidebar with pagination
 * Used in: Main sidebar/app layout
 * Why: Provides navigation to previous chats
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { RotateCw, Plus } from 'lucide-react';
import useSWRInfinite from 'swr/infinite';
import { useUserSession } from '@/features/ai-assistant/hooks/use-user-session';
import { assistantHttpHistoryClient } from '@/features/ai-assistant/client/assistant-history-client';
import { getChatHistoryPaginationKey, groupChatsByDate, useCurrentChatId, useClearChat, type ChatHistory } from '../utils';
import { ChatItem } from './chat-item';
import { MessageSavingOrchestrator } from '@/features/ai-assistant/message-persistence/saving-orchestrator';
import { useMessagePersistenceSync } from '@/features/ai-assistant/message-persistence/hooks/use-message-persistence-sync';

/**
 * Fetcher function for SWR
 * 
 * @param url - API endpoint URL
 * @returns Promise resolving to ChatHistory
 */
const fetcher = async (url: string): Promise<ChatHistory> => {
  const parsedUrl = new URL(url, window.location.origin);
  return assistantHttpHistoryClient.list({
    cursor: parsedUrl.searchParams.get('ending_before') || undefined,
    limit: Number(parsedUrl.searchParams.get('limit') || 20),
  }) as Promise<ChatHistory>;
};

/**
 * Sidebar History Component
 * 
 * Features:
 * - Fetches chat history with infinite scroll pagination
 * - Groups chats by date (Today, Yesterday, Last 7 days, etc.)
 * - Highlights active chat
 * - Shows loading and empty states
 * - Supports infinite scroll
 * 
 * @returns JSX element
 */
interface SidebarHistoryProps {
  refreshTrigger?: number;
  triggerRefresh?: () => void;
}

export function SidebarHistory({ refreshTrigger, triggerRefresh }: SidebarHistoryProps) {
  const { user } = useUserSession();
  const [, setGuestHistoryEpoch] = useState(0);
  const savingOrchestrator = new MessageSavingOrchestrator(user ? 'database' : 'local');
  const localChats = savingOrchestrator.getLocalChats();
  const { isMerging } = useMessagePersistenceSync(() => {
    void mutate();
  });
  // Get current chatId from URL search params
  const currentChatId = useCurrentChatId();
  // Hook to clear chat selection (start new chat)
  const clearChat = useClearChat();

  // Track last user ID to prevent unnecessary revalidations
  const lastUserIdRef = useRef<string | null>(null);

  //////////////////////////////////
  // SWR Infinite: Fetch paginated chat history
  // Why: Automatic caching, revalidation, and infinite scroll support
  // How: useSWRInfinite with pagination key generator
  // Note: Only fetch when user exists (disabled when user is null)
  //////////////////////////////////
  const {
    data: paginatedChatHistories,
    setSize,
    isValidating,
    isLoading,
    mutate,
  } = useSWRInfinite<ChatHistory>(
    // Only enable SWR when user exists
    user ? getChatHistoryPaginationKey : () => null,
    fetcher,
    {
      fallbackData: [],
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  //////////////////////////////////
  // Revalidate on User Change: Refresh data when user loads
  // Why: When user is loaded, we need to fetch their chats
  // How: useEffect watches user ID and revalidates SWR cache only when user ID changes
  // Note: Use ref to track last user ID and prevent infinite loops
  //////////////////////////////////
  useEffect(() => {
    if (user && user.id !== lastUserIdRef.current) {
      // User ID changed, revalidate SWR cache
      lastUserIdRef.current = user.id;
      mutate();
    } else if (!user) {
      // User cleared, reset ref
      lastUserIdRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Only depend on user.id, not the entire user object or mutate

  //////////////////////////////////
  // Revalidate on Refresh Trigger: Refresh when chat finishes
  // Why: When a chat finishes (onFinish), sidebar should refresh to show new chat
  // How: useEffect watches refreshTrigger and calls mutate() when it changes
  //////////////////////////////////
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0 && user) {
      mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]); // Only depend on refreshTrigger

  //////////////////////////////////
  // Handle Chat Deletion: Refresh sidebar when chat is deleted
  // Why: When a chat is deleted, sidebar should refresh to remove it from list
  // How: Call mutate() directly to refresh SWR cache
  //////////////////////////////////
  const handleChatDeleted = useCallback((deletedChatId: string) => {
    if (user) {
      mutate();
    } else {
      setGuestHistoryEpoch((epoch) => epoch + 1);
    }
    // If the deleted chat is the one currently open, clear the chatId param to start a new chat
    if (deletedChatId === currentChatId) {
      clearChat();
    }
  }, [user, mutate, currentChatId, clearChat]);

  //////////////////////////////////
  // Compute States: Determine UI states
  // Why: Need to show appropriate UI (loading, empty, has more, etc.)
  //////////////////////////////////
  const hasReachedEnd = user
    ? paginatedChatHistories?.some((page) => page.hasMore === false) ?? false
    : true;

  const hasEmptyChatHistory = !user
    ? localChats.length === 0
    : paginatedChatHistories
    ? paginatedChatHistories.every((page) => page.chats.length === 0)
    : true;

  // Flatten all chats from all pages
  const allChats = !user
    ? localChats
    : paginatedChatHistories
    ? paginatedChatHistories.flatMap((page) => page.chats)
    : [];

  // Group chats by date
  const groupedChats = groupChatsByDate(allChats);

  //////////////////////////////////
  // Handle Manual Refresh: Trigger manual revalidation
  // Why: Allow users to manually refresh chat list
  // How: Call mutate() to revalidate SWR cache
  //////////////////////////////////
  const handleRefresh = () => {
    if (user) {
      mutate();
    }
  };

  //////////////////////////////////
  // Handle New Chat: Clear chatId from URL to start new chat
  // Why: Allow users to start a fresh conversation
  // How: Clear chatId from URL search params, chat will be saved on first message submit
  //////////////////////////////////
  const handleNewChat = () => {
    clearChat();
  };

  //////////////////////////////////
  // Loading State: Show skeleton while fetching
  //////////////////////////////////
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="text-xs text-foreground/50">Today</div>
        <div className="flex flex-col gap-2">
          {[44, 32, 28, 64, 52].map((width, index) => (
            <div
              key={index}
              className="flex h-8 items-center gap-2 rounded-md px-2"
            >
              <div
                className="h-4 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"
                style={{ width: `${width}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  //////////////////////////////////
  // Empty State: Show message if no chats
  //////////////////////////////////
  if (hasEmptyChatHistory) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-row items-center justify-between px-2 pb-2 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-foreground">Chat History</h3>
          <div className="flex flex-row items-center gap-1">
            {/* New Chat Button */}
            <button
              onClick={handleNewChat}
              className="
                p-1.5 rounded-md transition-colors
                hover:bg-gray-100 dark:hover:bg-gray-800
              "
              aria-label="Start new chat"
              title="Start new chat"
            >
              <Plus 
                className="w-4 h-4 text-foreground/70" 
                aria-hidden="true"
              />
            </button>
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isValidating}
              className={`
                p-1.5 rounded-md transition-colors
                hover:bg-gray-100 dark:hover:bg-gray-800
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isValidating ? 'animate-spin' : ''}
              `}
              aria-label="Refresh chat history"
              title="Refresh chat history"
            >
              <RotateCw 
                className="w-4 h-4 text-foreground/70" 
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
        <div className="flex w-full flex-row items-center justify-center gap-2 px-4 py-8 text-sm text-foreground/60">
          Your conversations will appear here once you start chatting!
        </div>
      </div>
    );
  }

  //////////////////////////////////
  // Render Chat Groups: Display grouped chats
  //////////////////////////////////
  return (
    <div className="flex flex-col gap-6 p-4 min-h-full">
      {/* Header with New Chat and Refresh Buttons */}
      <div className="flex flex-row items-center justify-between px-2 pb-2 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-foreground">Chat History</h3>
        <div className="flex flex-row items-center gap-1">
          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="
              p-1.5 rounded-md transition-colors
              hover:bg-gray-100 dark:hover:bg-gray-800
            "
            aria-label="Start new chat"
            title="Start new chat"
          >
            <Plus 
              className="w-4 h-4 text-foreground/70" 
              aria-hidden="true"
            />
          </button>
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isValidating}
            className={`
              p-1.5 rounded-md transition-colors
              hover:bg-gray-100 dark:hover:bg-gray-800
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isValidating ? 'animate-spin' : ''}
            `}
            aria-label="Refresh chat history"
            title="Refresh chat history"
          >
            <RotateCw 
              className="w-4 h-4 text-foreground/70" 
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
      {/* Today */}
      {groupedChats.today.length > 0 && (
        <div>
          <div className="px-2 py-1 text-xs text-foreground/50 font-medium">Today</div>
          <div className="flex flex-col gap-1">
            {groupedChats.today.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === currentChatId}
                onDeleted={handleChatDeleted}
              />
            ))}
          </div>
        </div>
      )}

      {/* Yesterday */}
      {groupedChats.yesterday.length > 0 && (
        <div>
          <div className="px-2 py-1 text-xs text-foreground/50 font-medium">Yesterday</div>
          <div className="flex flex-col gap-1">
            {groupedChats.yesterday.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === currentChatId}
                onDeleted={handleChatDeleted}
              />
            ))}
          </div>
        </div>
      )}

      {/* Last 7 days */}
      {groupedChats.lastWeek.length > 0 && (
        <div>
          <div className="px-2 py-1 text-xs text-foreground/50 font-medium">Last 7 days</div>
          <div className="flex flex-col gap-1">
            {groupedChats.lastWeek.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === currentChatId}
                onDeleted={handleChatDeleted}
              />
            ))}
          </div>
        </div>
      )}

      {/* Last 30 days */}
      {groupedChats.lastMonth.length > 0 && (
        <div>
          <div className="px-2 py-1 text-xs text-foreground/50 font-medium">Last 30 days</div>
          <div className="flex flex-col gap-1">
            {groupedChats.lastMonth.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === currentChatId}
                onDeleted={handleChatDeleted}
              />
            ))}
          </div>
        </div>
      )}

      {/* Older */}
      {groupedChats.older.length > 0 && (
        <div>
          <div className="px-2 py-1 text-xs text-foreground/50 font-medium">Older than last month</div>
          <div className="flex flex-col gap-1">
            {groupedChats.older.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === currentChatId}
                onDeleted={handleChatDeleted}
              />
            ))}
          </div>
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {!hasReachedEnd && (
        <div
          className="flex flex-row items-center justify-center gap-2 py-4 text-sm text-foreground/60"
          onMouseEnter={() => {
            if (!isValidating && !hasReachedEnd) {
              setSize((size) => size + 1);
            }
          }}
        >
          {isValidating ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/30 border-t-primary" />
              <span>Loading more chats...</span>
            </>
          ) : (
            <span>Scroll for more chats</span>
          )}
        </div>
      )}

      {/* End of History */}
      {hasReachedEnd && allChats.length > 0 && (
        <div className="flex w-full flex-row items-center justify-center gap-2 px-2 py-4 text-sm text-foreground/60">
          You have reached the end of your chat history.
        </div>
      )}
    </div>
  );
}
