/**
 * @file features/ai-assistant/components/message-list.tsx
 * Renders the conversation message list for the assistant shell.
 * Used in: chat-container.tsx.
 * Used for: Mounting thinking steps, text, tools, and adapter stream-part UI.
 *
 * Steps:
 * 1. Prefer live assistantSteps for the in-flight last message; else persisted snapshot.
 * 2. Hide internal parts (thinking-steps snapshot, deltas).
 * 3. Display conversation metadata (data-uiMetadata) after text on the same message.
 * 4. Forward sendMessage into MessagePartRenderer so stream-part UI can start a new turn.
 */

'use client';

import {
  Message,
  MessageContent,
  MessageActions,
  MessageAction,
} from '@/features/ai-assistant/components/generic/ai-elements/message';
import { CopyIcon, RefreshCcwIcon } from 'lucide-react';
import { ItemTypeCard } from './ui/item-type-card';
import { MessagePartRenderer } from './message-part-orchestrator-renderer';
import type { AssistantStreamPartRendererRegistry } from '../model/stream-part-renderer-registry';
import type { AssistantToolRendererRegistry } from '../model/tool-renderer-registry';
import type { AssistantStepEvent } from '../model/assistant-events';
import { orderMessagePartsForDisplay } from '../lib/order-message-parts-for-display';
import {
  THINKING_STEPS_PART_TYPE,
  getThinkingStepsPart,
} from '../lib/thinking-steps-part';
import { ThinkingSteps } from './thinking-steps/thinking-steps';
import { useAssistantStyleConfig } from '../providers/assistant-style-context';

interface MessageListProps {
  messages: any[];
  clickedSuggestionCard: any;
  sendMessage: (message: { text: string }, options?: { body: any }) => void;
  regenerate?: (options?: { messageId?: string }) => void;
  status?: 'idle' | 'streaming' | 'submitted' | 'error' | 'ready';
  toolRenderers?: AssistantToolRendererRegistry;
  streamPartRenderers?: AssistantStreamPartRendererRegistry;
  toolRendererContext?: unknown;
  assistantSteps?: AssistantStepEvent[];
}

export const MessageList = ({
  messages,
  clickedSuggestionCard,
  sendMessage,
  regenerate,
  status,
  toolRenderers,
  streamPartRenderers,
  toolRendererContext,
  assistantSteps = [],
}: MessageListProps) => {
  const styles = useAssistantStyleConfig();
  return (
    <>
      {messages.map((message) => {
        // Persisted snapshot from data-assistant-thinking-steps (refresh / history).
        const persistedThinkingPart = message.parts?.find(
          (part: { type?: string }) => part.type === THINKING_STEPS_PART_TYPE,
        );
        const persistedThinkingSteps = getThinkingStepsPart(persistedThinkingPart) ?? [];
        
        // Check if this is a user message that starts with "@" - don't display it
        // We added @ in the discussion card to not show the user message, so we don't need to display it here.
        if (message.role === 'user') {
          const textParts = message.parts?.filter((p: any) => p.type === 'text') || [];
          const firstTextPart = textParts[0];
          if (firstTextPart?.text?.trim().startsWith('@')) {
            return null; // Don't render messages starting with "@"
          }
        }
        
        return (
        <Message 
          key={message.id} 
          from={message.role}
          className='min-w-full'
        >
          <MessageContent 
            className={
              message.role === 'assistant' 
              ? `${styles.messages?.assistantClassName ?? ''} ${styles.messages?.contentClassName ?? ''}`
              : `${styles.messages?.userClassName ?? ''} ${styles.messages?.contentClassName ?? ''}`
            }
          >
            {message.role === 'assistant' && (
              <ThinkingSteps
                steps={
                  message.id === messages.at(-1)?.id && assistantSteps.length > 0
                    ? assistantSteps
                    : persistedThinkingSteps
                }
              />
            )}
            {orderMessagePartsForDisplay(message.parts).map(({ part, index: i }) => {
              // Filter out internal AI SDK parts that shouldn't be displayed
              // These include: step-finish, text-delta
              // Note: tool-call and tool-result for createDocument are handled in MessagePartRenderer
              // Note: persisted data-artifactContent also mounts DocumentPreview in MessagePartRenderer
              // Note: adapter data-* parts (cards, cart, uiMetadata) mount via streamPartRenderers
              // Note: data-uiMetadata is ordered after text so Find chips sit under the reply
              // Note: reasoning and step-start are now displayed
              const internalPartTypes = ['step-finish', 'text-delta', THINKING_STEPS_PART_TYPE];
              if (internalPartTypes.includes(part.type)) {
                return null;
              }

              // TEXT PART:
              if (part.type === 'text') {
                // If this is a user message and matches the clicked suggestion card, render the card instead
                if (message.role === 'user' && clickedSuggestionCard && part.text === clickedSuggestionCard.header) {
                  return (
                    <ItemTypeCard 
                      key={`${message.id}-${i}`}
                      card={clickedSuggestionCard} 
                      isMessage={true}
                    />
                  );
                }

                // Render text part using MessagePartRenderer
                return (
                  <MessagePartRenderer
                    key={`${message.id}-${i}`}
                    part={part}
                    messageId={message.id}
                    partIndex={i}
                    sendMessage={sendMessage}
                    status={status}
                    isLastPart={i === message.parts.length - 1}
                    isLastMessage={message.id === messages.at(-1)?.id}
                    toolRenderers={toolRenderers}
                    streamPartRenderers={streamPartRenderers}
                    toolRendererContext={toolRendererContext}
                    messageParts={message.parts}
                  />
                );
              }
              
              // ALL OTHER PARTS (reasoning, step-start, tools, artifact content, data parts, etc.):
              return (
                <MessagePartRenderer
                  key={`${message.id}-${i}`}
                  part={part}
                  messageId={message.id}
                  partIndex={i}
                  sendMessage={sendMessage}
                  status={status}
                  isLastPart={i === message.parts.length - 1}
                  isLastMessage={message.id === messages.at(-1)?.id}
                  toolRenderers={toolRenderers}
                  streamPartRenderers={streamPartRenderers}
                  toolRendererContext={toolRendererContext}
                  messageParts={message.parts}
                />
              );
            })}
          </MessageContent>
          
          {/* Message Actions: Copy and Regenerate */}
          {message.role === 'assistant' && (
            <MessageActions>
              <MessageAction
                label="Copy"
                onClick={() => {
                  const text = message.parts
                    .filter((p: any) => p.type === 'text')
                    .map((p: any) => p.text)
                    .join('\n');
                  navigator.clipboard.writeText(text);
                }}
              >
                <CopyIcon className="size-3 text-primary" />
              </MessageAction>
              {regenerate && (
                <MessageAction
                  label="Regenerate"
                  onClick={() => regenerate({ messageId: message.id })}
                >
                  <RefreshCcwIcon className="size-3 text-primary" />
                </MessageAction>
              )}
            </MessageActions>
          )}
        </Message>
      )})}
    </>
  );
};
