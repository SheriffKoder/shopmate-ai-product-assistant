/**
 * @file features/ai-assistant/server/assistant-model-provider.ts
 * Assistant Model Provider
 *
 * Purpose: Converts configured assistant model ids into AI SDK provider model instances.
 * Used in: business assistant runtimes and artifact server tools.
 * Used for: Isolating OpenAI-specific model construction from agent logic.
 *
 * Function Index:
 * getAssistantModels: Resolves chat and search provider models for one assistant request.
 *
 * Steps:
 * 1. Read the reusable model registry.
 * 2. Validate the selected chat model id against the allowed list.
 * 3. Construct OpenAI provider model instances for chat and search calls.
 */

import { openai } from '@ai-sdk/openai';
import {
  getAssistantModelConfig,
  resolveAssistantModelId,
} from '../model/assistant-model-config';

export interface AssistantResolvedModels {
  /** Validated chat model id selected by the user or defaulted by config. */
  chatModelId: string;
  /** Configured search/ranking model id. */
  searchModelId: string;
  /** AI SDK model instance for main assistant responses and classifiers. */
  chat: ReturnType<typeof openai>;
  /** AI SDK model instance for search and ranking helpers. */
  search: ReturnType<typeof openai>;
}

/**
 * Resolve configured OpenAI model instances for the assistant runtime.
 *
 * @param selectedModelId - Optional user-selected model id from the request body.
 * @returns Provider-ready chat and search model instances.
 */
export function getAssistantModels(selectedModelId?: string): AssistantResolvedModels {
  // 1. Read model env once per request so runtime work shares one decision.
  const config = getAssistantModelConfig();

  // 2. Validate selected model ids before provider construction.
  const chatModelId = resolveAssistantModelId(selectedModelId, config);

  // 3. Build provider instances behind this helper to keep agents provider-light.
  return {
    chatModelId,
    searchModelId: config.searchModelId,
    chat: openai(chatModelId),
    search: openai(config.searchModelId),
  };
}
