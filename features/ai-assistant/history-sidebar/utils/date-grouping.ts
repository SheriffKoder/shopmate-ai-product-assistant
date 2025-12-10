/**
 * Date Grouping Utilities
 * 
 * Purpose: Group chats by relative dates for better UX
 * Used in: Sidebar history component
 * Why: Makes it easier for users to find recent chats
 */

import type { Chat } from '@/lib/supabase/types';
import { isToday, isYesterday, subMonths, subWeeks } from 'date-fns';

/**
 * Grouped chats by date categories
 */
export type GroupedChats = {
  today: Chat[];
  yesterday: Chat[];
  lastWeek: Chat[];
  lastMonth: Chat[];
  older: Chat[];
};

/**
 * Group chats by relative dates
 * 
 * Categories:
 * - Today: Chats created today
 * - Yesterday: Chats created yesterday
 * - Last 7 days: Chats created in the last week (excluding today/yesterday)
 * - Last 30 days: Chats created in the last month (excluding last week)
 * - Older: Chats older than last month
 * 
 * @param chats - Array of chats to group
 * @returns Grouped chats object
 * 
 * @example
 * ```typescript
 * const grouped = groupChatsByDate(chats);
 * // Returns: { today: [...], yesterday: [...], lastWeek: [...], lastMonth: [...], older: [...] }
 * ```
 */
export function groupChatsByDate(chats: Chat[]): GroupedChats {
  const now = new Date();
  const oneWeekAgo = subWeeks(now, 1);
  const oneMonthAgo = subMonths(now, 1);

  return chats.reduce(
    (groups, chat) => {
      const chatDate = new Date(chat.createdAt);

      if (isToday(chatDate)) {
        groups.today.push(chat);
      } else if (isYesterday(chatDate)) {
        groups.yesterday.push(chat);
      } else if (chatDate > oneWeekAgo) {
        groups.lastWeek.push(chat);
      } else if (chatDate > oneMonthAgo) {
        groups.lastMonth.push(chat);
      } else {
        groups.older.push(chat);
      }

      return groups;
    },
    {
      today: [],
      yesterday: [],
      lastWeek: [],
      lastMonth: [],
      older: [],
    } as GroupedChats
  );
}

