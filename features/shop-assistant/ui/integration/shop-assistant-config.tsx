/**
 * @file features/shop-assistant/ui/integration/shop-assistant-config.tsx
 * Shop Assistant configuration: endpoint, stream-part renderers, suggestions.
 * Used in: ui/integration/shop-assistant-integration.tsx.
 * Used for: Injecting ShopMate UI into the generic assistant shell without AI tools.
 *
 * Function Index:
 * createShopAssistantConfig: Adapter presentation config for ChatWrapper.
 */

'use client';

import type { AssistantConfig } from '@/features/ai-assistant/model/assistant-config';
import { shopAssistantStreamPartRenderers } from './stream-part-registry';
import { introSuggestions } from '../../config/shop-assistant-suggestions';

/**
 * Return ShopMate adapter presentation config. Runtime injection stays on the API route.
 *
 * @example
 * createShopAssistantConfig().streamPartRenderers
 */
export function createShopAssistantConfig(): Pick<
  AssistantConfig,
  'endpoint' | 'runtime' | 'streamPartRenderers' | 'suggestions'
> {
  return {
    endpoint: '/api/ai-assistant',
    streamPartRenderers: shopAssistantStreamPartRenderers,
    suggestions: introSuggestions,
  };
}
