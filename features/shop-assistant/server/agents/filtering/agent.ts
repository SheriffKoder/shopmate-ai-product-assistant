/**
 * Filtering Agent
 * 
 * Purpose: Handles filtering queries (price, budget, features, availability, brands)
 * Used in: app/api/ai-assistant/route.ts
 * Why: Separates filtering logic from general product queries
 */

import { streamText, UIMessage, convertToModelMessages, type UIMessageStreamWriter } from 'ai';
import { OpenAIResponsesProviderOptions } from '@ai-sdk/openai';
import { smoothStream } from 'ai';
import { getFilteringPrompt } from './prompt';
import { getProductCatalogContext, getCartContext } from '@/features/shop-assistant/server/system-prompt';
import { createProductSearchTool, createCartInfoTool } from '@/features/shop-assistant/tools';
import { CartState } from '@/features/shop/model/cart';
import type { AssistantResolvedModels } from '@/features/ai-assistant/server/assistant-model-provider';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface FilteringRequest {
  messages: UIMessage[];
  products?: any[];
  cart?: any;
  models: AssistantResolvedModels;
  catalogSource: import('@/features/shop-assistant/model/catalog-source').CatalogSource;
  cartSource?: import('@/features/shop-assistant/model/cart-source').CartSource;
  userQuery: string;
}

/**
 * Process filtering request
 * @param request - Request containing messages, products, and cart
 * @param dataStream - Optional data stream writer for custom UI data types
 * @returns Streaming response with filtering output
 */
export async function processFilteringRequest(
  request: FilteringRequest,
  dataStream?: UIMessageStreamWriter<any>
) {
  const { messages, products = [], cart, models } = request;

  // Get system prompt
  const systemPrompt = getFilteringPrompt();

  // Get product catalog context from the catalog source.
  // Why: Filtering agents should reason over candidate products, not the entire catalog.
  const contextProducts = await request.catalogSource.getProductContext({
    query: request.userQuery,
    limit: 8,
  });
  const productCatalogContext = getProductCatalogContext(contextProducts.length > 0 ? contextProducts : products);
  
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
    // Model: selected by the reusable assistant model registry.
    model: models.chat,

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
    // Pass dataStream to enable streaming custom data types
    tools: {
      productSearch: createProductSearchTool(request.catalogSource, dataStream),
      ...(request.cartSource && { cartInfo: createCartInfoTool(request.cartSource, dataStream) }),
    },
  });

  //////////////////////////////////
  // Consume and Merge Stream: Process the stream and merge with dataStream
  // Why: Ensures the stream is processed and can be merged with custom data types
  //////////////////////////////////
  result.consumeStream();

  //////////////////////////////////
  // Return Stream: Return UI message stream instead of Response
  // Why: Allows merging with dataStream in the API route
  //////////////////////////////////
  return result.toUIMessageStream({
    sendSources: true, // receive as parts on the frontend.
    sendReasoning: true, // receive as parts on the frontend.
  });
}
