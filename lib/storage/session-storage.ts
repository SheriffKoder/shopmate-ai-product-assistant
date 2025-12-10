/**
 * Session Storage Abstraction Layer
 * 
 * Purpose: Provides a unified interface for data persistence
 * Used in: API routes (products, cart, etc.)
 * Why: Easy to swap session storage for real database later
 * 
 * Migration Path:
 * - Development: sessionStorage (current)
 * - Production: Replace with database queries (PostgreSQL, etc.)
 * 
 * To migrate to database:
 * 1. Create lib/storage/database.ts with same interface
 * 2. Replace imports in API routes
 * 3. No other code changes needed!
 */

/**
 * Storage interface - implement this for any storage backend
 */
export interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
  has(key: string): boolean;
}

/**
 * Session Storage Implementation
 * 
 * Uses browser sessionStorage for client-side persistence
 * Data persists only for the browser session (cleared on tab close)
 */
class SessionStorageAdapter implements StorageAdapter {
  /**
   * Get value from session storage
   * @param key - Storage key
   * @returns Parsed value or null if not found
   */
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') {
      // Server-side: return null (sessionStorage not available)
      return null;
    }

    try {
      const item = sessionStorage.getItem(key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`[SessionStorage] Error getting key "${key}":`, error);
      return null;
    }
  }

  /**
   * Set value in session storage
   * @param key - Storage key
   * @param value - Value to store (will be JSON stringified)
   */
  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') {
      // Server-side: no-op (sessionStorage not available)
      console.warn(`[SessionStorage] Cannot set key "${key}" on server-side`);
      return;
    }

    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`[SessionStorage] Error setting key "${key}":`, error);
    }
  }

  /**
   * Remove value from session storage
   * @param key - Storage key to remove
   */
  remove(key: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`[SessionStorage] Error removing key "${key}":`, error);
    }
  }

  /**
   * Clear all session storage
   */
  clear(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('[SessionStorage] Error clearing storage:', error);
    }
  }

  /**
   * Check if key exists in session storage
   * @param key - Storage key to check
   * @returns True if key exists
   */
  has(key: string): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    return sessionStorage.getItem(key) !== null;
  }
}

/**
 * Storage instance
 * 
 * This is the single point of change when migrating to database
 * Just replace this instance with a DatabaseAdapter
 */
export const storage: StorageAdapter = new SessionStorageAdapter();

/**
 * Storage keys (centralized for consistency)
 */
export const STORAGE_KEYS = {
  PRODUCTS: 'shopmate:products',
  CART: 'shopmate:cart',
  USER: 'shopmate:user',
  // Add more keys as needed
} as const;

/**
 * Helper functions for common operations
 */

/**
 * Initialize storage with default data if not exists
 * @param key - Storage key
 * @param defaultValue - Default value to set if key doesn't exist
 */
export function initStorage<T>(key: string, defaultValue: T): T {
  if (!storage.has(key)) {
    storage.set(key, defaultValue);
    return defaultValue;
  }
  return storage.get<T>(key) ?? defaultValue;
}

/**
 * Get or create storage value
 * @param key - Storage key
 * @param defaultValue - Default value if not found
 * @returns Existing value or default
 */
export function getOrCreate<T>(key: string, defaultValue: T): T {
  const existing = storage.get<T>(key);
  if (existing === null) {
    storage.set(key, defaultValue);
    return defaultValue;
  }
  return existing;
}

