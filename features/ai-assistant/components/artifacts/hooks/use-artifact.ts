/**
 * use-artifact Hook
 * 
 * Purpose: Global artifact state management using SWR
 * Used in: Artifact components, DataStreamHandler, message components
 * Why: Provides global artifact state shared across all components
 * 
 * Architecture:
 * - Uses SWR for global state (no fetcher - manual updates only)
 * - Supports both direct updates and functional updates
 * - Includes metadata support for future features
 * - Includes boundingBox for animation transitions
 */

'use client';

import { useCallback, useMemo } from 'react';
import useSWR from 'swr';

/**
 * UI Artifact interface
 * 
 * Represents the artifact state in the UI
 */
export interface UIArtifact {
  /** Document ID (UUID) - "init" means no artifact */
  documentId: string;
  /** Artifact title */
  title: string;
  /** Artifact content (text, code, etc.) */
  content: string;
  /** Artifact type/kind */
  kind: 'text' | 'code' | 'sheet' | 'chart';
  /** Artifact status */
  status: 'idle' | 'streaming' | 'complete';
  /** Whether artifact panel is visible */
  isVisible: boolean;
  /** Bounding box for animation transitions (from preview card to panel) */
  boundingBox: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

/**
 * Initial artifact state
 */
export const initialArtifactData: UIArtifact = {
  documentId: 'init',
  title: '',
  content: '',
  kind: 'text',
  status: 'idle',
  isVisible: false,
  boundingBox: {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  },
};

/**
 * Selector type for optimized re-renders
 */
type Selector<T> = (state: UIArtifact) => T;

/**
 * useArtifactSelector Hook
 * 
 * Purpose: Select specific artifact state to prevent unnecessary re-renders
 * 
 * @example
 * ```tsx
 * const isVisible = useArtifactSelector(artifact => artifact.isVisible);
 * // Only re-renders when isVisible changes, not when content changes
 * ```
 */
export function useArtifactSelector<Selected>(selector: Selector<Selected>) {
  const { data: localArtifact } = useSWR<UIArtifact>('artifact', null, {
    fallbackData: initialArtifactData,
  });

  const selectedValue = useMemo(() => {
    if (!localArtifact) {
      return selector(initialArtifactData);
    }
    return selector(localArtifact);
  }, [localArtifact, selector]);

  return selectedValue;
}

/**
 * useArtifact Hook
 * 
 * Purpose: Global artifact state management
 * 
 * Returns:
 * - artifact: Current artifact state
 * - setArtifact: Function to update artifact (supports direct or functional updates)
 * - metadata: Artifact metadata (for future features like suggestions)
 * - setMetadata: Function to update metadata
 * 
 * @example
 * ```tsx
 * const { artifact, setArtifact } = useArtifact();
 * 
 * // Direct update
 * setArtifact({ ...artifact, isVisible: true });
 * 
 * // Functional update
 * setArtifact(prev => ({ ...prev, content: prev.content + 'new text' }));
 * ```
 */
export function useArtifact() {
  const { data: localArtifact, mutate: setLocalArtifact } = useSWR<UIArtifact>(
    'artifact',
    null, // No fetcher - manual updates only
    {
      fallbackData: initialArtifactData,
    }
  );

  const artifact = useMemo(() => {
    if (!localArtifact) {
      return initialArtifactData;
    }
    return localArtifact;
  }, [localArtifact]);

  /**
   * setArtifact - Update artifact state
   * 
   * Supports both direct updates and functional updates
   */
  const setArtifact = useCallback(
    (
      updaterFn: UIArtifact | ((currentArtifact: UIArtifact) => UIArtifact)
    ) => {
      setLocalArtifact((currentArtifact) => {
        const artifactToUpdate = currentArtifact || initialArtifactData;

        if (typeof updaterFn === 'function') {
          return updaterFn(artifactToUpdate);
        }

        return updaterFn;
      });
    },
    [setLocalArtifact]
  );

  /**
   * Metadata support (for future features like suggestions, versions, etc.)
   */
  const { data: localArtifactMetadata, mutate: setLocalArtifactMetadata } =
    useSWR<any>(
      () =>
        artifact.documentId && artifact.documentId !== 'init'
          ? `artifact-metadata-${artifact.documentId}`
          : null,
      null,
      {
        fallbackData: null,
      }
    );

  return useMemo(
    () => ({
      artifact,
      setArtifact,
      metadata: localArtifactMetadata,
      setMetadata: setLocalArtifactMetadata,
    }),
    [artifact, setArtifact, localArtifactMetadata, setLocalArtifactMetadata]
  );
}
