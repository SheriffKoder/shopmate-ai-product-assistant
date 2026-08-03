/**
 * @file features/ai-assistant/config/system-prompt.ts
 * System Prompt Compatibility Export
 *
 * Purpose: Preserves the old assistant prompt import path during the ShopMate adapter migration.
 * Used in: Temporary compatibility imports only.
 * Used for: Forwarding electronics-specific prompt helpers to the ShopMate adapter.
 *
 * Function Index:
 * exports: Re-exports ShopMate system prompt helpers.
 *
 * Steps:
 * 1. Forward old imports to the adapter-owned prompt file.
 * 2. Remove this file in migration phase 08 after all imports move.
 */

export * from '@/features/shop-assistant/server/system-prompt';
