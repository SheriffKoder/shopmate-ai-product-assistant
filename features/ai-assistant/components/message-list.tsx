/**
 * Message List Component
 * 
 * Purpose: Renders the list of messages in the conversation
 * Used in: chat-container.tsx
 * Why: Separates message list rendering from main component and forwards adapter tool rendering.
 */

'use client';

import {
  Message,
  MessageContent,
  MessageActions,
  MessageAction,
} from '@/components/ai-elements/message';
import { CopyIcon, RefreshCcwIcon } from 'lucide-react';
import { ItemTypeCard } from './ui/item-type-card';
import { MessagePartRenderer } from './message-part-orchestrator-renderer';
import type { AssistantToolRendererRegistry } from '../model/tool-renderer-registry';
import type { AssistantStepEvent } from '../model/assistant-events';
import { ThinkingSteps } from './thinking-steps/thinking-steps';

interface MessageListProps {
  messages: any[];
  clickedSuggestionCard: any;
  sendMessage: (message: { text: string }, options?: { body: any }) => void;
  regenerate?: (options?: { messageId?: string }) => void;
  status?: 'idle' | 'streaming' | 'submitted' | 'error' | 'ready';
  toolRenderers?: AssistantToolRendererRegistry;
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
  toolRendererContext,
  assistantSteps = [],
}: MessageListProps) => {
  return (
    <>
      {messages.map((message) => {
        console.log('message', message);
        const persistedThinkingPart = message.parts?.find(
          (part: any) => part.type === 'data-assistant-thinking-steps'
        );
        const persistedThinkingSteps = Array.isArray(persistedThinkingPart?.data)
          ? persistedThinkingPart.data.reduce((steps: any[], step: any) => {
              const existingIndex = steps.findIndex((currentStep) => currentStep.id === step.id);
              if (existingIndex === -1) return [...steps, step];
              return steps.map((currentStep, index) => index === existingIndex ? step : currentStep);
            }, [])
          : [];
        
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
                ? '!bg-[#313131]/0 !text-black rounded-lg px-4 py-3 w-full' // Assistant message background color
                : '!bg-[#dbdbdb] !text-black rounded-lg px-4 py-3 !ml-auto text-right w-fit' // User message background color
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
            {message.parts.map((part: any, i: number) => {
              // Filter out internal AI SDK parts that shouldn't be displayed
              // These include: step-finish, text-delta
              // Note: tool-call and tool-result for createDocument are handled in MessagePartRenderer
              // Note: reasoning and step-start are now displayed
              const internalPartTypes = ['step-finish', 'text-delta', 'data-assistant-thinking-steps'];
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
                    toolRendererContext={toolRendererContext}
                  />
                );
              }
              
              // ALL OTHER PARTS (reasoning, step-start, tools, etc.):
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
                  toolRendererContext={toolRendererContext}
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
