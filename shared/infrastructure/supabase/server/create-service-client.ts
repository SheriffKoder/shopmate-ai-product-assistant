/**
 * Supabase Service Client
 *
 * Purpose: Creates a server-only Supabase service client for the server-first Supabase project.
 * Used in: Future repositories and development seed/revalidation actions.
 * Used for: Provides the canonical server-only database access for all application domains.
 */

import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceEnv } from '@/shared/config/env';

/**
 * Creates a Supabase service-role client for server use cases.
 *
 * @returns A Supabase client configured with service credentials.
 */
export function createSupabaseServiceClient() {
  const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseServiceEnv();

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export type SupabaseServiceClient = ReturnType<typeof createSupabaseServiceClient>;

/** Shared service-role client for server-side repositories and routes. */
export const supabaseAdmin = createSupabaseServiceClient();
