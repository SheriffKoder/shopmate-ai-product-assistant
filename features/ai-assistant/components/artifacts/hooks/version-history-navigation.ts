/**
 * Version History Navigation Hook
 * 
 * Purpose: Manages version navigation state (undo/redo) for artifacts
 * Used in: TextArtifactContent and other artifact components
 * Why: Provides centralized version navigation logic
 * 
 * Features:
 * - Tracks current version index
 * - Undo/redo navigation
 * - Disabled state management (first/last/only version)
 * - Syncs with document versions from useDocument
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { AssistantDocument as Document } from '@/features/ai-assistant/model/artifact-document';

interface UseVersionHistoryNavigationOptions {
  documents: Document[];
  onVersionChange?: (document: Document | null) => void;
}

interface UseVersionHistoryNavigationReturn {
  /** Current version index (0-based, -1 if no versions) */
  currentIndex: number;
  
  /** Current version document (null if no versions) */
  currentVersion: Document | null;
  
  /** Total number of versions */
  totalVersions: number;
  
  /** Whether undo is available (not at first version) */
  canUndo: boolean;
  
  /** Whether redo is available (not at last version) */
  canRedo: boolean;
  
  /** Whether navigation is available (more than 1 version) */
  canNavigate: boolean;
  
  /** Navigate to previous version (undo) */
  undo: () => void;
  
  /** Navigate to next version (redo) */
  redo: () => void;
  
  /** Navigate to specific version index */
  goToVersion: (index: number) => void;
  
  /** Reset to latest version */
  resetToLatest: () => void;
}

/**
 * useVersionHistoryNavigation Hook
 * 
 * Manages version navigation state for artifacts with undo/redo functionality.
 * 
 * @param documents - Array of document versions (ordered by createdAt ascending)
 * @param onVersionChange - Callback when version changes (for syncing UI)
 * 
 * @returns Navigation state and functions
 * 
 * @example
 * ```typescript
 * const { documents } = useDocument(documentId);
 * const {
 *   currentVersion,
 *   canUndo,
 *   canRedo,
 *   undo,
 *   redo,
 * } = useVersionHistoryNavigation({
 *   documents,
 *   onVersionChange: (doc) => {
 *     setLocalContent(doc?.content || '');
 *   },
 * });
 * ```
 */
export function useVersionHistoryNavigation({
  documents,
  onVersionChange,
}: UseVersionHistoryNavigationOptions): UseVersionHistoryNavigationReturn {
  const totalVersions = documents.length;
  
  // Current index: -1 if no versions, otherwise start at last version (latest)
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    return totalVersions > 0 ? totalVersions - 1 : -1;
  });

  // Update index when documents change (e.g., new version saved)
  useEffect(() => {
    if (totalVersions > 0) {
      // If we were at the latest version (last index), stay at latest after new version is added
      // Otherwise, keep current index (don't jump when new version is added)
      setCurrentIndex((prevIndex) => {
        // If no valid index, go to latest
        if (prevIndex === -1) {
          return totalVersions - 1;
        }
        // If we were at the previous latest version, move to new latest
        if (prevIndex === totalVersions - 2) {
          return totalVersions - 1;
        }
        // Otherwise, keep current index (viewing old version)
        return prevIndex;
      });
    } else {
      setCurrentIndex(-1);
    }
  }, [totalVersions]); // Only depend on totalVersions

  // Current version document
  const currentVersion = useMemo(() => {
    if (currentIndex === -1 || currentIndex >= totalVersions) {
      return null;
    }
    return documents[currentIndex] || null;
  }, [currentIndex, documents, totalVersions]);

  // Notify parent when version changes
  useEffect(() => {
    if (onVersionChange) {
      onVersionChange(currentVersion);
    }
  }, [currentVersion, onVersionChange]);

  // Navigation state
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < totalVersions - 1;
  const canNavigate = totalVersions > 1;

  // Undo: go to previous version
  const undo = useCallback(() => {
    if (canUndo) {
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    }
  }, [canUndo]);

  // Redo: go to next version
  const redo = useCallback(() => {
    if (canRedo) {
      setCurrentIndex((prev) => Math.min(totalVersions - 1, prev + 1));
    }
  }, [canRedo, totalVersions]);

  // Go to specific version index
  const goToVersion = useCallback((index: number) => {
    if (index >= 0 && index < totalVersions) {
      setCurrentIndex(index);
    }
  }, [totalVersions]);

  // Reset to latest version
  const resetToLatest = useCallback(() => {
    if (totalVersions > 0) {
      setCurrentIndex(totalVersions - 1);
    }
  }, [totalVersions]);

  return {
    currentIndex,
    currentVersion,
    totalVersions,
    canUndo,
    canRedo,
    canNavigate,
    undo,
    redo,
    goToVersion,
    resetToLatest,
  };
}
