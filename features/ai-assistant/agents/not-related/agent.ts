/**
 * Not Related Query Agent
 * 
 * Purpose: Handles queries that are not related to the shop context
 * Used in: app/api/ai-assistant/route.ts
 * Why: Provides a simple, polite apology response for off-topic queries
 */

import { streamText } from 'ai';
import { openai, OpenAIResponsesProviderOptions } from '@ai-sdk/openai';
import { getNotRelatedPrompt } from './prompt';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

/**
 * Process not-related query request
 * @returns Streaming response with polite apology
 */
export async function processNotRelatedRequest() {
  // Get system prompt
  const systemPrompt = getNotRelatedPrompt();

  console.log('Not-related agent called - generating simple apology response');

  // Stream Text with AI model - use messages format to ensure text is generated
  const result = streamText({
    // Model: Using OpenAI o3-mini
    model: openai('o3-mini'),

    // System Prompt:
    system: systemPrompt,
    
    // Use messages format to ensure text part is generated
    messages: [
      {
        role: 'user',
        content: 'Please provide a friendly apology message.',
      },
    ],

    maxOutputTokens: 200, // Short, simple response

    // Reasoning Component: Thinking in UI (if the model supports it)
    providerOptions: {
      openai: {
        reasoningEffort: "medium",
        reasoningSummary: "auto",
      } satisfies OpenAIResponsesProviderOptions,
    },

    // No tools
  });

  console.log('Not-related agent result created');

  // Send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}

