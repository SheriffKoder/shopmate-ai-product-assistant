/**
 * @file features/ai-assistant/tools/index.ts
 * Tools Compatibility Export
 *
 * Purpose: Preserves the old assistant tools import path during the ShopMate adapter migration.
 * Used in: Temporary compatibility imports only.
 * Used for: Forwarding product/cart tool factories to features/shop-assistant/tools.
 *
 * Function Index:
 * exports: Re-exports ShopMate adapter tool factories.
 *
 * Steps:
 * 1. Forward old imports to the adapter-owned tools.
 * 2. Remove this file in migration phase 08 after all imports move.
 */

export * from '@/features/shop-assistant/tools';
