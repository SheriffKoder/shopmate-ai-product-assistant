/**
 * Artifact API Endpoint Utility
 * 
 * Purpose: Provides a centralized way to get API endpoints for different artifact types
 * Used in: version-history-save, version-history-keep, and other artifact operations
 * Why: Makes it easy to support different API endpoints for different artifact types
 * 
 * Architecture:
 * - Maps artifact kind to API endpoint
 * - Uses the assistant-owned document endpoint
 * - Easy to extend for future artifact types (code, sheet, etc.)
 */

import { assistantApiEndpoints } from '@/features/ai-assistant/model/api-endpoints';

import type { DocumentKind } from '@/features/ai-assistant/model/artifact-document';
export type { DocumentKind } from '@/features/ai-assistant/model/artifact-document';

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
  text: assistantApiEndpoints.document,
  code: assistantApiEndpoints.document, // Currently uses same endpoint, can be changed later
  sheet: assistantApiEndpoints.document, // Currently uses same endpoint, can be changed later
  chart: assistantApiEndpoints.document,
};

/**
 * Get API endpoint for an artifact kind
 * 
 * @param kind - Artifact kind (text, code, sheet)
 * @returns API endpoint path
 * 
 * @example
 * ```typescript
 * const endpoint = getArtifactApiEndpoint('text'); // '/api/ai-assistant/document'
 * const endpoint = getArtifactApiEndpoint('code'); // '/api/ai-assistant/document'
 * ```
 */
export function getArtifactApiEndpoint(kind: DocumentKind): string {
  return ARTIFACT_API_ENDPOINTS[kind] || assistantApiEndpoints.document;
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
 * // '/api/ai-assistant/document?id=doc-123'
 * 
 * const url = buildArtifactApiUrl('text', { id: 'doc-123', timestamp: '2024-01-01T00:00:00Z' });
 * // '/api/ai-assistant/document?id=doc-123&timestamp=2024-01-01T00:00:00Z'
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
