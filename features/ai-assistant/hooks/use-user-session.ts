/**
 * User Session Hook
 * 
 * Purpose: Manage user session state (client-side)
 * Used in: Chat components, user initialization
 * Why: Centralized user state management with localStorage persistence
 * 
 * How it works:
 * 1. Stores user in localStorage for persistence across page reloads
 * 2. Loads user from localStorage on mount
 * 3. Provides functions to create/load user from API
 * 4. Syncs user state with localStorage automatically
 * 
 * Steps:
 * 1. On mount: Load user from localStorage if exists
 * 2. When user changes: Save to localStorage automatically
 * 3. createUser: Calls API to get/create constant user, updates state
 * 4. loadUser: Calls API to get constant user, updates state
 * 5. clearUser: Removes user from state and localStorage
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { User } from '@/lib/supabase/types';

/**
 * LocalStorage key for storing user data
 * 
 * Why: Consistent key across the application
 * How: Used to store/retrieve user from localStorage
 */
const USER_STORAGE_KEY = 'shopmate-user';

/**
 * Custom event name for user state changes
 * 
 * Why: Allow components to sync when user changes in another component
 * How: Dispatch event when user changes, components can listen
 */
const USER_STATE_CHANGE_EVENT = 'shopmate-user-state-change';

/**
 * Hook to manage user session
 * 
 * Provides:
 * - user: Current user object or null
 * - isLoading: Whether user is being loaded (initial load or API call)
 * - createUser: Function to create constant user (cloud-upload action)
 * - loadUser: Function to load user from API (cloud-download action)
 * - clearUser: Function to clear user session
 * 
 * @returns Object with user state and management functions
 * 
 * @example
 * ```typescript
 * const { user, isLoading, createUser, loadUser, clearUser } = useUserSession();
 * 
 * // Create user (cloud-upload button)
 * await createUser();
 * 
 * // Load user (cloud-download button)
 * await loadUser();
 * 
 * // Clear user
 * clearUser();
 * ```
 */
