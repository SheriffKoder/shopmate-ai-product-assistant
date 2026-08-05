/**
 * Authenticate Dev User Action
 *
 * Purpose: Creates or confirms the configured development auth user.
 * Used in: views/dev/ui/dev-page.tsx
 * Used for: Prepares the env-driven user needed by later assistant work.
 */

'use server';

import { createSupabaseServiceClient } from '@/shared/supabase/server/create-service-client';
import { getAppEnv } from '@/shared/config/env';
import { redirectDevActionResult } from '@/views/dev/lib/redirect-dev-action-result';

/**
 * Ensures the configured development user exists in Supabase Auth.
 */
export async function authenticateDevUser() {
  const appEnv = getAppEnv();
  const supabase = createSupabaseServiceClient();
  const email = appEnv.SHADOW_DEV_EMAIL.trim();
  const password = appEnv.SHADOW_DEV_PASSWORD;
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    password,
  });

  if (error) {
    const alreadyExists = error.message.toLowerCase().includes('already');

    redirectDevActionResult({
      message: alreadyExists ? ` dev user already exists for ${email}.` : `Failed to create development user: ${error.message}`,
      status: alreadyExists ? 'success' : 'error',
    });
  }

  redirectDevActionResult({
    message: ` dev user ready for ${data.user.email ?? email}.`,
    status: 'success',
  });
}
