/**
 * @file features/shop-assistant/transform/catalog/product-catalog-document.ts
 * Pure markdown mapping for catalog products used by shop text artifacts.
 * Used in: server/render/store-output.ts for catalog + document.
 * Used for: Filling a buying-guide artifact from lookup rows, not invented SKUs.
 *
 * Function Index:
 * toProductCatalogDocument: Convert catalog products into markdown.
 *
 * Steps:
 * 1. Write a title and a count line from real rows only.
 * 2. Map each product onto name, price, rating, colors, features, and descriptions.
 * 3. Note that no extra products were invented.
 */

import type { Product } from '@/features/catalog/model/product';

/**
 * Convert catalog products into markdown for a text artifact.
 *
 * @example
 * toProductCatalogDocument([{ name: 'iPhone 15 Pro Max', price: 1199, ... }], 'ShopMate smartphones')
 */
export function toProductCatalogDocument(
  products: Product[],
  title = 'ShopMate products',
): string {
  // 1. Title + count come from lookup, not from the model.
  const lines = [
    `# ${title}`,
    '',
    products.length === 1
      ? 'This guide uses 1 product currently in the ShopMate catalog.'
      : `This guide uses ${products.length} products currently in the ShopMate catalog.`,
    '',
  ];

  // 2. One section per real row. Do not invent extra SKUs or prices.
  for (const product of products) {
    lines.push(`## ${product.name}`);
    lines.push('');
    lines.push(`- Category: ${product.category}`);
    lines.push(`- Price: $${product.price}`);
    lines.push(`- Rating: ${product.rating} (${product.reviewsCount} reviews)`);
    if (product.colors.length > 0) {
      lines.push(`- Colors: ${product.colors.join(', ')}`);
    }
    if (product.features.length > 0) {
      lines.push(`- Features: ${product.features.join(', ')}`);
    }
    lines.push('');
    if (product.shortDescription) {
      lines.push(product.shortDescription);
    }
    if (product.description && product.description !== product.shortDescription) {
      lines.push('');
      lines.push(product.description);
    }
    lines.push('');
  }

  // 3. Make the source explicit so a later speaker does not add fake products.
  lines.push('_All prices and specs come from the ShopMate catalog. No additional products were invented._');
  return `${lines.join('\n').trim()}\n`;
}
