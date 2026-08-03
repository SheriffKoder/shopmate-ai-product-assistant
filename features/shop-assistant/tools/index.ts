/**
 * @file features/shop-assistant/tools/index.ts
 * Shop Assistant Tools Index
 *
 * Purpose: Central export point for ShopMate assistant tool factories.
 * Used in: features/shop-assistant/server/agents.
 * Used for: Keeping product/cart tool registration adapter-owned.
 *
 * Function Index:
 * createProductSearchTool: Creates the ShopMate product search AI tool.
 * createCartInfoTool: Creates the ShopMate cart information AI tool.
 *
 * Steps:
 * 1. Export tool factories from adapter-owned tool modules.
 * 2. Let ShopMate agents register these tools with model streams.
 */

export { createProductSearchTool } from './product-search/product-search-tool';
export { createCartInfoTool } from './cart-info/cart-info-tool';
