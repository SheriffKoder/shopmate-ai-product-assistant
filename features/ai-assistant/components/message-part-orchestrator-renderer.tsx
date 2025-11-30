/**
 * Message Part Renderer
 * 
 * Purpose: Renders individual message parts (text, tools, etc.)
 * Used in: calendar-chat.tsx
 * Why: Centralizes message part rendering logic
 */

'use client';

import { MessageResponse } from '@/components/ai-elements/message';
import { Reasoning, ReasoningTrigger, ReasoningContent } from '@/components/ai-elements/reasoning';
import { ProductSearchToolRenderer } from '../tools/product-search/components/product-search-tool-renderer';
import { CartInfoToolRenderer } from '../tools/cart-info/components/cart-info-tool-renderer';
import { DefaultToolRenderer } from '../tools/default-tool-renderer';
import { MarkdownText } from './ui/markdown-text';
import { DiscussionCard } from './ui/discussion-card';
import { CartState, CartAction } from '@/features/ai-assistant/types/cart';

interface MessagePartRendererProps {
  part: any;
  messageId: string;
  partIndex: number;
  sendMessage: (message: { text: string }, options?: { body: any }) => void;
  status?: 'idle' | 'streaming' | 'submitted' | 'error' | 'ready';
  isLastPart?: boolean;
  isLastMessage?: boolean;
  cart?: CartState;
  dispatchCartAction?: (action: CartAction) => void;
}

export const MessagePartRenderer = ({
  part,
  messageId,
  partIndex,
  sendMessage,
  status,
  isLastPart,
  isLastMessage,
  cart,
  dispatchCartAction,
}: MessagePartRendererProps) => {
  // Render reasoning parts
  if (part.type === 'reasoning') {
    const isStreaming = status === 'streaming' && isLastPart && isLastMessage;
    return (
      <Reasoning
        key={`${messageId}-${partIndex}`}
        className="w-full"
        isStreaming={isStreaming}
      >
        <ReasoningTrigger />
        <ReasoningContent>{part.text || ''}</ReasoningContent>
      </Reasoning>
    );
  }

  // Render step-start parts (just skip them as they're markers)
  if (part.type === 'step-start') {
    return null;
  }

  // Render text parts
  if (part.type === 'text') {
    // Check if text starts with "**Discussion about" and state is "done"
    const isDiscussionHeader = part.text?.startsWith('**Discussion about') && part.state === 'done';
    
    // Extract topic from "**Discussion about [TOPIC]**"
    let discussionTopic: string | null = null;
    if (isDiscussionHeader) {
      const match = part.text.match(/\*\*Discussion about (.+?)\*\*/);
      if (match && match[1]) {
        discussionTopic = match[1];
      }
    }

    // Use DiscussionCard component if it's a discussion header
    if (isDiscussionHeader && discussionTopic) {
      return (
        <DiscussionCard
          key={`${messageId}-${partIndex}`}
          text={part.text}
          topic={discussionTopic}
          className="w-full"
          sendMessage={sendMessage}
        />
      );
    }

    // Regular text rendering
    return (
      <MarkdownText key={`${messageId}-${partIndex}`} className="!text-black">
        {part.text}
      </MarkdownText>
    );
  }

  // Render tool parts
  if (part.type === 'dynamic-tool') {
    const dynamicToolPart = part as any;

    // Custom rendering for productSearch tool
    if (dynamicToolPart.toolName === 'productSearch') {
      return (
        <ProductSearchToolRenderer
          toolPart={dynamicToolPart}
          messageId={messageId}
          partIndex={partIndex}
          dispatchCartAction={dispatchCartAction}
          cart={cart}
        />
      );
    }

    // Custom rendering for cartInfo tool
    if (dynamicToolPart.toolName === 'cartInfo') {
      return (
        <CartInfoToolRenderer
          toolPart={dynamicToolPart}
          messageId={messageId}
          partIndex={partIndex}
          dispatchCartAction={dispatchCartAction}
          cart={cart}
        />
      );
    }

    // Default tool rendering
    return (
      <DefaultToolRenderer
        toolPart={dynamicToolPart}
        messageId={messageId}
        partIndex={partIndex}
      />
    );
  }

  // Filter out internal AI SDK parts that shouldn't be displayed
  // These include: step-finish, text-delta, tool-call, tool-result
  // Note: reasoning and step-start are handled above
  const internalPartTypes = ['step-finish', 'text-delta', 'tool-call', 'tool-result'];
  if (internalPartTypes.includes(part.type)) {
    return null;
  }

  // Default: render as text if type is unknown (but log for debugging)
  // Most unknown types should be filtered out above, but this is a safety net
  console.warn('Unknown message part type:', part.type, part);
  return null;
};