export function useUserSession() {
  //////////////////////////////////
  // User State: Current user object or null
  // Why: Need to track current user in component
  // How: useState hook with User type or null
  //////////////////////////////////
  const [user, setUser] = useState<User | null>(null);
  
  //////////////////////////////////
  // Loading State: Whether user is being loaded
  // Why: Show loading indicators during API calls
  // How: useState hook with boolean
  //////////////////////////////////
  const [isLoading, setIsLoading] = useState(true);

  //////////////////////////////////
  // Load User from LocalStorage: On component mount
  // Why: Restore user session from previous visit
  // When: Runs once on mount (empty dependency array)
  // How: Read from localStorage, parse JSON, set state
  //////////////////////////////////
  useEffect(() => {
    // Check if we're in browser (not SSR)
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    //////////////////////////////////
    // Read from LocalStorage: Get stored user data
    // Why: Restore user from previous session
    // How: localStorage.getItem with our key
    //////////////////////////////////
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    
    if (storedUser) {
      try {
        //////////////////////////////////
        // Parse JSON: Convert string to User object
        // Why: localStorage stores strings, need to parse
        // How: JSON.parse with error handling
        //////////////////////////////////
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
      } catch (error) {
        //////////////////////////////////
        // Error Handling: Invalid JSON in localStorage
        // Why: Data might be corrupted
        // How: Log error and remove corrupted data
        //////////////////////////////////
        console.error('[useUserSession] Failed to parse stored user:', error);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    
    //////////////////////////////////
    // Mark Loading Complete: Initial load finished
    // Why: Component can now render with user state
    // How: Set isLoading to false
    //////////////////////////////////
    setIsLoading(false);
  }, []);

  // Ref to track if we're currently updating (to prevent infinite loops)
  const isUpdatingRef = useRef(false);

  //////////////////////////////////
  // Listen for User State Changes: Sync state when user changes in another component
  // Why: When user is loaded in another component, sync state here
  // When: Runs on mount and listens for custom events
  // How: Add custom event listener
  //////////////////////////////////
  useEffect(() => {
    // Check if we're in browser (not SSR)
    if (typeof window === 'undefined') {
      return;
    }

    //////////////////////////////////
    // Custom Event Handler: Update state when user changes in another component
    // Why: Sync state across components in the same window
    // How: Listen for custom event and update state from localStorage
    // Note: Only update if user actually changed to prevent infinite loops
    //////////////////////////////////
    const handleUserStateChange = () => {
      // Skip if we're the one who initiated the change
      if (isUpdatingRef.current) {
        return;
      }

      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      let newUser: User | null = null;
      
      if (storedUser) {
        try {
          newUser = JSON.parse(storedUser) as User;
        } catch (error) {
          console.error('[useUserSession] Failed to parse user from storage:', error);
          return;
        }
      }

      // Only update if user actually changed
      setUser((currentUser) => {
        if (currentUser?.id === newUser?.id) {
          // Same user, no need to update
          return currentUser;
        }
        return newUser;
      });
    };

    window.addEventListener(USER_STATE_CHANGE_EVENT, handleUserStateChange);

    return () => {
      window.removeEventListener(USER_STATE_CHANGE_EVENT, handleUserStateChange);
    };
  }, []);

  //////////////////////////////////
  // Save User to LocalStorage: When user changes
  // Why: Persist user across page reloads
  // When: Runs whenever user state changes
  // How: Save to localStorage or remove if null
  //////////////////////////////////
  useEffect(() => {
    // Check if we're in browser (not SSR)
    if (typeof window === 'undefined') {
      return;
    }

    // Check if localStorage value is different to avoid unnecessary updates
    const currentStored = localStorage.getItem(USER_STORAGE_KEY);
    const newStored = user ? JSON.stringify(user) : null;

    // Only update if value actually changed
    if (currentStored !== newStored) {
      // Mark that we're updating to prevent event handler from triggering
      isUpdatingRef.current = true;

      //////////////////////////////////
      // Save or Remove: Update localStorage based on user state
      // Why: Keep localStorage in sync with state
      // How: Save JSON string if user exists, remove if null
      //////////////////////////////////
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }

      //////////////////////////////////
      // Dispatch Custom Event: Notify other components of user state change
      // Why: Allow other components to sync their state
      // How: Dispatch custom event after localStorage update
      // Note: Use setTimeout to ensure event is dispatched after state update
      //////////////////////////////////
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent(USER_STATE_CHANGE_EVENT));
        // Reset flag after event is dispatched
        isUpdatingRef.current = false;
      }, 0);
    }
  }, [user]);

  /**
   * Create constant user (cloud-upload action)
   * 
   * Steps:
   * 1. Set loading state
   * 2. Call API to get or create constant user
   * 3. Update local state with returned user
   * 4. Save to localStorage (via useEffect)
   * 5. Return user or null
   * 
   * @returns Created user object or null if error
   * 
   * @example
   * ```typescript
   * const user = await createUser();
   * if (user) {
   *   console.log('User created:', user.id);
   * }
   * ```
   */
  const createUser = useCallback(async (): Promise<User | null> => {
    try {
      //////////////////////////////////
      // Set Loading State: Show loading indicator
      // Why: User feedback during API call
      // How: Set isLoading to true
      //////////////////////////////////
      setIsLoading(true);

      //////////////////////////////////
      // Call API: Get or create constant user
      // Why: Create user in database
      // How: Fetch API endpoint with constant=true parameter
      //////////////////////////////////
      const response = await fetch('/api/user?constant=true');
      
      //////////////////////////////////
      // Parse Response: Extract JSON data
      // Why: API returns JSON with user object
      // How: response.json()
      //////////////////////////////////
      const data = await response.json();

      //////////////////////////////////
      // Error Handling: Check if API call succeeded
      // Why: API can return errors (500, etc.)
      // How: Check response.ok, log error, return null
      //////////////////////////////////
      if (!response.ok) {
        console.error('[createUser] API error:', data.error);
        return null;
      }

      //////////////////////////////////
      // Update State: Set user from API response
      // Why: Update component state with new user
      // How: setUser with data.user
      // Note: localStorage will be updated automatically via useEffect
      //////////////////////////////////
      setUser(data.user);
      return data.user;
    } catch (error) {
      //////////////////////////////////
      // Exception Handling: Catch network errors, etc.
      // Why: Fetch can throw errors (network issues, etc.)
      // How: Log error and return null
      //////////////////////////////////
      console.error('[createUser] Exception:', error);
      return null;
    } finally {
      //////////////////////////////////
      // Reset Loading State: Always set loading to false
      // Why: Ensure loading state is reset even on error
      // How: finally block ensures this runs always
      //////////////////////////////////
      setIsLoading(false);
    }
  }, []);

  /**
   * Load user from API (cloud-download action)
   * 
   * Steps:
   * 1. Set loading state
   * 2. Call API to get constant user
   * 3. Update local state with returned user
   * 4. Save to localStorage (via useEffect)
   * 5. Return user or null
   * 
   * @returns Loaded user object or null if error
   * 
   * @example
   * ```typescript
   * const user = await loadUser();
   * if (user) {
   *   console.log('User loaded:', user.id);
   * }
   * ```
   */
  const loadUser = useCallback(async (): Promise<User | null> => {
    try {
      //////////////////////////////////
      // Set Loading State: Show loading indicator
      // Why: User feedback during API call
      // How: Set isLoading to true
      //////////////////////////////////
      setIsLoading(true);

      //////////////////////////////////
      // Call API: Get constant user
      // Why: Load user from database
      // How: Fetch API endpoint with constant=true parameter
      //////////////////////////////////
      const response = await fetch('/api/user?constant=true');
      
      //////////////////////////////////
      // Parse Response: Extract JSON data
      // Why: API returns JSON with user object
      // How: response.json()
      //////////////////////////////////
      const data = await response.json();

      //////////////////////////////////
      // Error Handling: Check if API call succeeded
      // Why: API can return errors (404, 500, etc.)
      // How: Check response.ok, log error, return null
      //////////////////////////////////
      if (!response.ok) {
        console.error('[loadUser] API error:', data.error);
        return null;
      }

      //////////////////////////////////
      // Update State: Set user from API response
      // Why: Update component state with loaded user
      // How: setUser with data.user
      // Note: localStorage will be updated automatically via useEffect
      //////////////////////////////////
      setUser(data.user);
      return data.user;
    } catch (error) {
      //////////////////////////////////
      // Exception Handling: Catch network errors, etc.
      // Why: Fetch can throw errors (network issues, etc.)
      // How: Log error and return null
      //////////////////////////////////
      console.error('[loadUser] Exception:', error);
      return null;
    } finally {
      //////////////////////////////////
      // Reset Loading State: Always set loading to false
      // Why: Ensure loading state is reset even on error
      // How: finally block ensures this runs always
      //////////////////////////////////
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear user session
   * 
   * Steps:
   * 1. Set user state to null
   * 2. Remove from localStorage (via useEffect)
   * 
   * Why: Allow user to sign out or reset session
   * How: setUser(null) triggers useEffect to clear localStorage
   * 
   * @example
   * ```typescript
   * clearUser();
   * // User is now null and removed from localStorage
   * ```
   */
  const clearUser = useCallback(() => {
    //////////////////////////////////
    // Clear State: Set user to null
    // Why: Remove user from component state
    // How: setUser(null)
    // Note: localStorage will be cleared automatically via useEffect
    //////////////////////////////////
    setUser(null);
    // localStorage is cleared automatically by the useEffect above
  }, []);

  //////////////////////////////////
  // Return Hook Values: Expose state and functions
  // Why: Components need access to user state and management functions
  // How: Return object with all values
  //////////////////////////////////
  return {
    user,
    isLoading,
    createUser,
    loadUser,
    clearUser,
  };
}

