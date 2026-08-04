/**
 * @file features/ai-assistant/server/handle-assistant-request.ts
 * Assistant Request Handler
 *
 * Purpose: Coordinates the reusable server flow for assistant requests.
 * Used in: app/api/ai-assistant/route.ts.
 * Used for: Parsing requests, persisting chat messages, invoking injected business runtime, and returning SSE streams.
 *
 * Function Index:
 * handleAssistantRequest: End-to-end reusable assistant request handler.
 *
 * Steps:
 * 1. Parse and validate the HTTP request.
 * 2. Load or create chat persistence records.
 * 3. Save the latest user message.
 * 4. Extract the latest user query for runtime routing.
 * 5. Create an AI SDK UI message stream and delegate business behavior to the injected runtime.
 * 6. Save assistant messages and run optional runtime finish hooks.
 * 7. Return the stream as Server-Sent Events.
 */

import { createUIMessageStream, JsonToSseTransformStream } from 'ai';
import type { AssistantRuntime } from '../model/assistant-runtime';
import type { AssistantPersistence } from '../model/assistant-persistence';
import { handleApiError } from '../lib/errors';
import { logger } from '../lib/logger';
import { extractUserQuery, generateUUID } from '../lib/utils';
import { parseAssistantRequest } from './parse-assistant-request';

/**
 * Handle an assistant HTTP request using an injected business runtime.
 *
 * @template TBusinessContext - App-specific context shape accepted by the runtime adapter.
 * @param req - Incoming HTTP request from the route adapter.
 * @param runtime - Business adapter that routes the request and creates an AI stream.
 * @returns Streaming SSE response or a normalized error response.
 */
export async function handleAssistantRequest<TBusinessContext = Record<string, unknown>>(
  req: Request,
  runtime: AssistantRuntime<TBusinessContext>,
  persistence: AssistantPersistence
): Promise<Response> {
  try {
    // 1. Parse reusable assistant fields and collect app-owned request context.
    const parsedRequest = await parseAssistantRequest<TBusinessContext>(req);

    // 2. Resolve chat persistence before streaming so history has a stable parent row.
    const chat = await persistence.loadOrCreateChat({
      chatId: parsedRequest.chatId,
      messages: parsedRequest.messages,
    });

    // 3. Persist the latest user message without blocking the runtime boundary with database details.
    await persistence.saveLatestUserMessage({
      chatId: chat.chatId,
      messages: parsedRequest.messages,
    });

    // 4. Extract the routeable user query from the parsed AI SDK messages.
    const userQuery = extractUserQuery(parsedRequest.messages);

    if (!userQuery) {
      logger.warn('Empty user query received');
      return handleApiError(new Error('User query is required and cannot be empty'));
    }

    // 5. Build the generic runtime request that hides HTTP and persistence details.
    const runtimeRequest = {
      messages: parsedRequest.messages,
      userQuery,
      businessContext: parsedRequest.businessContext,
      modelId: parsedRequest.modelId,
    };

    // 6. Create one UI message stream that can merge model output and business tool data.
    const stream = createUIMessageStream({
      execute: async ({ writer: dataStream }) => {
        // 7. Delegate classification, tool selection, and model stream creation to the runtime.
        const agentStream = await runtime.stream(runtimeRequest, dataStream);

        if (agentStream instanceof Response) {
          logger.warn('Runtime returned Response instead of stream - stream merging skipped');
          return;
        }

        // 8. Merge the runtime's stream into the reusable assistant stream.
        dataStream.merge(agentStream);
      },
      generateId: generateUUID,
      onFinish: async ({ messages }) => {
        // 9. Persist assistant messages after streaming so response delivery stays responsive.
        await persistence.saveAssistantMessages({
          chatId: chat.chatId,
          messages,
        });

        // 10. Let the business runtime perform optional finish-time work after core persistence.
        await runtime.onFinish?.({
          request: runtimeRequest,
          messages,
        });
      },
    });

    // 11. Convert AI SDK JSON chunks to SSE for the current browser client.
    return new Response(stream.pipeThrough(new JsonToSseTransformStream()), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    logger.error('Error in assistant request handler', error);
    return handleApiError(error);
  }
}
