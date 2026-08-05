/**
 * @file features/ai-assistant/model/assistant-model-config.ts
 * Assistant Model Configuration
 *
 * Purpose: Defines reusable assistant model ids, allowed model lists, and client-safe defaults.
 * Used in: assistant request parsing, prompt input model picker, and server model resolution.
 * Used for: Replacing hard-coded model ids with portable env-driven configuration.
 *
 * Function Index:
 * getAssistantModelConfig: Reads environment-backed assistant model configuration.
 * normalizeAllowedModelIds: Parses comma-separated model ids into a stable unique list.
 * resolveAssistantModelId: Returns an allowed selected model id or the configured default.
 *
 * Steps:
 * 1. Read server env values and Next.js-exposed client env values.
 * 2. Normalize allowed model ids into a unique list.
 * 3. Ensure default and search models always have safe development fallbacks.
 * 4. Resolve user-selected model ids against the allowed list before runtime use.
 */

export const ASSISTANT_DEFAULT_MODEL_ID = 'o3-mini';
export const ASSISTANT_SEARCH_MODEL_ID = 'gpt-4o-mini';

export interface AssistantModelOption {
  /** Provider model id sent to the AI provider. */
  id: string;
  /** Compact label displayed in the assistant model picker. */
  label: string;
}

export interface AssistantModelConfig {
  /** Default chat model used when no selected model is sent or allowed. */
  defaultModelId: string;
  /** Smaller or cheaper model used by search/ranking helpers. */
  searchModelId: string;
  /** User-selectable chat models accepted by the assistant request parser. */
  allowedModelIds: string[];
  /** Picker-ready options derived from allowed model ids. */
  options: AssistantModelOption[];
}

/**
 * Convert comma-separated env model ids into a unique ordered list.
 *
 * @param rawValue - Comma-separated model ids from env.
 * @param fallbackModelIds - Safe model ids used when env is absent.
 * @returns Unique model id list with empty entries removed.
 */
export function normalizeAllowedModelIds(
  rawValue: string | undefined,
  fallbackModelIds: string[]
): string[] {
  // 1. Prefer configured env values when present.
  const parsedModelIds = rawValue
    ?.split(',')
    .map((modelId) => modelId.trim())
    .filter(Boolean);

  // 2. Fall back to development-safe defaults when env is empty.
  const modelIds = parsedModelIds && parsedModelIds.length > 0 ? parsedModelIds : fallbackModelIds;

  // 3. Preserve order while removing duplicates.
  return Array.from(new Set(modelIds));
}

/**
 * Build the assistant model configuration from env.
 *
 * @returns Reusable model configuration for both server and client consumers.
 */
export function getAssistantModelConfig(): AssistantModelConfig {
  // 1. Read server env first, then Next.js public env for browser-bundled consumers.
  const defaultModelId =
    process.env.AI_ASSISTANT_DEFAULT_MODEL ||
    process.env.NEXT_PUBLIC_AI_ASSISTANT_DEFAULT_MODEL ||
    ASSISTANT_DEFAULT_MODEL_ID;

  // 2. Keep search model separate so ranking helpers can be tuned independently.
  const searchModelId =
    process.env.AI_ASSISTANT_SEARCH_MODEL ||
    process.env.NEXT_PUBLIC_AI_ASSISTANT_SEARCH_MODEL ||
    ASSISTANT_SEARCH_MODEL_ID;

  // 3. Include default and search fallbacks so development works without env setup.
  const allowedModelIds = normalizeAllowedModelIds(
    process.env.AI_ASSISTANT_ALLOWED_MODELS || process.env.NEXT_PUBLIC_AI_ASSISTANT_ALLOWED_MODELS,
    [defaultModelId, searchModelId]
  );

  // 4. Ensure the configured default remains selectable even if env omitted it.
  const completeAllowedModelIds = Array.from(new Set([defaultModelId, ...allowedModelIds]));

  return {
    defaultModelId,
    searchModelId,
    allowedModelIds: completeAllowedModelIds,
    options: completeAllowedModelIds.map((modelId) => ({
      id: modelId,
      label: modelId,
    })),
  };
}

/**
 * Resolve a user-selected model id to an allowed model id.
 *
 * @param selectedModelId - Optional client-selected model id.
 * @param config - Optional pre-read config to avoid repeated env parsing.
 * @returns Allowed selected id or the configured default model id.
 */
export function resolveAssistantModelId(
  selectedModelId: string | undefined,
  config = getAssistantModelConfig()
): string {
  // 1. Keep unknown or missing values from crossing into provider calls.
  if (!selectedModelId || !config.allowedModelIds.includes(selectedModelId)) {
    return config.defaultModelId;
  }

  // 2. Return the validated selected id for runtime execution.
  return selectedModelId;
}
