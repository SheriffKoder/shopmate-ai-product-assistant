/**
 * Recommendation Agent
 * 
 * Purpose: Handles recommendation queries (use cases, compatibility, recommendations)
 * Used in: app/api/ai-assistant/route.ts
 * Why: Separates recommendation logic from general product queries
 */

import { streamText, UIMessage, convertToModelMessages, type UIMessageStreamWriter } from 'ai';
import { openai, OpenAIResponsesProviderOptions } from '@ai-sdk/openai';
import { smoothStream } from 'ai';
import { getRecommendationPrompt } from './prompt';
import { getProductCatalogContext, getCartContext } from '@/features/ai-assistant/config/system-prompt';
import { createProductSearchTool } from '@/features/ai-assistant/tools';
import { CartState } from '@/features/shop/model/cart';
import { createDocumentTool } from '@/features/ai-assistant/artifacts/text/tool/create-document-tool';
import { createTextDocument } from '@/features/ai-assistant/artifacts/text/tool/server';
import { createSheetDocument } from '@/features/ai-assistant/artifacts/sheet/server';
import { generateUUID } from '@/features/ai-assistant/lib/utils';
import { logger } from '@/features/ai-assistant/lib/logger';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface RecommendationRequest {
  messages: UIMessage[];
  products?: any[];
  cart?: any;
}

/**
 * Process recommendation request
 * @param request - Request containing messages, products, and cart
 * @param dataStream - Optional data stream writer for custom UI data types
 * @returns Streaming response with recommendation output
 */
export async function processRecommendationRequest(
  request: RecommendationRequest,
  dataStream?: UIMessageStreamWriter<any>
) {
  const { messages, products = [], cart } = request;

  // Get system prompt
  const systemPrompt = getRecommendationPrompt();

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

  // Shared document ID storage for syncing tool and agent
  // The agent generates the ID, and the tool uses it via closure
  let sharedDocumentId: string | null = null;

  // Stream Text with AI model
  const result = streamText({
    // Model: Using OpenAI o3-mini
    model: openai('o3-mini'),

    // System Prompt:
    system: systemPrompt,
    messages: convertToModelMessages(messagesWithProductData),

    maxOutputTokens: 2000, // Increased to allow for reasoning + tool calls

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
    // Note: Do NOT use cartInfo tool - handle cart recommendations with text only
    // Pass dataStream to enable streaming custom data types
    // Pass sharedDocumentId getter/setter so tool can use the agent's ID
    tools: {
      productSearch: createProductSearchTool(products, dataStream),
      ...(dataStream && { 
        createDocument: createDocumentTool(
          dataStream, 
          () => sharedDocumentId, 
          (id: string) => { sharedDocumentId = id; }
        ) 
      }),
    },

    // Handle tool calls - trigger artifact handler when createDocument is called
    onStepFinish: async ({ toolCalls }) => {
      if (!dataStream || !toolCalls) {
        logger.debug('[Recommendation Agent] onStepFinish: No dataStream or toolCalls');
        return;
      }

      logger.debug('[Recommendation Agent] onStepFinish called', {
        toolCallsCount: toolCalls.length,
        toolNames: toolCalls.map(tc => tc?.toolName).filter(Boolean),
      });

      for (const toolCall of toolCalls) {
        if (toolCall && toolCall.toolName === 'createDocument') {
          // Access tool call input (args)
          const input = 'input' in toolCall ? toolCall.input : undefined;
          if (!input) continue;
          
          const { title, kind } = input as { title: string; kind?: 'text' | 'code' | 'sheet' };
          logger.debug('[Recommendation Agent] Extracted tool call input', { title, kind });
          
          // Use the shared ID that was set by the tool
          // The tool generates the ID and sets it via setSharedId, ensuring sync
          if (!sharedDocumentId) {
            // Tool didn't set it (shouldn't happen if tool is working correctly)
            // Generate one as fallback
            sharedDocumentId = generateUUID();
            logger.warn('[Recommendation Agent] Shared documentId was not set by tool, generated fallback', {
              documentId: sharedDocumentId,
            });
          }
          
          const documentId = sharedDocumentId;
          
          logger.debug('[Recommendation Agent] Using documentId for persistence', {
            documentId,
            sharedDocumentId,
            note: 'Tool and agent use the same ID via shared closure',
          });
          
          // Handle different artifact types
          if (kind === 'text' || !kind) {
            logger.info('[Recommendation Agent] Calling createTextDocument', {
              title,
              documentId,
            });
            await createTextDocument({
              title,
              dataStream,
              documentId, // Use synced documentId for Supabase persistence
            });
            logger.debug('[Recommendation Agent] createTextDocument completed');
          } else if (kind === 'sheet') {
            logger.info('[Recommendation Agent] Calling createSheetDocument', {
              title,
              documentId,
            });
            await createSheetDocument({
              title,
              dataStream,
              documentId, // Use synced documentId for Supabase persistence
            });
            logger.debug('[Recommendation Agent] createSheetDocument completed');
          } else {
            logger.debug('[Recommendation Agent] Skipping artifact creation (unsupported kind)', { kind });
          }
          
          // Reset shared ID for next tool call
          sharedDocumentId = null;
          // Future: Handle code artifacts here
        }
      }
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
