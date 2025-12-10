/**
 * Chat Navigation Utilities
 * 
 * Purpose: Utilities for navigating between chats using URL search params
 * Used in: Sidebar items, chat container
 * Why: Centralizes chat navigation logic and URL state management
 * 
 * How it works:
 * 1. Uses Next.js searchParams to store chatId in URL
 * 2. Provides functions to navigate to a chat
 * 3. Provides functions to get current chatId from URL
 * 4. Updates URL without full page navigation
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Get current chatId from URL search params
 * 
 * @returns Current chatId from URL or null if not found
 * 
 * @example
 * ```typescript
 * const chatId = useCurrentChatId();
 * // Returns: 'abc-123' or null
 * ```
 */
export function useCurrentChatId(): string | null {
  const searchParams = useSearchParams();
  return searchParams.get('chatId');
}

/**
 * Hook to navigate to a chat
 * 
 * Updates URL search params with chatId without full page navigation
 * 
 * @returns Function to navigate to a chat by ID
 * 
 * @example
 * ```typescript
 * const navigateToChat = useNavigateToChat();
 * navigateToChat('abc-123');
 * // URL becomes: /?chatId=abc-123
 * ```
 */
export function useNavigateToChat() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return useCallback(
    (chatId: string) => {
      // Create new URLSearchParams with current params
      const params = new URLSearchParams(searchParams.toString());
      
      // Set chatId param
      params.set('chatId', chatId);
      
      // Update URL without scrolling or full navigation
      router.push(`/?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );
}

/**
 * Hook to clear chat selection (remove chatId from URL)
 * 
 * @returns Function to clear current chat selection
 * 
 * @example
 * ```typescript
 * const clearChat = useClearChat();
 * clearChat();
 * // Removes chatId from URL
 * ```
 */
export function useClearChat() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return useCallback(() => {
    // Create new URLSearchParams with current params
    const params = new URLSearchParams(searchParams.toString());
    
    // Remove chatId param
    params.delete('chatId');
    
    // Update URL
    const newUrl = params.toString() ? `/?${params.toString()}` : '/';
    router.push(newUrl, { scroll: false });
  }, [router, searchParams]);
}

/**
 * Hook to silently update chatId in URL without causing rerender
 * 
 * Only updates if the chatId is different from current URL chatId.
 * Uses router.replace instead of router.push to avoid adding to history.
 * 
 * @returns Function to update chatId in URL silently
 * 
 * @example
 * ```typescript
 * const updateChatIdInUrl = useUpdateChatIdInUrl();
 * updateChatIdInUrl('abc-123');
 * // URL becomes: /?chatId=abc-123 (only if different from current)
 * ```
 */
export function useUpdateChatIdInUrl() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return useCallback(
    (chatId: string) => {
      const currentChatId = searchParams.get('chatId');
      
      // Only update if chatId is different from current
      // This prevents unnecessary URL updates and rerenders
      if (currentChatId === chatId) {
        return; // Already set, no need to update
      }
      
      // Create new URLSearchParams with current params
      const params = new URLSearchParams(searchParams.toString());
      
      // Set chatId param
      params.set('chatId', chatId);
      
      // Use replace instead of push to avoid adding to history
      // scroll: false prevents scrolling
      router.replace(`/?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );
}

