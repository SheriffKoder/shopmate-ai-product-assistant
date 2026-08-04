/**
 * @file features/shop-assistant/ui/shop-assistant-config.tsx
 * ShopMate assistant configuration: assembles business-owned presentation and behavior.
 * Used in: ShopAssistantIntegration.
 * Used for: Injecting ShopMate capabilities into the generic assistant shell.
 */

'use client';

import type { AssistantConfig } from '@/features/ai-assistant/model/assistant-config';
import { shopAssistantToolRenderers } from './tool-renderer-registry';
import { introSuggestions } from '../config/shop-assistant-suggestions';

/** Returns the complete ShopMate adapter configuration. */
export function createShopAssistantConfig(): Pick<
  AssistantConfig,
  'endpoint' | 'runtime' | 'toolRenderers' | 'suggestions'
> {
  return {
    endpoint: '/api/ai-assistant',
    toolRenderers: shopAssistantToolRenderers,
    suggestions: introSuggestions,
  };
}
