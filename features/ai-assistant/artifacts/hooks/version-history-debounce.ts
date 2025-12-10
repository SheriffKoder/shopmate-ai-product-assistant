/**
 * Version History Debounce Hook
 * 
 * Purpose: Reusable debounce hook with countdown indicator for artifact editing
 * Used in: Text, code, and sheet artifact editing components
 * Why: Provides debounced auto-save with visual countdown feedback
 * 
 * Features:
 * - Configurable debounce delay (default: 5000ms)
 * - Countdown timer state (shows remaining seconds)
 * - Callback when debounce completes
 * - Automatic reset on new changes
 * - Cleanup on unmount
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseDebounceOptions {
  delay?: number; // Default: 5000ms (5 seconds)
  onDebounceComplete?: () => void;
}

interface UseDebounceReturn {
  isDebouncing: boolean;
  countdown: number; // Remaining seconds (0-5)
  resetDebounce: () => void;
  triggerDebounce: () => void;
}

/**
 * Reusable debounce hook with countdown indicator
 * 
 * Provides a debounce mechanism with visual countdown feedback.
 * Useful for auto-save functionality where you want to wait for
 * user to finish typing before saving.
 * 
 * @param options - Debounce configuration
 * @param options.delay - Debounce delay in milliseconds (default: 5000)
 * @param options.onDebounceComplete - Callback called when debounce completes
 * @returns Debounce state and controls
 * 
 * @example
 * ```typescript
 * const { isDebouncing, countdown, resetDebounce, triggerDebounce } = useVersionHistoryDebounce({
 *   delay: 5000,
 *   onDebounceComplete: () => saveDocument(),
 * });
 * 
 * // Call triggerDebounce() when user edits content
 * // Hook will automatically call onDebounceComplete after delay
 * 
 * // In UI:
 * {isDebouncing && <span>Saving in {countdown}s...</span>}
 * ```
 */
export function useVersionHistoryDebounce({
  delay = 5000,
  onDebounceComplete,
}: UseDebounceOptions = {}): UseDebounceReturn {
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  /**
   * Reset debounce timer and clear all state
   * 
   * Clears timeout, countdown interval, and resets state.
   * Useful for canceling pending saves or resetting on errors.
   */
  const resetDebounce = useCallback(() => {
    // Clear existing timeout and countdown
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    setIsDebouncing(false);
    setCountdown(0);
    startTimeRef.current = null;
  }, []);

  /**
   * Trigger debounce timer
   * 
   * Starts a new debounce period. If a debounce is already active,
   * it will be reset and a new one started.
   * 
   * When the debounce period completes, onDebounceComplete callback
   * will be called.
   */
  const triggerDebounce = useCallback(() => {
    // Reset any existing debounce
    resetDebounce();

    // Start new debounce
    setIsDebouncing(true);
    setCountdown(Math.ceil(delay / 1000)); // Convert to seconds
    startTimeRef.current = Date.now();

    // Start countdown interval (update every second)
    countdownIntervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, Math.ceil((delay - elapsed) / 1000));
        setCountdown(remaining);

        if (remaining === 0) {
          clearInterval(countdownIntervalRef.current!);
          countdownIntervalRef.current = null;
        }
      }
    }, 1000);

    // Set timeout for debounce completion
    timeoutRef.current = setTimeout(() => {
      setIsDebouncing(false);
      setCountdown(0);
      startTimeRef.current = null;
      
      if (onDebounceComplete) {
        onDebounceComplete();
      }
    }, delay);
  }, [delay, onDebounceComplete, resetDebounce]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetDebounce();
    };
  }, [resetDebounce]);

  return {
    isDebouncing,
    countdown,
    resetDebounce,
    triggerDebounce,
  };
}

