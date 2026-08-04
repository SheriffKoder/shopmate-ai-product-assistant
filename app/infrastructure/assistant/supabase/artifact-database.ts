/**
 * @file app/infrastructure/assistant/supabase/artifact-database.ts
 * Supabase artifact database composition boundary.
 *
 * Purpose: Keeps the Supabase client out of assistant artifact implementation files.
 * Used in: current server-side artifact tools until document persistence is fully adapterized.
 */

export { supabaseAdmin } from '@/lib/supabase/client';
