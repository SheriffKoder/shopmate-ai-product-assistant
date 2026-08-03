/**
 * @file features/ai-assistant/tools/cart-info/cart-info-tool.ts
 * Cart Info Tool Compatibility Export
 *
 * Purpose: Preserves the old cart info tool path during the ShopMate adapter migration.
 * Used in: Temporary compatibility imports only.
 * Used for: Forwarding to the adapter-owned ShopMate cart info tool.
 *
 * Function Index:
 * exports: Re-exports createCartInfoTool.
 *
 * Steps:
 * 1. Forward old imports to features/shop-assistant/tools/cart-info.
 * 2. Remove this file in migration phase 08.
 */

export * from '@/features/shop-assistant/tools/cart-info/cart-info-tool';
