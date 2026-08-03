/**
 * @file features/ai-assistant/tools/product-search/product-search-tool.ts
 * Product Search Tool Compatibility Export
 *
 * Purpose: Preserves the old product search tool path during the ShopMate adapter migration.
 * Used in: Temporary compatibility imports only.
 * Used for: Forwarding to the adapter-owned ShopMate product search tool.
 *
 * Function Index:
 * exports: Re-exports createProductSearchTool.
 *
 * Steps:
 * 1. Forward old imports to features/shop-assistant/tools/product-search.
 * 2. Remove this file in migration phase 08.
 */

export * from '@/features/shop-assistant/tools/product-search/product-search-tool';
