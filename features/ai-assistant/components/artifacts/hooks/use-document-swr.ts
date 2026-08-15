/**
 * @file features/ai-assistant/components/artifacts/hooks/use-document-swr.ts
 * SWR hook for fetching artifact document versions from Supabase.
 * Used in: ArtifactPanel, text/sheet/chart artifact content, version-history hooks.
 * Used for: Version history + syncing panel content from the documents table.
 *
 * Function Index:
 * useDocument: Conditional GET /api/ai-assistant/document (signed-in only).
 *
 * Steps:
 * 1. Skip fetch when guest or documentId is null (no DB row expected).
 * 2. Fetch versions ordered by createdAt; expose latest as `document`.
 */

'use client';

import useSWR from 'swr';
import { assistantApiEndpoints } from '../../../model/api-endpoints';
import type { AssistantDocument as Document } from '@/features/ai-assistant/model/artifact-document';
import { useUserSession } from '@/features/ai-assistant/providers/user-session-context';

/**
 * Fetcher function for SWR
 *
 * @param url - API endpoint URL
 * @returns Promise resolving to array of documents
 */
const fetcher = async (url: string): Promise<Document[]> => {
  const res = await fetch(url);

  if (!res.ok) {
    // Handle different error cases
    if (res.status === 404) {
      // Document not found - return empty array (not an error)
      return [];
    }

    // Other errors - throw to be caught by SWR
    const errorData = await res.json().catch(() => ({ error: 'Failed to fetch document' }));
    throw new Error(errorData.error || 'Failed to fetch document');
  }

  return res.json();
};

/**
 * useDocument Hook
 *
 * Fetches document(s) by ID from Supabase via API.
 * Returns array of documents (for version history support).
 * Guests (`local` persistence) never hit the API — artifacts live on the message only.
 *
 * @param documentId - Document ID to fetch (null = don't fetch)
 * @returns SWR hook result with documents array and latest document
 *
 * @example
 * ```typescript
 * const { document, documents, isLoading, error } = useDocument('doc-123');
 *
 * // Latest version
 * const latestContent = document?.content;
 *
 * // All versions (for version history)
 * const allVersions = documents;
 * ```
 */
export function useDocument(documentId: string | null) {
  const { user } = useUserSession();
  // Documents are only saved for signed-in (database) sessions. Skip the request for
  // guests so the console is not filled with expected 404s for streamed-only ids.
  const shouldFetch = Boolean(user && documentId);

  const { data, error, isLoading, mutate } = useSWR<Document[]>(
    shouldFetch ? `${assistantApiEndpoints.document}?id=${documentId}` : null,
    fetcher,
    {
      // SWR options
      revalidateOnFocus: false, // Don't refetch on window focus
      revalidateOnReconnect: true, // Refetch when network reconnects
      dedupingInterval: 2000, // Dedupe requests within 2 seconds
    }
  );

  // Get latest version (last in array, since API returns ordered by createdAt ascending)
  const latestDocument = data && data.length > 0 ? data[data.length - 1] : null;

  return {
    /** Array of all document versions (ordered by createdAt ascending) */
    documents: data || [],

    /** Latest document version (most recent) */
    document: latestDocument,

    /** Whether the request is in progress */
    isLoading: shouldFetch ? isLoading : false,

    /** Error object if request failed */
    error,

    /** Function to manually revalidate/refetch */
    mutate,
  };
}
