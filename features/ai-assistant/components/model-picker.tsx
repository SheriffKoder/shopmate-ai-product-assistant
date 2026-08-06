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
 * 2. Display allowed model options in a visible Radix select.
 * 3. Notify the parent hook when the user picks a model.
 */

'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

  const selectedModel = modelOptions.find(function findSelectedModel(modelOption) {
    return modelOption.id === selectedModelId;
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Assistant model"
          className="h-9 min-w-[8.75rem] max-w-[10.5rem] shrink-0 rounded-md bg-background px-3 text-left font-button text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          type="button"
        >
          {selectedModel?.label ?? 'Model'}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[200] min-w-[10.5rem] rounded-md bg-foreground p-1 text-background">
        {modelOptions.map(function renderModelOption(modelOption) {
          return (
            <DropdownMenuItem
              className="rounded-md font-button text-xs text-background focus:bg-primary focus:text-foreground"
              key={modelOption.id}
              onSelect={function selectModel() { onModelChange(modelOption.id); }}
            >
              {modelOption.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
