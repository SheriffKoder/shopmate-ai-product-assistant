/**
 * Dev Action Redirect
 *
 * Purpose: Redirects /dev server actions with readable status messages.
 * Used in: development server actions.
 * Used for: Shows action outcomes without adding client state to the dev page.
 */

import { redirect } from 'next/navigation';

type RedirectDevActionResultParams = {
  message: string;
  status: 'error' | 'success';
};

/**
 * Redirects back to /dev with an action result.
 *
 * @param params - Action result status and message.
 */
export function redirectDevActionResult(params: RedirectDevActionResultParams): never {
  const searchParams = new URLSearchParams({
    message: params.message,
    status: params.status,
  });

  redirect(`/dev?${searchParams.toString()}`);
}
