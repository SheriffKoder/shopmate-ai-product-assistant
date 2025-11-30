/**
 * Filtering Agent
 * 
 * Purpose: Handles filtering queries (price, budget, features, availability, brands)
 * Used in: app/api/ai-assistant/route.ts
 * Why: Separates filtering logic from general product queries
 */

import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { openai, OpenAIResponsesProviderOptions } from '@ai-sdk/openai';
import { smoothStream } from 'ai';
import { getFilteringPrompt } from './prompt';
import { getProductCatalogContext, getCartContext } from '@/features/ai-assistant/config/system-prompt';
import { createProductSearchTool, createCartInfoTool } from '@/features/ai-assistant/tools';
import { CartState } from '@/features/ai-assistant/types/cart';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface FilteringRequest {
  messages: UIMessage[];
  products?: any[];
  cart?: any;
}

/**
 * Process filtering request
 * @param request - Request containing messages, products, and cart
 * @returns Streaming response with filtering output
 */
export async function processFilteringRequest(request: FilteringRequest) {
  const { messages, products = [], cart } = request;

  // Get system prompt
  const systemPrompt = getFilteringPrompt();

  // Get product catalog context
  const productCatalogContext = getProductCatalogContext(products);
  
  // Get cart context
  const cartContext = getCartContext(cart);

  // Add product catalog and cart data to the last user message by modifying the text content
  const messagesWithProductData = messages.map((msg, index) => {
    if (index === messages.length - 1 && msg.role === 'user') {
      // Add product catalog and cart context to the last user message
      const textParts = msg.parts?.filter(p => p.type === 'text') || [];
      const existingText = textParts.map(p => (p as any).text).join('');
      // Combine contexts
      const combinedContext = [productCatalogContext, cartContext].filter(Boolean).join('\n\n');
      // Update the last text part with context data appended
      const updatedParts = msg.parts?.map((part, partIndex) => {
        if (part.type === 'text' && partIndex === textParts.length - 1) {
          return {
            ...part,
            text: (part as any).text + '\n\n' + combinedContext,
          };
        }
        return part;
      }) || [];
      return {
        ...msg,
        parts: updatedParts,
      };
    }
    return msg;
  });

  // Stream Text with AI model
  const result = streamText({
    // Model: Using OpenAI o3-mini
    model: openai('o3-mini'),

    // System Prompt:
    system: systemPrompt,
    messages: convertToModelMessages(messagesWithProductData),

    maxOutputTokens: 1000,

    // Reasoning Component: Thinking in UI (if the model supports it)
    providerOptions: {
      openai: {
        reasoningEffort: "medium",
        reasoningSummary: "auto", // concise | detailed | auto
      } satisfies OpenAIResponsesProviderOptions,
    },

    // Smooth streaming (instead of streamText it streams lines)
    experimental_transform: smoothStream({
      delayInMs: 10,
      chunking: "word", // RegExp | "word" | "line" | ChunkDetector | undefined
    }),

    // Tools - use productSearch to display products when found
    tools: {
      productSearch: createProductSearchTool(products),
      ...(cart && { cartInfo: createCartInfoTool(cart) }),
    },
  });

  // Send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    sendSources: true, // receive as parts on the frontend.
    sendReasoning: true, // receive as parts on the frontend.
  });
}

