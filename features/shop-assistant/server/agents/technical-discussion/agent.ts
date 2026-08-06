/**
 * Technical Discussion Agent
 * 
 * Purpose: Handles technical discussion queries about technology, features, and comparisons
 * Used in: app/api/ai-assistant/route.ts
 * Why: Separates technical Q&A from shopping-related queries
 */

import { smoothStream, streamText, UIMessage, convertToModelMessages, type UIMessageStreamWriter } from 'ai';
import { OpenAIResponsesProviderOptions } from '@ai-sdk/openai';
import { getTechnicalDiscussionPrompt } from './prompt';
import { createDocumentTool } from '@/features/ai-assistant/components/artifacts/text/tool/create-document-tool';
import { createTextDocument } from '@/features/ai-assistant/components/artifacts/text/tool/server';
import { createSheetDocument } from '@/features/ai-assistant/components/artifacts/sheet/server';
import { logger } from '@/features/ai-assistant/lib/logger';
import { generateUUID } from '@/features/ai-assistant/lib/utils';
import type { AssistantResolvedModels } from '@/features/ai-assistant/server/assistant-model-provider';
import type { PersistenceMode } from '@/features/ai-assistant/message-persistence/model/persistence-mode';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface TechnicalDiscussionRequest {
  messages: UIMessage[];
  dataStream?: UIMessageStreamWriter<any>;
  models: AssistantResolvedModels;
  persistenceMode: PersistenceMode;
}

/**
 * Process technical discussion request
 * @param request - Request containing messages and optional dataStream
 * @returns Streaming response with technical discussion output
 */
export async function processTechnicalDiscussionRequest(
  request: TechnicalDiscussionRequest
) {
  const { messages, dataStream, models, persistenceMode } = request;

  // Get system prompt
  const systemPrompt = getTechnicalDiscussionPrompt();

  // Shared document ID storage for syncing tool and agent
  // The agent generates the ID, and the tool uses it via closure
  let sharedDocumentId: string | null = null;

  // Stream Text with AI model
  const result = streamText({
    // Model: selected by the reusable assistant model registry.
    model: models.chat,

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

    // Smooth streaming (instead of streamText it streams lines)
    experimental_transform: smoothStream({
      delayInMs: 10,
      chunking: "word", // RegExp | "word" | "line" | ChunkDetector | undefined
    }),

    // Tools - Add createDocument tool for artifact creation
    // Pass sharedDocumentId getter/setter so tool can use the agent's ID
    tools: dataStream ? {
      createDocument: createDocumentTool(dataStream, () => sharedDocumentId, (id: string) => { sharedDocumentId = id; }),
    } : undefined,

    // Handle tool calls - trigger artifact handler when createDocument is called
    onStepFinish: async ({ toolCalls }) => {
      if (!dataStream || !toolCalls) {
        logger.debug('[Technical Discussion Agent] onStepFinish: No dataStream or toolCalls');
        return;
      }

      logger.debug('[Technical Discussion Agent] onStepFinish called', {
        toolCallsCount: toolCalls.length,
        toolNames: toolCalls.map(tc => tc?.toolName).filter(Boolean),
      });

      for (const toolCall of toolCalls) {
        if (toolCall.toolName === 'createDocument') {
          logger.debug('[Technical Discussion Agent] Processing createDocument tool call', {
            toolCallType: typeof toolCall,
            hasInput: 'input' in toolCall,
            hasResult: 'result' in toolCall,
          });

          // Access tool call input (args)
          const input = 'input' in toolCall ? toolCall.input : undefined;
          if (!input) {
            logger.warn('[Technical Discussion Agent] createDocument tool call has no input');
            continue;
          }
          
          const { title, kind } = input as { title: string; kind?: 'text' | 'code' | 'sheet' };
          logger.debug('[Technical Discussion Agent] Extracted tool call input', { title, kind });
          
          // Generate document ID and set it in shared storage BEFORE tool executes
          // The tool will check for this ID and use it, ensuring sync
          // Note: Tool executes before onStepFinish, so we generate it here for the NEXT call
          // For the CURRENT call, the tool has already executed, so we use the shared ID it set
          if (!sharedDocumentId) {
            // Tool didn't set it (shouldn't happen if tool is working correctly)
            // Generate one as fallback
            sharedDocumentId = generateUUID();
            logger.warn('[Technical Discussion Agent] Shared documentId was not set by tool, generated fallback', {
              documentId: sharedDocumentId,
            });
          }
          
          const documentId = sharedDocumentId;
          
          logger.debug('[Technical Discussion Agent] Using documentId for persistence', {
            documentId,
            sharedDocumentId,
            note: 'Tool and agent use the same ID via shared closure',
          });
          
          // Handle different artifact types
          if (kind === 'text' || !kind) {
            logger.info('[Technical Discussion Agent] Calling createTextDocument', {
              title,
              documentId,
            });
            await createTextDocument({
              title,
              dataStream,
              documentId, // Use synced documentId for Supabase persistence
              persistenceMode,
            });
            logger.debug('[Technical Discussion Agent] createTextDocument completed');
          } else if (kind === 'sheet') {
            logger.info('[Technical Discussion Agent] Calling createSheetDocument', {
              title,
              documentId,
            });
            await createSheetDocument({
              title,
              dataStream,
              documentId, // Use synced documentId for Supabase persistence
              persistenceMode,
            });
            logger.debug('[Technical Discussion Agent] createSheetDocument completed');
          } else {
            logger.debug('[Technical Discussion Agent] Skipping artifact creation (unsupported kind)', { kind });
          }
          
          // Reset shared ID for next tool call
          sharedDocumentId = null;
          // Future: Handle code artifacts here
        }
      }
    },
  });

  // Consume stream to process tool calls
  result.consumeStream();

  // Send sources and reasoning back to the client
  return result.toUIMessageStream({
    sendSources: true, // receive as parts on the frontend.
    sendReasoning: true, // receive as parts on the frontend.
  });
}
