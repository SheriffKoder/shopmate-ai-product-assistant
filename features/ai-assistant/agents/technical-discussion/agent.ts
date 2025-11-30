/**
 * Technical Discussion Agent
 * 
 * Purpose: Handles technical discussion queries about technology, features, and comparisons
 * Used in: app/api/ai-assistant/route.ts
 * Why: Separates technical Q&A from shopping-related queries
 */

import { smoothStream, streamText, UIMessage, convertToModelMessages } from 'ai';
import { openai, OpenAIResponsesProviderOptions } from '@ai-sdk/openai';
import { getTechnicalDiscussionPrompt } from './prompt';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface TechnicalDiscussionRequest {
  messages: UIMessage[];
}

/**
 * Process technical discussion request
 * @param request - Request containing messages
 * @returns Streaming response with technical discussion output
 */
export async function processTechnicalDiscussionRequest(request: TechnicalDiscussionRequest) {
  const { messages } = request;

  // Get system prompt
  const systemPrompt = getTechnicalDiscussionPrompt();

  // Stream Text with AI model
  const result = streamText({
    // Model: Using OpenAI o3-mini
    model: openai('o3-mini'),

    // System Prompt:
    system: systemPrompt,
    messages: convertToModelMessages(messages),

    maxOutputTokens: 1000,

    // Reasoning Component: Thinking in UI (if the model supports it)
    providerOptions: {
      openai: {
        reasoningEffort: "medium",
        reasoningSummary: "auto", // concise | detailed | auto
      } satisfies OpenAIResponsesProviderOptions,
    },

    // // Smooth streaming (instead of streamText it streams lines)
    // experimental_transform: smoothStream({
    //   delayInMs: 10,
    //   chunking: "word", // RegExp | "word" | "line" | ChunkDetector | undefined
    // }),

    // No tools for technical discussion (for now)
  });

  // Send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    sendSources: true, // receive as parts on the frontend.
    sendReasoning: true, // receive as parts on the frontend.
  });
}

