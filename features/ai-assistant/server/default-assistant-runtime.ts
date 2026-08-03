/**
 * @file features/ai-assistant/server/default-assistant-runtime.ts
 * Default Runtime Compatibility Export
 *
 * Purpose: Preserves the old runtime import path during the staged ShopMate adapter migration.
 * Used in: Temporary compatibility imports only.
 * Used for: Forwarding to the ShopMate runtime until cleanup removes this shim.
 *
 * Function Index:
 * defaultAssistantRuntime: Backward-compatible alias for shopAssistantRuntime.
 *
 * Steps:
 * 1. Import the runtime from the ShopMate adapter package.
 * 2. Re-export it under the previous assistant-core name.
 * 3. Remove this file in the cleanup phase after all callers use the adapter path.
 */

import { shopAssistantRuntime } from '@/features/shop-assistant/server/shop-assistant-runtime';

export const defaultAssistantRuntime = shopAssistantRuntime;
