/**
 * Pagination Key Generator
 * 
 * Purpose: Generate SWR pagination keys for infinite scroll
 * Used in: useSWRInfinite hook
 * Why: Enables cursor-based pagination with SWR
 */

export type ChatHistory = {
  chats: Array<{
    id: string;
    userId: string;
    title: string;
    createdAt: string;
    updatedAt: string;
  }>;
  hasMore: boolean;
};

const PAGE_SIZE = 20;

/**
 * Generate pagination key for SWR infinite scroll
 * 
 * How it works:
 * 1. First page: Returns base URL with limit
 * 2. Subsequent pages: Returns URL with ending_before cursor
 * 3. Returns null when hasMore is false (stops pagination)
 * 
 * @param pageIndex - Current page index (0-based)
 * @param previousPageData - Previous page data (null for first page)
 * @returns URL string or null to stop pagination
 * 
 * @example
 * ```typescript
 * const { data } = useSWRInfinite(getChatHistoryPaginationKey, fetcher);
 * ```
 */
export function getChatHistoryPaginationKey(
  pageIndex: number,
  previousPageData: ChatHistory | null
): string | null {
  // Stop pagination if previous page had no more data
  if (previousPageData && previousPageData.hasMore === false) {
    return null;
  }

  // First page: return base URL
  if (pageIndex === 0) {
    return `/api/history?limit=${PAGE_SIZE}`;
  }

  // Subsequent pages: use ending_before cursor
  const firstChatFromPreviousPage = previousPageData?.chats.at(-1);

  if (!firstChatFromPreviousPage) {
    return null;
  }

  return `/api/history?ending_before=${firstChatFromPreviousPage.id}&limit=${PAGE_SIZE}`;
}

