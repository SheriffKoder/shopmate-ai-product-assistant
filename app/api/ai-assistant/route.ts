/**
 * AI Assistant API Route
 * 
 * Purpose: HTTP endpoint for electronic products promotion and Q&A AI assistant
 * Used in: Next.js API routes
 * Why: Handles HTTP request/response, delegates business logic to router and agents
 */

import type { UIMessage } from 'ai';
import { createUIMessageStream, JsonToSseTransformStream } from 'ai';
import type { Product } from '@/features/ai-assistant/types/product';
import type { CartState } from '@/features/ai-assistant/types/cart';
import { maxDuration } from '@/features/ai-assistant/agents/products-cart/agent';
import { classifyQuery } from '@/features/ai-assistant/agents';
import { validateRequest } from '@/features/ai-assistant/lib/schemas';
import { extractUserQuery, generateUUID, extractTitleFromMessage, getLastUserMessage } from '@/features/ai-assistant/lib/utils';
import { routeToAgent } from '@/features/ai-assistant/lib/router';
import { handleApiError } from '@/features/ai-assistant/lib/errors';
import { logger } from '@/features/ai-assistant/lib/logger';
import { createChat, getChatById, saveMessages, getMessagesByChatId } from '@/lib/supabase/queries/chat-queries';
import { getOrCreateConstantUser } from '@/lib/supabase/queries/user-queries';

// Re-export maxDuration for Next.js route configuration
export { maxDuration };

/**
 * POST handler for AI Assistant API
 * 
 * Flow:
 * 1. FUTURE: Authenticate user and check permissions
 * 2. FUTURE: Check rate limits
 * 3. Validate request body using Zod schema
 * 4. Extract user query from messages
 * 5. Classify query to determine routing
 * 6. Route to appropriate agent via router
 * 7. FUTURE: Track request for analytics/rate limiting
 * 8. Return streaming response
 * 
 * @param req - HTTP Request object
 * @returns Streaming Response from the selected agent
 */
