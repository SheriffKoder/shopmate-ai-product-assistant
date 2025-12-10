/**
 * Artifact API Endpoint Utility
 * 
 * Purpose: Provides a centralized way to get API endpoints for different artifact types
 * Used in: version-history-save, version-history-keep, and other artifact operations
 * Why: Makes it easy to support different API endpoints for different artifact types
 * 
 * Architecture:
 * - Maps artifact kind to API endpoint
 * - Defaults to /api/document for backward compatibility
 * - Easy to extend for future artifact types (code, sheet, etc.)
 */

import type { DocumentKind } from '@/lib/supabase/types';

/**
 * Artifact API Endpoint Configuration
 * 
 * Maps artifact kinds to their API endpoints.
 * 
 * Future artifact types can be added here:
 * - 'code' -> '/api/code-artifact' (if needed)
 * - 'sheet' -> '/api/sheet-artifact' (if needed)
 * - 'image' -> '/api/image-artifact' (if needed)
 */
const ARTIFACT_API_ENDPOINTS: Record<DocumentKind, string> = {
  text: '/api/document',
  code: '/api/document', // Currently uses same endpoint, can be changed later
  sheet: '/api/document', // Currently uses same endpoint, can be changed later
};

/**
 * Get API endpoint for an artifact kind
 * 
 * @param kind - Artifact kind (text, code, sheet)
 * @returns API endpoint path
 * 
 * @example
 * ```typescript
 * const endpoint = getArtifactApiEndpoint('text'); // '/api/document'
 * const endpoint = getArtifactApiEndpoint('code'); // '/api/document' (or '/api/code-artifact' in future)
 * ```
 */
export function getArtifactApiEndpoint(kind: DocumentKind): string {
  return ARTIFACT_API_ENDPOINTS[kind] || '/api/document';
}

/**
 * Build API endpoint URL with query parameters
 * 
 * @param kind - Artifact kind
 * @param params - Query parameters (id, timestamp, etc.)
 * @returns Full API endpoint URL with query string
 * 
 * @example
 * ```typescript
 * const url = buildArtifactApiUrl('text', { id: 'doc-123' });
 * // '/api/document?id=doc-123'
 * 
 * const url = buildArtifactApiUrl('text', { id: 'doc-123', timestamp: '2024-01-01T00:00:00Z' });
 * // '/api/document?id=doc-123&timestamp=2024-01-01T00:00:00Z'
 * ```
 */
export function buildArtifactApiUrl(
  kind: DocumentKind,
  params: Record<string, string | null | undefined>
): string {
  const baseUrl = getArtifactApiEndpoint(kind);
  const queryParams = new URLSearchParams();
  
  // Add non-null/undefined params to query string
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      queryParams.append(key, value);
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

