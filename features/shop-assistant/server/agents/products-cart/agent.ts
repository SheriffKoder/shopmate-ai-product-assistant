/**
 * AI Assistant Agent
 * 
 * Purpose: Handles AI assistant logic for electronic products promotion and Q&A
 * Used in: app/api/ai-assistant/route.ts
 * Why: Separates business logic from API route handling
 */

import { smoothStream, streamText, UIMessage, convertToModelMessages, type UIMessageStreamWriter } from 'ai';
import { OpenAIResponsesProviderOptions } from '@ai-sdk/openai';
import { getSystemPrompt, getProductCatalogContext } from '@/features/shop-assistant/server/system-prompt';
import { createProductSearchTool, createCartInfoTool } from '@/features/shop-assistant/tools';
import { CartState } from '@/features/cart/model/cart';
import type { AssistantResolvedModels } from '@/features/ai-assistant/server/assistant-model-provider';
import { createEmptyCatalogResponse } from '@/features/shop-assistant/server/empty-catalog-response';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface AgentRequest {
  messages: UIMessage[];
  products?: any[]; // Array of Product objects
  cart?: CartState; // Cart state
  models: AssistantResolvedModels;
  catalogSource: import('@/features/shop-assistant/model/catalog-source').CatalogSource;
  cartSource?: import('@/features/shop-assistant/model/cart-source').CartSource;
  userQuery: string;
  catalogLookupCompleted?: boolean;
}

/**
 * Process AI assistant request for product promotion and Q&A
 * @param request - Request containing messages and product catalog
 * @param dataStream - Optional data stream writer for custom UI data types
 * @returns Streaming response with AI assistant output
 */
export async function processProductAssistantRequest(
  request: AgentRequest,
  dataStream?: UIMessageStreamWriter<any>
) {
  const {
    messages,
    products = [],
    cart,
    models,
  } = request;

  if (request.catalogLookupCompleted && products.length === 0) {
    return createEmptyCatalogResponse();
  }

  // Get system prompt
  const systemPrompt = getSystemPrompt();

  // Get product catalog context from the catalog source.
  // Why: Future DB filters can return a small context set instead of dumping the whole catalog into the model.
  const contextProducts = request.catalogLookupCompleted
    ? products
    : await request.catalogSource.getProductContext({ query: request.userQuery, limit: 8 });
  const productCatalogContext = contextProducts.length > 0
    ? getProductCatalogContext(contextProducts)
    : 'STORE LOOKUP RESULT: No matching products were found in the store. Apologize and do not invent products.';

  // Add product catalog data to the last user message by modifying the text content
  const messagesWithProductData = messages.map((msg, index) => {
    if (index === messages.length - 1 && msg.role === 'user') {
      // Add product catalog context to the last user message
      const textParts = msg.parts?.filter(p => p.type === 'text') || [];
      const existingText = textParts.map(p => (p as any).text).join('');
      // Update the last text part with product catalog data appended
      const updatedParts = msg.parts?.map((part, partIndex) => {
        if (part.type === 'text' && partIndex === textParts.length - 1) {
          return {
            ...part,
            text: (part as any).text + '\n\n' + productCatalogContext,
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

  console.log('messagesWithProductData', messagesWithProductData);
  console.log(messagesWithProductData);

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

    // Tools - Pass dataStream to enable streaming custom data types
    tools: {
      productSearch: createProductSearchTool(request.catalogSource, dataStream),
      ...(request.cartSource && { cartInfo: createCartInfoTool(request.cartSource, dataStream) }),
    },
    // stopWhen: stepCountIs(20), // not do more than 20 tool calls to avoid infinite loops
  });

  //////////////////////////////////
  // Consume and Merge Stream: Process the stream and merge with dataStream
  // Why: Ensures the stream is processed and can be merged with custom data types
  // How: consumeStream() processes the stream, then we return the UI message stream
  //////////////////////////////////
  result.consumeStream();

  //////////////////////////////////
  // Return Stream: Return UI message stream instead of Response
  // Why: Allows merging with dataStream in the API route
  // How: toUIMessageStream() returns a stream that can be merged
  //////////////////////////////////
  return result.toUIMessageStream({
    sendSources: true, // receive as parts on the frontend.
    sendReasoning: true, // receive as parts on the frontend.
  });
}
