/**
 * Shadow Environment Config
 *
 * Purpose: Validates environment variables for the parallel shadow architecture.
 * Used in: shadow/shared/supabase/server
 * Used for: Keeps shadow Supabase and development credentials isolated from current app config.
 */

type ShadowEnvKey =
  | 'SHADOW_NEXT_PUBLIC_SUPABASE_URL'
  | 'SHADOW_SUPABASE_SERVICE_ROLE_KEY'
  | 'SHADOW_DEV_EMAIL'
  | 'SHADOW_DEV_PASSWORD'
  | 'SHADOW_SUPABASE_TABLE_PREFIX';

type ShadowEnv = Record<ShadowEnvKey, string>;

/**
 * Reads one required shadow environment variable.
 *
 * @param key - Environment variable name to read.
 * @returns The configured environment value.
 * @throws Error when the value is missing.
 */
function readRequiredShadowEnv(key: ShadowEnvKey) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing ${key} environment variable. Add it to .env.local for shadow pages.`);
  }

  return value;
}

/**
 * Reads one optional shadow environment variable.
 *
 * @param key - Environment variable name to read.
 * @param fallback - Safe value to use when the env var is not configured.
 * @returns The configured environment value or fallback.
 */
function readOptionalShadowEnv(key: ShadowEnvKey, fallback: string) {
  return process.env[key] || fallback;
}

/**
 * Reads and validates all required shadow environment variables.
 *
 * @returns The validated shadow environment config.
 */
export function getShadowEnv(): ShadowEnv {
  return {
    SHADOW_NEXT_PUBLIC_SUPABASE_URL: readRequiredShadowEnv('SHADOW_NEXT_PUBLIC_SUPABASE_URL'),
    SHADOW_SUPABASE_SERVICE_ROLE_KEY: readRequiredShadowEnv('SHADOW_SUPABASE_SERVICE_ROLE_KEY'),
    SHADOW_DEV_EMAIL: readRequiredShadowEnv('SHADOW_DEV_EMAIL'),
    SHADOW_DEV_PASSWORD: readRequiredShadowEnv('SHADOW_DEV_PASSWORD'),
    SHADOW_SUPABASE_TABLE_PREFIX: readOptionalShadowEnv('SHADOW_SUPABASE_TABLE_PREFIX', 'sm_'),
  };
}

/**
 * Reads the shadow Supabase service credentials.
 *
 * @returns The validated Supabase URL and service role key for server-side access.
 */
export function getShadowSupabaseServiceEnv() {
  const shadowEnv = getShadowEnv();

  return {
    supabaseUrl: shadowEnv.SHADOW_NEXT_PUBLIC_SUPABASE_URL,
    supabaseServiceRoleKey: shadowEnv.SHADOW_SUPABASE_SERVICE_ROLE_KEY,
  };
}

/**
 * Reads the table prefix for shadow Supabase catalog tables.
 *
 * @returns The configured table prefix, defaulting to sm_.
 */
export function getShadowSupabaseTablePrefix() {
  return getShadowEnv().SHADOW_SUPABASE_TABLE_PREFIX;
}
