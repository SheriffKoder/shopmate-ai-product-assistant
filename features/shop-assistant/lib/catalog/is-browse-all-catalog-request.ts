/**
 * @file features/shop-assistant/lib/catalog/is-browse-all-catalog-request.ts
 * Pure browse-all catalog detector.
 * Used in: runtime lookup so catalogQuery can be emptied before matching.
 * Used for: Searching the full catalog instead of rewriting "all products" into keywords.
 *
 * Function Index:
 * isBrowseAllCatalogRequest: Detects full-catalog browse wording.
 *
 * Steps:
 * 1. Normalize the user query.
 * 2. Match "all/every/entire/full … products/catalog" style requests.
 * 3. Return true so lookup can use an empty catalog query.
 */

/**
 * Detect a request that should list the whole catalog rather than keyword-search it.
 *
 * @example
 * isBrowseAllCatalogRequest('All available products in ShopMate in a table')
 * // true
 */
export function isBrowseAllCatalogRequest(query: string): boolean {
  // 1. Normalize so punctuation and case do not hide browse-all wording.
  const normalized = query.trim().toLowerCase();

  // 2. Match full-catalog phrasing without treating "table" as a product term.
  return (
    /\b(all|every|entire|full)\b[\s\w]{0,40}\b(products?|catalog|inventory|items?)\b/i.test(normalized)
    || /\b(all available products|entire catalog|whole catalog|everything in (the )?store)\b/i.test(normalized)
  );
}
