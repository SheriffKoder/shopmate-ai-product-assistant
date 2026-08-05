/**
 * Version History Save Hook
 * 
 * Purpose: Reusable hook for saving artifact versions to Supabase
 * Used in: Text, code, and sheet artifact editing components
 * Why: Provides generic save functionality with SWR cache invalidation
 * 
 * Features:
 * - Generic save function (works with any artifact kind)
 * - Creates new version (same ID, new createdAt)
 * - SWR cache invalidation
 * - Error handling
 * - Loading state
 * - Last saved timestamp
 */

'use client';

import { useState, useCallback } from 'react';
import { useDocument } from './use-document-swr';
import type { DocumentKind } from '@/features/ai-assistant/model/artifact-document';
import { logger } from '@/features/ai-assistant/lib/logger';
import { buildArtifactApiUrl } from '../utils/artifact-api-endpoint';

interface SaveVersionParams {
  documentId: string;
  title: string;
  content: string;
  kind: DocumentKind;
}

interface UseVersionHistorySaveReturn {
  saveVersion: (params: SaveVersionParams) => Promise<void>;
  isSaving: boolean;
  error: Error | null;
  lastSavedAt: Date | null;
}

/**
 * Reusable hook for saving artifact versions
 * 
 * Creates a new version of the document (same ID, new createdAt)
 * and invalidates SWR cache to refresh version count.
 * 
 * @param documentId - Document ID to save (null = no save operations)
 * @returns Save function and state
 * 
 * @example
 * ```typescript
 * const { saveVersion, isSaving, error, lastSavedAt } = useVersionHistorySave(documentId);
 * 
 * await saveVersion({
 *   documentId: 'abc-123',
 *   title: 'My Document',
 *   content: 'Document content...',
 *   kind: 'text',
 * });
 * 
 * // In UI:
 * {isSaving && <span>Saving...</span>}
 * {error && <span>Error: {error.message}</span>}
 * {lastSavedAt && <span>Saved {formatDate(lastSavedAt)}</span>}
 * ```
 */
export function useVersionHistorySave(documentId: string | null): UseVersionHistorySaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const { mutate: mutateDocument } = useDocument(documentId);

  const saveVersion = useCallback(async ({
    documentId: id,
    title,
    content,
    kind,
  }: SaveVersionParams) => {
    if (!id) {
      logger.warn('[Version History Save] No documentId provided');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      logger.debug('[Version History Save] Saving document version', {
        documentId: id,
        title,
        contentLength: content.length,
        kind,
      });

      // Use artifact-specific API endpoint
      const apiUrl = buildArtifactApiUrl(kind, { id });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          kind,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to save document: ${response.statusText}`);
      }

      const savedDocument = await response.json();
      
      logger.info('[Version History Save] Successfully saved document version', {
        documentId: id,
        createdAt: savedDocument.createdAt,
        titleLength: savedDocument.title?.length || 0,
        contentLength: savedDocument.content?.length || 0,
      });

      setLastSavedAt(new Date());

      // Invalidate SWR cache to refresh version count
      // Use revalidate: true to force immediate refetch
      await mutateDocument(undefined, { revalidate: true });

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      logger.error('[Version History Save] Error saving document version', error);
      setError(error);
      throw error; // Re-throw so caller can handle
    } finally {
      setIsSaving(false);
    }
  }, [mutateDocument]);

  return {
    saveVersion,
    isSaving,
    error,
    lastSavedAt,
  };
}
