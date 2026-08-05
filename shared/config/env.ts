/**
 * Environment Config
 *
 * Purpose: Validates environment variables for the parallel architecture.
 * Used in: shared/supabase/server
 * Used for: Keeps server-first Supabase and development credentials isolated from current app config.
 */

type AppEnvKey =
  | 'SHADOW_NEXT_PUBLIC_SUPABASE_URL'
  | 'SHADOW_SUPABASE_SERVICE_ROLE_KEY'
  | 'SHADOW_DEV_EMAIL'
  | 'SHADOW_DEV_PASSWORD'
  | 'SHADOW_SUPABASE_TABLE_PREFIX';

type AppEnv = Record<AppEnvKey, string>;

/**
 * Reads one required environment variable.
 *
 * @param key - Environment variable name to read.
 * @returns The configured environment value.
 * @throws Error when the value is missing.
 */
function readRequiredAppEnv(key: AppEnvKey) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing ${key} environment variable. Add it to .env.local for pages.`);
  }

  return value;
}

/**
 * Reads one optional environment variable.
 *
 * @param key - Environment variable name to read.
 * @param fallback - Safe value to use when the env var is not configured.
 * @returns The configured environment value or fallback.
 */
function readOptionalAppEnv(key: AppEnvKey, fallback: string) {
  return process.env[key] || fallback;
}

/**
 * Reads and validates all required environment variables.
 *
 * @returns The validated environment config.
 */
export function getAppEnv(): AppEnv {
  return {
    SHADOW_NEXT_PUBLIC_SUPABASE_URL: readRequiredAppEnv('SHADOW_NEXT_PUBLIC_SUPABASE_URL'),
    SHADOW_SUPABASE_SERVICE_ROLE_KEY: readRequiredAppEnv('SHADOW_SUPABASE_SERVICE_ROLE_KEY'),
    SHADOW_DEV_EMAIL: readRequiredAppEnv('SHADOW_DEV_EMAIL'),
    SHADOW_DEV_PASSWORD: readRequiredAppEnv('SHADOW_DEV_PASSWORD'),
    SHADOW_SUPABASE_TABLE_PREFIX: readOptionalAppEnv('SHADOW_SUPABASE_TABLE_PREFIX', 'sm_'),
  };
}

/**
 * Reads the server-first Supabase service credentials.
 *
 * @returns The validated Supabase URL and service role key for server-side access.
 */
export function getSupabaseServiceEnv() {
  const appEnv = getAppEnv();

  return {
    supabaseUrl: appEnv.SHADOW_NEXT_PUBLIC_SUPABASE_URL,
    supabaseServiceRoleKey: appEnv.SHADOW_SUPABASE_SERVICE_ROLE_KEY,
  };
}

/**
 * Reads the table prefix for server-first Supabase catalog tables.
 *
 * @returns The configured table prefix, defaulting to sm_.
 */
export function getCatalogTablePrefix() {
  return getAppEnv().SHADOW_SUPABASE_TABLE_PREFIX;
}
