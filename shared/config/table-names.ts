/**
 * Table Names
 *
 * Purpose: Builds Supabase table names for the catalog.
 * Used in: repositories.
 * Used for: Keeps the sm_ table prefix configurable without hardcoding table names in data access files.
 */

import 'server-only';

import { getCatalogTablePrefix } from '@/shared/config/env';

/**
 * Builds one prefixed table name.
 *
 * @param tableName - Unprefixed table name.
 * @returns The prefixed Supabase table name.
 */
function getCatalogTableName(tableName: string) {
  return `${getCatalogTablePrefix()}${tableName}`;
}

/**
 * Builds all catalog table names.
 *
 * @returns Prefixed category and product table names.
 */
export function getCatalogTableNames() {
  return {
    categories: getCatalogTableName('categories'),
    products: getCatalogTableName('products'),
  };
}
