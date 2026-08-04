/**
 * Chat Item Component
 * 
 * Purpose: Individual chat item in the sidebar history
 * Used in: Sidebar history list
 * Why: Displays chat title and links to chat URL
 */

'use client';

import { memo } from 'react';
import type { AssistantHistoryItem } from '@/features/ai-assistant/model/assistant-history-client';
import { useNavigateToChat } from '../utils/chat-navigation';
import { ChatItemActions } from './chat-item-actions';

interface ChatItemProps {
  chat: AssistantHistoryItem;
  isActive: boolean;
  onClick?: () => void;
  onDeleted?: (chatId: string) => void;
}

/**
 * Pure Chat Item Component
 * 
 * Renders a clickable chat item that:
 * - Updates URL search params with chatId (no page navigation)
 * - Highlights when active (current chat)
 * - Shows chat title
 * 
 * @param chat - Chat object to display
 * @param isActive - Whether this chat is currently active
 * @param onClick - Optional click handler (for mobile sidebar close)
 */
const PureChatItem = ({ chat, isActive, onClick, onDeleted }: ChatItemProps) => {
  const navigateToChat = useNavigateToChat();

  const handleClick = () => {
    // Navigate to chat by updating URL search params
    navigateToChat(chat.id);
    
    // Call optional onClick handler (e.g., for mobile sidebar close)
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        group relative flex items-center gap-2 rounded-md px-2 py-1.5 text-sm
        transition-colors cursor-pointer
        ${isActive 
          ? 'bg-primary/20 text-foreground font-medium' 
          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground/70 hover:text-foreground'
        }
      `}
    >
      <span className="flex-1 truncate text-left">{chat.title}</span>
      <ChatItemActions chatId={chat.id} onDeleted={onDeleted} />
    </div>
  );
};

/**
 * Memoized Chat Item
 * 
 * Only re-renders when isActive changes
 */
export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
  // Re-render if active state changes
  if (prevProps.isActive !== nextProps.isActive) {
    return false;
  }
  // Re-render if chat ID changes
  if (prevProps.chat.id !== nextProps.chat.id) {
    return false;
  }
  // Skip re-render otherwise
  return true;
});

ChatItem.displayName = 'ChatItem';
