/**
 * @file features/ai-assistant/utils/ai-search-agent.ts
 * AI Search Agent Compatibility Export
 *
 * Purpose: Preserves the old assistant AI search helper path during the ShopMate adapter migration.
 * Used in: Temporary compatibility imports only.
 * Used for: Forwarding AI-powered ranking to the ShopMate assistant adapter.
 *
 * Function Index:
 * exports: Re-exports analyzeItemsWithAI.
 *
 * Steps:
 * 1. Forward old imports to features/shop-assistant/lib.
 * 2. Remove this file in migration phase 08 after callers move.
 */

export * from '@/features/shop-assistant/lib/ai-search-agent';
