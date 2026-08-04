/**
 * @file features/ai-assistant/hooks/use-assistant-model-selection.ts
 * Assistant Model Selection Hook
 *
 * Purpose: Keeps model picker state reusable and persisted for the current browser.
 * Used in: features/ai-assistant/chat-container.tsx.
 * Used for: Letting users switch allowed assistant models without coupling state to ShopMate.
 *
 * Function Index:
 * useAssistantModelSelection: Returns selected model state and allowed model options.
 *
 * Steps:
 * 1. Load allowed model options from the reusable assistant config.
 * 2. Restore a previous browser selection when it is still allowed.
 * 3. Persist future selections to localStorage.
 * 4. Fall back to the configured default model when no valid selection exists.
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  getAssistantModelConfig,
  resolveAssistantModelId,
  type AssistantModelOption,
} from '../model/assistant-model-config';

const ASSISTANT_MODEL_STORAGE_KEY = 'shopmate:assistant-model-id';

interface AssistantModelSelection {
  /** Currently selected and validated model id. */
  selectedModelId: string;
  /** Allowed model options displayed in the picker. */
  modelOptions: AssistantModelOption[];
  /** Update handler passed to model picker controls. */
  setSelectedModelId: (modelId: string) => void;
}

/**
 * Manage assistant model selection for client chat submissions.
 *
 * @returns Current model id, allowed model options, and a setter.
 */
export function useAssistantModelSelection(): AssistantModelSelection {
  // 1. Compute config once for this browser render; env-backed values are build-time constants client-side.
  const modelConfig = useMemo(() => getAssistantModelConfig(), []);

  // 2. Start with the configured default so SSR/hydration has a stable value.
  const [selectedModelId, setSelectedModelIdState] = useState(modelConfig.defaultModelId);

  // 3. Restore persisted selection only when it still exists in the allowed registry.
  useEffect(function restoreAssistantModelSelection() {
    const storedModelId = window.localStorage.getItem(ASSISTANT_MODEL_STORAGE_KEY) || undefined;
    setSelectedModelIdState(resolveAssistantModelId(storedModelId, modelConfig));
  }, [modelConfig]);

  /**
   * Persist and apply a user-selected model id.
   *
   * @param modelId - Candidate model id chosen from the picker.
   */
  function setSelectedModelId(modelId: string) {
    // 1. Validate the selected model against the allowed registry.
    const resolvedModelId = resolveAssistantModelId(modelId, modelConfig);

    // 2. Persist only validated ids so stale env values do not survive forever.
    window.localStorage.setItem(ASSISTANT_MODEL_STORAGE_KEY, resolvedModelId);

    // 3. Update local UI state after persistence succeeds.
    setSelectedModelIdState(resolvedModelId);
  }

  return {
    selectedModelId,
    modelOptions: modelConfig.options,
    setSelectedModelId,
  };
}
