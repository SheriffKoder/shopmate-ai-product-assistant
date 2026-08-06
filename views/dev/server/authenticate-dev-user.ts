/**
 * Authenticate Dev User Action
 *
 * Purpose: Creates or confirms the configured development auth user.
 * Used in: views/dev/ui/dev-page.tsx
 * Used for: Prepares the env-driven user needed by later assistant work.
 */

'use server';

import { createSupabaseServiceClient } from '@/shared/infrastructure/supabase/server/create-service-client';
import { getAppEnv } from '@/shared/config/env';
import { redirectDevActionResult } from '@/views/dev/lib/redirect-dev-action-result';
import { upsertUserForAuthUser } from '@/shared/infrastructure/supabase/queries/user-queries';

/**
 * Ensures the configured development user exists in Supabase Auth.
 */
export async function authenticateDevUser() {
  const appEnv = getAppEnv();
  const supabase = createSupabaseServiceClient();
  const email = appEnv.DEV_EMAIL.trim();
  const password = appEnv.DEV_PASSWORD;
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    password,
  });

  let authUser = data.user;

  if (error) {
    const alreadyExists = error.message.toLowerCase().includes('already');

    if (!alreadyExists) {
      redirectDevActionResult({
        message: `Failed to create development user: ${error.message}`,
        status: 'error',
      });
    }

    const existingUser = await supabase.auth.admin.listUsers();
    authUser = existingUser.data.users.find(function findConfiguredUser(user) {
      return user.email?.toLowerCase() === email.toLowerCase();
    }) ?? null;
  }

  if (!authUser) {
    redirectDevActionResult({
      message: `Failed to resolve development user for ${email}.`,
      status: 'error',
    });
  }

  const applicationUser = await upsertUserForAuthUser({
    authUserId: authUser.id,
    email,
    name: 'ShopMate User',
  });

  if (!applicationUser) {
    redirectDevActionResult({
      message: `Auth user was ready, but the application user could not be linked for ${email}.`,
      status: 'error',
    });
  }

  redirectDevActionResult({
    message: ` dev user and application user ready for ${authUser.email ?? email}.`,
    status: 'success',
  });
}
