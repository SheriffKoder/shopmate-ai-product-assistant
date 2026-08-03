/**
 * Authenticate Shadow Dev User Action
 *
 * Purpose: Creates or confirms the configured shadow development auth user.
 * Used in: shadow/views/dev/ui/dev-page.tsx
 * Used for: Prepares the env-driven user needed by later assistant work.
 */

'use server';

import { createShadowServiceClient } from '@/shadow/shared/supabase/server/create-shadow-service-client';
import { getShadowEnv } from '@/shadow/shared/config/env';
import { redirectShadowDevActionResult } from '@/shadow/views/dev/lib/redirect-dev-action-result';

/**
 * Ensures the configured shadow dev user exists in Supabase Auth.
 */
export async function authenticateShadowDevUser() {
  const shadowEnv = getShadowEnv();
  const supabase = createShadowServiceClient();
  const email = shadowEnv.SHADOW_DEV_EMAIL.trim();
  const password = shadowEnv.SHADOW_DEV_PASSWORD;
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    password,
  });

  if (error) {
    const alreadyExists = error.message.toLowerCase().includes('already');

    redirectShadowDevActionResult({
      message: alreadyExists ? `Shadow dev user already exists for ${email}.` : `Failed to create shadow dev user: ${error.message}`,
      status: alreadyExists ? 'success' : 'error',
    });
  }

  redirectShadowDevActionResult({
    message: `Shadow dev user ready for ${data.user.email ?? email}.`,
    status: 'success',
  });
}
