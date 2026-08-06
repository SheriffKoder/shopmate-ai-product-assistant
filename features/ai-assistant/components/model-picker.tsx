/**
 * @file features/ai-assistant/components/model-picker.tsx
 * Assistant Model Picker
 *
 * Purpose: Compact model selection control for the reusable assistant prompt input.
 * Used in: features/ai-assistant/components/prompt-input.tsx.
 * Used for: Letting users switch between configured assistant models beside the input.
 *
 * Function Index:
 * ModelPicker: Keyboard-accessible custom dropdown for allowed assistant models.
 *
 * Steps:
 * 1. Render nothing when only one model is configured.
 * 2. Display allowed model options in a custom dropdown that always opens upward.
 * 3. Notify the parent hook when the user picks a model.
 */

'use client';

import { CustomDropdown } from '@/shared/ui/custom-dropdown';
import type { AssistantModelOption } from '../model/assistant-model-config';

interface ModelPickerProps {
  /** Current model id included in assistant submissions. */
  selectedModelId: string;
  /** Allowed model options from assistant config. */
  modelOptions: AssistantModelOption[];
  /** Called after the user chooses a model. */
  onModelChange: (modelId: string) => void;
  /** Whether the picker should be disabled during active generation. */
  disabled?: boolean;
  /** Class name for the trigger button. */
  triggerClassName?: string;
}

/**
 * Render the compact assistant model picker.
 */
export function ModelPicker({
  selectedModelId,
  modelOptions,
  onModelChange,
  disabled = false,
  triggerClassName = '',
}: ModelPickerProps) {
  // 1. Hide the control when there is nothing meaningful to switch.
  if (modelOptions.length <= 1) {
    return null;
  }

  const modelItems = modelOptions.map(function mapModelOption(modelOption) {
    return {
      id: modelOption.id,
      label: modelOption.label,
    };
  });

  return (
    <CustomDropdown
      triggerClassName={triggerClassName}
      ariaLabel="Assistant model"
      direction="up"
      disabled={disabled}
      items={modelItems}
      onItemSelect={onModelChange}
      placeholder="Model"
      selectedItemId={selectedModelId}
    />
  );
}
