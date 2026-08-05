/**
 * Shadow Table Names
 *
 * Purpose: Builds Supabase table names for the shadow catalog.
 * Used in: shadow repositories.
 * Used for: Keeps the sm_ table prefix configurable without hardcoding table names in data access files.
 */

import 'server-only';

import { getShadowSupabaseTablePrefix } from '@/shared/config/env';

/**
 * Builds one prefixed shadow table name.
 *
 * @param tableName - Unprefixed table name.
 * @returns The prefixed Supabase table name.
 */
function getShadowTableName(tableName: string) {
  return `${getShadowSupabaseTablePrefix()}${tableName}`;
}

/**
 * Builds all shadow catalog table names.
 *
 * @returns Prefixed category and product table names.
 */
export function getShadowCatalogTableNames() {
  return {
    categories: getShadowTableName('categories'),
    products: getShadowTableName('products'),
  };
}
