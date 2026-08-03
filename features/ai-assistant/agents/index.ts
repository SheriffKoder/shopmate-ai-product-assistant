/**
 * @file features/ai-assistant/agents/index.ts
 * Agents Compatibility Export
 *
 * Purpose: Preserves the old assistant agent import path during the ShopMate adapter migration.
 * Used in: Temporary compatibility imports only.
 * Used for: Forwarding business-specific agents to features/shop-assistant/server/agents.
 *
 * Function Index:
 * exports: Re-exports ShopMate adapter agents.
 *
 * Steps:
 * 1. Forward old imports to the new adapter-owned agents.
 * 2. Remove this file in migration phase 08 after all imports move.
 */

export * from '@/features/shop-assistant/server/agents';
