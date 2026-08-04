/**
 * @file features/ai-assistant/integration/assistant-integration-config.ts
 * Assistant Integration Configuration Examples
 *
 * Purpose: Provides explicit generic and business-adapter configuration factories.
 * Used in: Application-level assistant integration during the version-2 migration.
 * Used for: Demonstrating that business behavior is injected and optional.
 */

import type { AssistantConfig } from '../model/assistant-config';
import { assistantApiEndpoints } from '../model/api-endpoints';

/** Build a generic assistant configuration with no business runtime or tools. */
export function createGenericAssistantConfig(): AssistantConfig {
  return {
    endpoint: assistantApiEndpoints.assistant,
    apiEndpoints: assistantApiEndpoints,
  };
}

/** Build a ShopMate configuration by injecting business-owned capabilities. */
export function createShopAssistantConfig(
  config: Pick<AssistantConfig, 'currentUser' | 'runtime' | 'toolRenderers' | 'emptyState' | 'suggestions' | 'callbacks'>
): AssistantConfig {
  return {
    endpoint: assistantApiEndpoints.assistant,
    apiEndpoints: assistantApiEndpoints,
    ...config,
  };
}
