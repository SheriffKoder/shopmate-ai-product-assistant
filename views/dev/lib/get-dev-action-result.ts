/**
 * Dev Action Result Parser
 *
 * Purpose: Reads action outcomes from /dev search params.
 * Used in: views/dev/index.tsx
 * Used for: Keeps server action redirects and page messages small and consistent.
 */

export type DevActionResult = {
  message: string;
  status: 'error' | 'success';
};

type DevActionSearchParams = {
  message?: string;
  status?: string;
};

/**
 * Parses a dev action result from route search params.
 *
 * @param searchParams - Search params supplied by the dev route.
 * @returns A typed action result or null when no action has run.
 */
export function getDevActionResult(searchParams: DevActionSearchParams): DevActionResult | null {
  if (!searchParams.message) {
    return null;
  }

  return {
    message: searchParams.message,
    status: searchParams.status === 'error' ? 'error' : 'success',
  };
}
