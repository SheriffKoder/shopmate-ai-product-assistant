/**
 * Sidebar Refresh Hook
 * 
 * Purpose: Manage sidebar refresh trigger state
 * Used in: Chat wrapper to trigger sidebar refresh when chat finishes
 * Why: Centralizes refresh logic in a reusable hook
 * 
 * How it works:
 * 1. Maintains a refresh trigger counter
 * 2. Provides a callback to increment the trigger
 * 3. Returns both trigger value and callback
 */

import { useState, useCallback } from 'react';

/**
 * Hook to manage sidebar refresh trigger
 * 
 * Returns:
 * - refreshTrigger: Number that increments when refresh is needed
 * - triggerRefresh: Callback function to trigger sidebar refresh
 * 
 * @example
 * ```typescript
 * const { refreshTrigger, triggerRefresh } = useSidebarRefresh();
 * 
 * // Pass trigger to sidebar
 * <SidebarHistory refreshTrigger={refreshTrigger} />
 * 
 * // Call when chat finishes
 * onFinish: () => {
 *   triggerRefresh();
 * }
 * ```
 */
export function useSidebarRefresh() {
  //////////////////////////////////
  // Refresh Trigger State: Counter that increments to trigger refresh
  // Why: Sidebar watches this value and refreshes when it changes
  // How: useState with number, increment on each refresh request
  //////////////////////////////////
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  //////////////////////////////////
  // Trigger Refresh Callback: Increment trigger to cause sidebar refresh
  // Why: Provides a way to trigger sidebar refresh from parent components
  // How: Increment refreshTrigger state, sidebar's useEffect will detect change
  //////////////////////////////////
  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    refreshTrigger,
    triggerRefresh,
  };
}

