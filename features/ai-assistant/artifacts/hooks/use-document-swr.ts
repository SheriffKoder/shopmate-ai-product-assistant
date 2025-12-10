/**
 * useDocument Hook
 * 
 * Purpose: SWR hook for fetching documents from Supabase
 * Used in: DocumentPreview, ArtifactPanel, and other artifact components
 * Why: Provides cached, revalidated document fetching with SWR
 * 
 * Features:
 * - Fetches document(s) by ID from /api/document endpoint
 * - Returns array of documents (for version history)
 * - Provides latest document (most recent version)
 * - Automatic caching and revalidation
 * - Conditional fetching (only when documentId is provided)
 */

'use client';

import useSWR from 'swr';
import type { Document } from '@/lib/supabase/types';

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
  const { data, error, isLoading, mutate } = useSWR<Document[]>(
    documentId ? `/api/document?id=${documentId}` : null, // Conditional fetch
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
    isLoading,
    
    /** Error object if request failed */
    error,
    
    /** Function to manually revalidate/refetch */
    mutate,
  };
}

