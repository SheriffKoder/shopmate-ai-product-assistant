'use client';

import { useEffect, useRef, useState } from 'react';
import { EllipsisVertical, Send, Trash } from 'lucide-react';
import { useUserSession } from '@/features/ai-assistant/hooks/use-user-session';
import { copyChatLink, deleteChatWithMessages } from '../utils/chat-item-actions';

interface ChatItemActionsProps {
  chatId: string;
  onDeleted?: (chatId: string) => void;
}

/**
 * Chat Item Actions
 *
 * A small ellipsis button that opens a dropdown with Share/Delete actions.
 * Currently logs the chatId to console when actions are clicked.
 */
export function ChatItemActions({ chatId, onDeleted }: ChatItemActionsProps) {
  const { user } = useUserSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent click (navigation)
    setIsOpen((prev) => !prev);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    copyChatLink(chatId);
    setIsOpen(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteChatWithMessages(chatId, user ? 'database' : 'local');
      if (onDeleted) {
        onDeleted(chatId);
      }
    } catch (err) {
      // Already logged inside util
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={handleToggle}
        className="p-1 rounded-md cursor-pointer hover:bg-foreground/10 text-foreground/70 hover:text-foreground transition-colors"
        aria-label="Chat actions"
      >
        <EllipsisVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-1 w-36 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg">
          <button
            type="button"
            onClick={handleShare}
            className="w-full px-3 py-2 flex items-center gap-2 text-sm text-foreground/80 cursor-pointer hover:text-foreground hover:bg-foreground/10 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Share</span>
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="w-full px-3 py-2 flex items-center gap-2 text-sm text-red-500 cursor-pointer hover:bg-foreground/10 transition-colors"
          >
            <Trash className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}

