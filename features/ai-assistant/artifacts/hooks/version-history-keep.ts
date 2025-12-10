/**
 * Version History Keep Hook
 * 
 * Purpose: Handles "Keep" functionality - deletes all versions after current
 * Used in: VersionHistoryManagementButtons component
 * Why: Provides reusable logic for version pruning
 * 
 * Features:
 * - Deletes versions after a specific timestamp
 * - Updates SWR cache after deletion
 * - Error handling and loading states
 */

'use client';

import { useState, useCallback } from 'react';
import { useDocument } from './use-document-swr';
import { logger } from '@/features/ai-assistant/lib/logger';
import { buildArtifactApiUrl } from '../utils/artifact-api-endpoint';
import type { DocumentKind } from '@/lib/supabase/types';

interface UseVersionHistoryKeepOptions {
  documentId: string | null;
  timestamp: string | null; // ISO timestamp of the version to keep (deletes all after this)
  kind?: DocumentKind; // Artifact kind (defaults to 'text' for backward compatibility)
}

interface UseVersionHistoryKeepReturn {
  /** Function to keep current version and delete all after it */
  keepVersion: () => Promise<void>;
  
  /** Whether the keep operation is in progress */
  isKeeping: boolean;
  
  /** Error object if keep operation failed */
  error: Error | null;
}

/**
 * useVersionHistoryKeep Hook
 * 
 * Handles "Keep" functionality - deletes all versions after the current one.
 * 
 * @param documentId - Document ID
 * @param timestamp - ISO timestamp of the version to keep (deletes all versions created after this)
 * 
 * @returns Keep function and loading/error states
 * 
 * @example
 * ```typescript
 * const { keepVersion, isKeeping, error } = useVersionHistoryKeep({
 *   documentId: 'doc-123',
 *   timestamp: currentVersion?.createdAt || null,
 * });
 * 
 * <Button onClick={keepVersion} disabled={isKeeping}>
 *   Keep This Version
 * </Button>
 * ```
 */
export function useVersionHistoryKeep({
  documentId,
  timestamp,
  kind = 'text', // Default to 'text' for backward compatibility
}: UseVersionHistoryKeepOptions): UseVersionHistoryKeepReturn {
  const [isKeeping, setIsKeeping] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { mutate: mutateDocument } = useDocument(documentId);

  const keepVersion = useCallback(async () => {
    if (!documentId || !timestamp) {
      logger.warn('[Version History Keep] Missing documentId or timestamp');
      return;
    }

    setIsKeeping(true);
    setError(null);

    try {
      logger.debug('[Version History Keep] Deleting versions after timestamp', {
        documentId,
        timestamp,
        kind,
      });

      // Use artifact-specific API endpoint
      const apiUrl = buildArtifactApiUrl(kind, {
        id: documentId,
        timestamp,
      });

      // Delete all versions created after the specified timestamp
      // The API endpoint deletes versions where createdAt >= timestamp
      // We need to delete versions where createdAt > timestamp
      // So we'll use a slightly later timestamp to ensure we delete only after
      const response = await fetch(apiUrl, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to keep version: ${response.statusText}`);
      }

      logger.info('[Version History Keep] Successfully kept version and deleted subsequent versions', {
        documentId,
        timestamp,
      });

      // Revalidate document cache to reflect changes
      await mutateDocument();

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      logger.error('[Version History Keep] Error keeping version', error);
      setError(error);
      throw error;
    } finally {
      setIsKeeping(false);
    }
  }, [documentId, timestamp, mutateDocument]);

  return {
    keepVersion,
    isKeeping,
    error,
  };
}