export async function POST(req: Request): Promise<Response> {
  try {
    // FUTURE IMPLEMENTATION: Authentication check
    // - Verify user session/token
    // - Get user ID from session
    // - Check if user has access to AI assistant feature
    // Example:
    // const session = await getSession(req);
    // if (!session?.user) {
    //   return handleApiError(createError.unauthorized('api', 'Authentication required'));
    // }
    // const userId = session.user.id;

    // FUTURE IMPLEMENTATION: Rate limiting check
    // - Check user's request rate against limits
    // - Return 429 if rate limit exceeded
    // - Track requests per user/IP
    // Example:
    // const rateLimitResult = await checkRateLimit(userId || req.headers.get('x-forwarded-for'));
    // if (!rateLimitResult.allowed) {
    //   return handleApiError(createError.rateLimit('api', `Rate limit exceeded. Try again in ${rateLimitResult.retryAfter} seconds`));
    // }

    // Parse and validate request body
    const body = await req.json();
    const validatedRequest = validateRequest(body);

    // Extract validated data with proper types
    // Type assertions are safe here because Zod validation ensures structure matches
    const messages = validatedRequest.messages as UIMessage[];
    const products = (validatedRequest.products ?? []) as Product[];
    const cart = validatedRequest.cart as CartState | undefined;
    const chatId = (validatedRequest as any).id as string | undefined;

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    // User and Saving Messages:
    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    //////////////////////////////////
    // User and Chat Management: Get or create user and chat
    // Why: Need user and chat to save messages
    // How: Get constant user, then get or create chat
    //////////////////////////////////
    const user = await getOrCreateConstantUser();
    if (!user) {
      logger.error('[POST /api/ai-assistant] Failed to get or create user');
      return handleApiError(
        new Error('User not found. Please create a user first.')
      );
    }

    // Generate chatId if not provided
    const finalChatId = chatId || generateUUID();

    // Get or create chat
    let chat = await getChatById({ id: finalChatId });
    if (!chat) {
      // Generate title from first user message
      const lastUserMessage = getLastUserMessage(messages);
      const title = extractTitleFromMessage(lastUserMessage);

      chat = await createChat({
        id: finalChatId,
        userId: user.id,
        title,
      });

      if (!chat) {
        logger.error('[POST /api/ai-assistant] Failed to create chat');
        return handleApiError(
          new Error('Failed to create chat')
        );
      }

      logger.info(`[POST /api/ai-assistant] Created new chat: ${chat.id}`);
    } else {
      logger.info(`[POST /api/ai-assistant] Using existing chat: ${chat.id}`);
    }

    //////////////////////////////////
    // Save User Message: Save the latest user message to database
    // Why: Persist user messages for chat history
    // How: Find last user message and save it (check if already exists to avoid duplicates)
    // Note: useChat sends all messages, so we need to find the NEW user message
    //       (the one that's not already in the database)
    //////////////////////////////////
    const lastUserMessage = getLastUserMessage(messages);
    
    // Debug logging to understand what's in the messages array
    logger.info(`[POST /api/ai-assistant] Messages array length: ${messages.length}`);
    logger.info(`[POST /api/ai-assistant] Messages roles: ${messages.map(m => m.role).join(', ')}`);
    
    if (lastUserMessage) {
      logger.info(`[POST /api/ai-assistant] Found user message: ${lastUserMessage.id}, parts: ${lastUserMessage.parts?.length || 0}`);
      try {
        // Check if this message already exists in database (by ID)
        // This prevents duplicate saves when the same request is retried
        const existingMessages = await getMessagesByChatId({ chatId: chat.id });
        const messageExists = existingMessages.some((m: { id: string }) => m.id === lastUserMessage.id);
        
        if (!messageExists) {
          // Generate a valid UUID for the message ID
          // useChat generates short IDs that aren't valid UUIDs, so we need to generate our own
          const messageId = generateUUID();
          
          const messageToSave = {
            id: messageId,
            chatId: chat.id,
            role: 'user' as const,
            parts: lastUserMessage.parts || [],
            attachments: (lastUserMessage as any).attachments || [],
          };
          
          logger.info(`[POST /api/ai-assistant] Saving user message: ${JSON.stringify({ id: messageToSave.id, role: messageToSave.role, partsCount: messageToSave.parts.length, originalId: lastUserMessage.id })}`);
          
          await saveMessages({
            messages: [messageToSave],
          });
          logger.info(`[POST /api/ai-assistant] Successfully saved user message: ${messageToSave.id}`);
        } else {
          logger.info(`[POST /api/ai-assistant] User message already exists, skipping save: ${lastUserMessage.id}`);
        }
      } catch (error) {
        // Log error but don't fail the request - message saving is not critical for streaming
        logger.error('[POST /api/ai-assistant] Failed to save user message:', error);
        logger.error('[POST /api/ai-assistant] Error details:', JSON.stringify(error, null, 2));
      }
    } else {
      logger.warn('[POST /api/ai-assistant] No user message found in messages array');
      logger.warn(`[POST /api/ai-assistant] Available messages: ${JSON.stringify(messages.map(m => ({ id: m.id, role: m.role })))}`);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    // Extract user query for classification
    const userQuery = extractUserQuery(messages);

    if (!userQuery) {
      logger.warn('Empty user query received');
      return handleApiError(
        new Error('User query is required and cannot be empty')
      );
    }

    // Classify the query to determine routing
    const classification = await classifyQuery({ query: userQuery });

    //////////////////////////////////
    // Create UI Message Stream: Wraps streamText to enable dataStream.write()
    // Why: Allows tools to write custom data types to the stream
    // How: Provides dataStream writer to execute function
    //////////////////////////////////
    const stream = createUIMessageStream({
      execute: async ({ writer: dataStream }) => {
        // Route to appropriate agent with dataStream
        const agentStream = await routeToAgent(
          classification,
          { messages, products, cart },
          userQuery,
          dataStream
        );

        //////////////////////////////////
        // Merge Agent Stream: Combine agent stream with dataStream
        // Why: Merges AI response stream with custom data types from tools
        // How: dataStream.merge() combines both streams into one
        // Note: Some agents (technical-discussion, not-related) still return Response
        //       and will be handled separately if needed
        //////////////////////////////////
        if (agentStream && typeof (agentStream as any).pipe === 'function') {
          // Agent returned a stream - merge it with dataStream
          dataStream.merge(agentStream);
        } else if (agentStream instanceof Response) {
          // FUTURE IMPLEMENTATION: Handle Response from other agents
          // For now, technical-discussion and not-related agents return Response
          // These can be updated later to support streams
          logger.warn('Agent returned Response instead of stream - stream merging skipped');
        } else {
          // Agent returned a stream (from toUIMessageStream) - merge it
          dataStream.merge(agentStream);
        }
      },
      generateId: generateUUID,
      onFinish: async ({ messages: finalMessages }) => {


        //////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////
        // Save AI Messages:
        //////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////
        // Save AI Messages: Save assistant messages after stream completes
        // Why: Persist AI responses for chat history
        // How: Filter assistant messages and save them to database
        // Note: This runs after the stream completes, so it doesn't block the response
        //////////////////////////////////
        try {
          const assistantMessages = finalMessages
            .filter((m) => m.role === 'assistant')
            .map((m) => ({
              id: generateUUID(), // Generate valid UUID for assistant messages too
              chatId: chat.id,
              role: 'assistant' as const,
              parts: m.parts || [],
              attachments: (m as any).attachments || [],
            }));

          if (assistantMessages.length > 0) {
            await saveMessages({ messages: assistantMessages });
            logger.info(`[POST /api/ai-assistant] Saved ${assistantMessages.length} AI message(s) for chat: ${chat.id}`);
          }
        } catch (error) {
          // Log error but don't fail - message saving is not critical
          logger.error('[POST /api/ai-assistant] Failed to save AI messages:', error);
        }
      },
    });

    //////////////////////////////////
    // Transform to SSE: Convert stream to Server-Sent Events format
    // Why: Browser can consume SSE streams via EventSource
    // How: pipeThrough transforms the stream to SSE format with proper headers
    //////////////////////////////////
    return new Response(
      stream.pipeThrough(new JsonToSseTransformStream()),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      }
    );

    // FUTURE IMPLEMENTATION: Track request after successful processing
    // - Increment rate limit counter
    // - Log request for analytics
    // - Store request metadata (userId, timestamp, classification, etc.)
    // Example:
    // await trackRequest({
    //   userId,
    //   classification,
    //   timestamp: new Date(),
    //   queryLength: userQuery.length,
    // });
  } catch (error) {
    // Centralized error handling
    logger.error('Error in AI Assistant API route', error);
    return handleApiError(error);
  }
}