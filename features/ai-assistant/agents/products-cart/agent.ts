/**
 * AI Assistant Agent
 * 
 * Purpose: Handles AI assistant logic for electronic products promotion and Q&A
 * Used in: app/api/ai-assistant/route.ts
 * Why: Separates business logic from API route handling
 */

import { smoothStream, streamText, UIMessage, convertToModelMessages } from 'ai';
import { openai, OpenAIResponsesProviderOptions } from '@ai-sdk/openai';
import { getSystemPrompt, getProductCatalogContext } from '@/features/ai-assistant/config/system-prompt';
import { createProductSearchTool, createCartInfoTool } from '@/features/ai-assistant/tools';
import { CartState } from '../../types/cart';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface AgentRequest {
  messages: UIMessage[];
  products?: any[]; // Array of Product objects
  cart?: CartState; // Cart state
}

/**
 * Process AI assistant request for product promotion and Q&A
 * @param request - Request containing messages and product catalog
 * @returns Streaming response with AI assistant output
 */
export async function processProductAssistantRequest(request: AgentRequest) {
  const {
    messages,
    products = [],
    cart,
  } = request;

  // Get system prompt
  const systemPrompt = getSystemPrompt();

  // Get product catalog context
  const productCatalogContext = getProductCatalogContext(products);

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

    // Tools
    tools: {
      productSearch: createProductSearchTool(products),
      ...(cart && { cartInfo: createCartInfoTool(cart) }),
    },
    // stopWhen: stepCountIs(20), // not do more than 20 tool calls to avoid infinite loops
  });

  console.log('result', result);

  // Send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    sendSources: true, // receive as parts on the frontend.
    sendReasoning: true, // receive as parts on the frontend.
  });
}

