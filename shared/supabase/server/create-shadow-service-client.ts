/**
 * Shadow Supabase Service Client
 *
 * Purpose: Creates a server-only Supabase service client for the shadow project.
 * Used in: Future shadow repositories and development seed/revalidation actions.
 * Used for: Isolates shadow database access from the current app Supabase client.
 */

import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { getShadowSupabaseServiceEnv } from '@/shared/config/env';

/**
 * Creates a Supabase service-role client for shadow server use cases.
 *
 * @returns A Supabase client configured with shadow service credentials.
 */
export function createShadowServiceClient() {
  const { supabaseUrl, supabaseServiceRoleKey } = getShadowSupabaseServiceEnv();

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export type ShadowServiceClient = ReturnType<typeof createShadowServiceClient>;
