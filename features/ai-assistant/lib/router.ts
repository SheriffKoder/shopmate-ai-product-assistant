/**
 * @file features/ai-assistant/lib/router.ts
 * Router Compatibility Export
 *
 * Purpose: Preserves the old assistant router import path during the ShopMate adapter migration.
 * Used in: Temporary compatibility imports only.
 * Used for: Forwarding business-specific routing to features/shop-assistant/server/router.
 *
 * Function Index:
 * exports: Re-exports the ShopMate adapter router.
 *
 * Steps:
 * 1. Forward old imports to the adapter-owned router.
 * 2. Remove this file in migration phase 08 after all imports move.
 */

export * from '@/features/shop-assistant/server/router';
