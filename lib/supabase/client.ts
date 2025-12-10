/**
 * Supabase Client Setup
 * 
 * Purpose: Create Supabase client for server-side operations
 * Used in: API routes, server-side artifact handlers
 * Why: Provides database access for artifact persistence
 * 
 * Note: Uses service role key for server-side operations (bypasses RLS)
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Get Supabase URL from environment variables
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * Get Supabase service role key from environment variables
 * This key has admin privileges and bypasses Row Level Security (RLS)
 */
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Validate environment variables
 */
if (!supabaseUrl) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
    'Please add it to your .env.local file.'
  );
}

if (!supabaseServiceKey) {
  throw new Error(
    'Missing SUPABASE_SERVICE_ROLE_KEY environment variable. ' +
    'Please add it to your .env.local file. ' +
    'You can find it in your Supabase project settings under API.'
  );
}

/**
 * Supabase Admin Client
 * 
 * This client uses the service role key and has full access to the database.
 * It bypasses Row Level Security (RLS) policies.
 * 
 * Use this for:
 * - Server-side operations (API routes)
 * - Admin operations
 * - Operations that need to bypass RLS
 * 
 * DO NOT expose this client to the client-side code!
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Type helper for Supabase database
 * 
 * This can be used for type-safe database operations
 * when we add more tables in the future.
 */
export type SupabaseClient = typeof supabaseAdmin;

