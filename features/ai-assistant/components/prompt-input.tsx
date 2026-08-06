/**
 * Prompt Input Component
 * 
 * Purpose: Displays the input area for user messages
 * Used in: calendar-chat.tsx
 * Why: Separates input UI from main component
 */

'use client';

import { Input } from '@/components/ui/input';
import { ChevronRightIcon, Loader2, Mic, MicOff, Square, StopCircleIcon } from 'lucide-react';
import { ModelPicker } from './model-picker';
import type { AssistantModelOption } from '../model/assistant-model-config';
import { useDictation } from '../dictation/hooks/use-dictation';
import type { AssistantDictationConfig } from '../dictation/model/dictation-config';

interface PromptInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: () => void;
  status: 'idle' | 'streaming' | 'submitted' | 'error' | 'ready';
  selectedModelId: string;
  modelOptions: AssistantModelOption[];
  onModelChange: (modelId: string) => void;
  dictationConfig: AssistantDictationConfig;
}

export const PromptInput = ({
  input,
  setInput,
  handleSubmit,
  status,
  selectedModelId,
  modelOptions,
  onModelChange,
  dictationConfig,
}: PromptInputProps) => {
  // Dictation integration: keeps speech-to-text isolated while feeding text into the controlled prompt.
  const dictation = useDictation(dictationConfig, {
    input,
    setInput,
    handleSubmit,
  });

  return (
    <div className="flex items-center gap-1 border-2 m-2 rounded-lg p-1 border-[#dbdbdb] flex-shrink-0">
      {/* Input: the input area for the user to enter their message */}
      {/* Dictation integration: advertise the microphone interaction only when the feature is enabled. */}
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder={
          dictationConfig.enabled
            ? 'Ask about any product, or use the mic button (say stop to end)'
            : 'Ask about any product...'
        }
        disabled={status === 'streaming'}
        className="flex-1 border-none bg-white/10 focus:bg-white/15 focus-visible:ring-[0px] transition-all duration-300 text-black"
      />

      {dictationConfig.enabled && (
        <div className="flex items-center gap-1 text-foreground bg-foreground/10 rounded-md">
          <button
            type="button"
            onClick={dictation.isListening ? dictation.stop : dictation.start}
            disabled={status === 'streaming' || dictation.isTranscribing}
            aria-label={dictation.isListening ? 'Stop dictation' : 'Start dictation'}
            aria-pressed={dictation.isListening}
            title={dictation.error ?? undefined}
            className="p-2 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {dictation.isListening ? (
              <Square className="h-4 w-4 stroke-red-500" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>
          <span className="sr-only" aria-live="polite">
            {dictation.error ??
              (dictation.isListening ? 'Dictation is listening' : '')}
          </span>
        </div>
      )}

      {/* Model Picker: lets the user switch configured assistant models for the next request */}
      <ModelPicker
        selectedModelId={selectedModelId}
        modelOptions={modelOptions}
        onModelChange={onModelChange}
        disabled={status === 'streaming' || status === 'submitted'}
        triggerClassName="rounded-md h-8"
      />

      {/* Submit Button: To submit the user's message */}
      <button
        onClick={handleSubmit}
        disabled={status === 'streaming' || !input.trim()}
        className="p-2 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center
        bg-foreground hover:opacity-90 cursor-pointer transition-all duration-300 text-background"
      >
        {status === 'streaming' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ChevronRightIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  );
};
