/**
 * @file features/shop-assistant/transform/catalog/product-catalog-csv.ts
 * Pure CSV mapping for catalog products used by shop table artifacts.
 * Used in: server/render/store-output.ts after catalog lookup.
 * Used for: Building spreadsheet rows from real catalog results, not model-invented data.
 *
 * Function Index:
 * escapeCsvCell: Quote a CSV cell when it contains reserved characters.
 * toProductCatalogCsv: Convert catalog products into CSV for a sheet artifact.
 *
 * Steps:
 * 1. Escape cells that contain commas, quotes, or newlines.
 * 2. Map each product onto a stable column order.
 * 3. Join header + rows with newlines.
 */

import type { Product } from '@/features/catalog/model/product';

/** Quote a CSV cell when it contains reserved characters. */
function escapeCsvCell(value: string): string {
  // Keep simple values unquoted so the sheet stays easy to scan.
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Convert catalog products into CSV for a sheet artifact.
 *
 * @example
 * toProductCatalogCsv([{ name: 'iPhone 15', category: 'smartphone', price: 999, ... }])
 * // "Name,Category,Price,...\\niPhone 15,smartphone,999,..."
 */
export function toProductCatalogCsv(products: Product[]): string {
  // 1. Use a stable column order so every shop table artifact looks the same.
  const headers = ['Name', 'Category', 'Price', 'Rating', 'Reviews', 'Colors', 'Short Description'];

  // 2. Map only real catalog fields. Do not invent extra columns or values.
  const rows = products.map((product) => [
    product.name,
    product.category,
    String(product.price),
    String(product.rating),
    String(product.reviewsCount),
    product.colors.join('; '),
    product.shortDescription,
  ].map(escapeCsvCell).join(','));

  // 3. Return a complete CSV document for the sheet handler.
  return [headers.join(','), ...rows].join('\n');
}
