/**
 * Shadow Dev Action Result Parser
 *
 * Purpose: Reads action outcomes from /shadow/dev search params.
 * Used in: shadow/views/dev/index.tsx
 * Used for: Keeps server action redirects and page messages small and consistent.
 */

export type ShadowDevActionResult = {
  message: string;
  status: 'error' | 'success';
};

type ShadowDevActionSearchParams = {
  message?: string;
  status?: string;
};

/**
 * Parses a dev action result from route search params.
 *
 * @param searchParams - Search params supplied by the dev route.
 * @returns A typed action result or null when no action has run.
 */
export function getShadowDevActionResult(searchParams: ShadowDevActionSearchParams): ShadowDevActionResult | null {
  if (!searchParams.message) {
    return null;
  }

  return {
    message: searchParams.message,
    status: searchParams.status === 'error' ? 'error' : 'success',
  };
}
