/**
 * @file features/ai-assistant/utils/search-utils.ts
 * Search Utils Compatibility Export
 *
 * Purpose: Preserves the old assistant search helper path during the ShopMate adapter migration.
 * Used in: Temporary compatibility imports only.
 * Used for: Forwarding product/cart search helpers to the ShopMate assistant adapter.
 *
 * Function Index:
 * exports: Re-exports searchInTarget and searchInProduct.
 *
 * Steps:
 * 1. Forward old imports to features/shop-assistant/lib.
 * 2. Remove this file in migration phase 08 after callers move.
 */

export * from '@/features/shop-assistant/lib/search-utils';
