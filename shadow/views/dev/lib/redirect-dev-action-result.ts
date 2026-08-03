/**
 * Shadow Dev Action Redirect
 *
 * Purpose: Redirects /shadow/dev server actions with readable status messages.
 * Used in: shadow dev server actions.
 * Used for: Shows action outcomes without adding client state to the dev page.
 */

import { redirect } from 'next/navigation';

type RedirectShadowDevActionResultParams = {
  message: string;
  status: 'error' | 'success';
};

/**
 * Redirects back to /shadow/dev with an action result.
 *
 * @param params - Action result status and message.
 */
export function redirectShadowDevActionResult(params: RedirectShadowDevActionResultParams): never {
  const searchParams = new URLSearchParams({
    message: params.message,
    status: params.status,
  });

  redirect(`/shadow/dev?${searchParams.toString()}`);
}
