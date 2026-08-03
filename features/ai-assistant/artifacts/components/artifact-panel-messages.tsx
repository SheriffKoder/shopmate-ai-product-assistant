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
import { shopAssistantToolRenderers } from '@/features/shop-assistant/ui/tool-renderer-registry';

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
}: ArtifactMessagesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const toolRendererContext = {
    cart,
    dispatchCartAction,
  };

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
          toolRenderers={shopAssistantToolRenderers}
          toolRendererContext={toolRendererContext}
        />
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 border-t bg-background">
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
                  },
                }
              );
              setInput('');
            }
          }}
          status={status}
        />
      </div>
    </div>
  );
}
