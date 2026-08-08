/**
 * Not Related Query Agent
 * 
 * Purpose: Handles queries that are not related to the shop context
 * Used in: app/api/ai-assistant/route.ts
 * Why: Provides a simple, polite apology response for off-topic queries
 */

import { streamText } from 'ai';
import { OpenAIResponsesProviderOptions } from '@ai-sdk/openai';
import { getNotRelatedPrompt } from './prompt';
import type { AssistantResolvedModels } from '@/features/ai-assistant/server/assistant-model-provider';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

/**
 * Process not-related query request
 * @returns Streaming response with polite apology
 */
export async function processNotRelatedRequest(request: { models: AssistantResolvedModels }) {
  // Get system prompt
  const systemPrompt = getNotRelatedPrompt();

  console.log('Not-related agent called - generating simple apology response');

  // Stream Text with AI model - use messages format to ensure text is generated
  const result = streamText({
    // Model: selected by the reusable assistant model registry.
    model: request.models.chat,

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
  // Return the stream itself because the shared assistant handler merges it
  // into its own response. Returning a Response here causes that handler to
  // skip the merge, leaving the user with no assistant message.
  return result.toUIMessageStream({
    sendSources: true,
    sendReasoning: true,
  });
}
