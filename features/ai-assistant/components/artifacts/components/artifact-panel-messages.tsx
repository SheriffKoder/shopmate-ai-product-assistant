/**
 * Artifact Messages Component
 * 
 * Purpose: Displays chat messages on the left side when artifact is open
 * Used in: ArtifactPanel component
 * Why: Shows chat messages in split-screen layout
 */

'use client';

import { useRef } from 'react';
import { MessageList } from '@/features/ai-assistant/components/message-list';
import { PromptInput } from '@/features/ai-assistant/components/prompt-input';
import { useAssistantModelSelection } from '@/features/ai-assistant/hooks/use-assistant-model-selection';
import type { AssistantToolRendererRegistry } from '@/features/ai-assistant/model/tool-renderer-registry';
import { getDictationConfig } from '@/features/ai-assistant/dictation/model/dictation-config';
import { useAssistantStyleConfig } from '@/features/ai-assistant/providers/assistant-style-context';

interface ArtifactMessagesProps {
  chatId: string;
  messages: any[];
  status: 'idle' | 'streaming' | 'submitted' | 'error' | 'ready';
  input: string;
  setInput: (input: string) => void;
  sendMessage: (message: { text: string }, options?: { body: any }) => void;
  regenerate?: () => void;
  cart?: any;
  dispatchCartAction?: any;
  toolRenderers?: AssistantToolRendererRegistry;
  toolRendererContext?: unknown;
}

/**
 * Artifact Messages Component
 * 
 * Displays chat messages and input in the left panel when artifact is visible
 */
export function ArtifactMessages({
  chatId,
  messages,
  status,
  input,
  setInput,
  sendMessage,
  regenerate,
  cart,
  dispatchCartAction,
  toolRenderers,
  toolRendererContext,
}: ArtifactMessagesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fallbackToolRendererContext = {
    cart,
    dispatchCartAction,
  };
  const { selectedModelId, modelOptions, setSelectedModelId } = useAssistantModelSelection();
  const styles = useAssistantStyleConfig();

  // Dictation integration: reuses the isolated browser provider in the artifact prompt surface.
  const dictationConfig = getDictationConfig();

  return (
    <div
      className="flex h-full flex-col"
      ref={containerRef}
    >
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto">
        <MessageList
          messages={messages}
          clickedSuggestionCard={null}
          sendMessage={sendMessage}
          regenerate={regenerate}
          status={status}
          toolRenderers={toolRenderers}
          toolRendererContext={toolRendererContext ?? fallbackToolRendererContext}
        />
      </div>

      {/* Input Area */}
      <div className={styles.artifacts?.panelInputClassName}>
        <PromptInput
          input={input}
          setInput={setInput}
          handleSubmit={() => {
            if (input.trim()) {
              sendMessage(
                { text: input },
                {
                  body: {
                    products: [],
                    cart: cart,
                    modelId: selectedModelId,
                  },
                }
              );
              setInput('');
            }
          }}
          status={status}
          selectedModelId={selectedModelId}
          modelOptions={modelOptions}
          onModelChange={setSelectedModelId}
          dictationConfig={dictationConfig}
        />
      </div>
    </div>
  );
}
