/**
 * @file features/ai-assistant/components/model-picker.tsx
 * Assistant Model Picker
 *
 * Purpose: Compact model selection control for the reusable assistant prompt input.
 * Used in: features/ai-assistant/components/prompt-input.tsx.
 * Used for: Letting users switch between configured assistant models beside the input.
 *
 * Function Index:
 * ModelPicker: Keyboard-accessible select control for allowed assistant models.
 *
 * Steps:
 * 1. Render nothing when only one model is configured.
 * 2. Display allowed model options in a Radix select.
 * 3. Notify the parent hook when the user picks a model.
 */

'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
}

/**
 * Render the compact assistant model picker.
 */
export function ModelPicker({
  selectedModelId,
  modelOptions,
  onModelChange,
  disabled = false,
}: ModelPickerProps) {
  // 1. Hide the control when there is nothing meaningful to switch.
  if (modelOptions.length <= 1) {
    return null;
  }

  return (
    <Select value={selectedModelId} onValueChange={onModelChange} disabled={disabled}>
      <SelectTrigger
        aria-label="Assistant model"
        size="sm"
        className="h-8 max-w-[9.5rem] border-transparent bg-muted/60 px-2 text-xs text-muted-foreground shadow-none hover:bg-muted focus-visible:ring-2"
      >
        <SelectValue placeholder="Model" />
      </SelectTrigger>
      <SelectContent align="end">
        {modelOptions.map((modelOption) => (
          <SelectItem key={modelOption.id} value={modelOption.id}>
            {modelOption.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
