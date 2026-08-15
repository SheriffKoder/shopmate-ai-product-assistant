/**
 * @file features/ai-assistant/providers/user-session-context.tsx
 * Single shared client session for the assistant demo user.
 * Used in: AssistantRootProvider; consumers via useUserSession().
 * Used for: One React state + localStorage — avoids multi-hook mounts
 * treating initial null as logout and wiping shopmate-user.
 */

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { assistantApiEndpoints } from '../model/api-endpoints';

export interface AssistantUser {
  id: string;
  email?: string;
  name?: string;
}

const USER_STORAGE_KEY = 'shopmate-user';

interface UserSessionContextValue {
  user: AssistantUser | null;
  isLoading: boolean;
  createUser: () => Promise<AssistantUser | null>;
  loadUser: () => Promise<AssistantUser | null>;
  clearUser: () => void;
}

const UserSessionContext = createContext<UserSessionContextValue | undefined>(undefined);

function readStoredUser(): AssistantUser | null {
  if (typeof window === 'undefined') return null;

  const storedUser = localStorage.getItem(USER_STORAGE_KEY);
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as AssistantUser;
  } catch (error) {
    console.error('[UserSessionProvider] Failed to parse stored user:', error);
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

function writeStoredUser(user: AssistantUser | null): void {
  if (typeof window === 'undefined') return;

  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return;
  }

  localStorage.removeItem(USER_STORAGE_KEY);
}

async function fetchConstantUser(): Promise<AssistantUser | null> {
  const response = await fetch(`${assistantApiEndpoints.user}?constant=true`);
  const data = await response.json();

  if (!response.ok) {
    console.error('[UserSessionProvider] API error:', data.error);
    return null;
  }

  return data.user as AssistantUser;
}

interface UserSessionProviderProps {
  children: ReactNode;
}

/**
 * Owns the only assistant user session state in the tree.
 */
export function UserSessionProvider({ children }: UserSessionProviderProps) {
  const [user, setUser] = useState<AssistantUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Skip persist until after the first localStorage read so mount null ≠ logout.
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(function hydrateFromLocalStorage() {
    setUser(readStoredUser());
    setHasHydrated(true);
    setIsLoading(false);
  }, []);

  useEffect(
    function persistUserToLocalStorage() {
      if (!hasHydrated) return;
      writeStoredUser(user);
    },
    [user, hasHydrated],
  );

  const createUser = useCallback(async (): Promise<AssistantUser | null> => {
    try {
      setIsLoading(true);
      const nextUser = await fetchConstantUser();
      if (nextUser) setUser(nextUser);
      return nextUser;
    } catch (error) {
      console.error('[createUser] Exception:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadUser = useCallback(async (): Promise<AssistantUser | null> => {
    try {
      setIsLoading(true);
      const nextUser = await fetchConstantUser();
      if (nextUser) setUser(nextUser);
      return nextUser;
    } catch (error) {
      console.error('[loadUser] Exception:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearUser = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo<UserSessionContextValue>(
    () => ({
      user,
      isLoading,
      createUser,
      loadUser,
      clearUser,
    }),
    [user, isLoading, createUser, loadUser, clearUser],
  );

  return (
    <UserSessionContext.Provider value={value}>{children}</UserSessionContext.Provider>
  );
}

/**
 * Reads the shared assistant user session. Must be under UserSessionProvider.
 */
export function useUserSession(): UserSessionContextValue {
  const context = useContext(UserSessionContext);
  if (context === undefined) {
    throw new Error('useUserSession must be used within a UserSessionProvider');
  }
  return context;
}
