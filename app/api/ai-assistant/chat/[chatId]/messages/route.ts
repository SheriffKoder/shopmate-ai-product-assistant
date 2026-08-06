/**
 * Chat Messages API Route
 * 
 * Purpose: HTTP endpoint for fetching messages for a specific chat
 * Used in: Chat container when loading chat history
 * Why: Provides messages for a chat when user selects it from sidebar
 */

import { NextRequest } from 'next/server';
import { getMessagesByChatId } from '@/shared/infrastructure/supabase/queries/chat-queries';
import { handleApiError } from '@/features/ai-assistant/lib/errors';
import { logger } from '@/features/ai-assistant/lib/logger';

/**
 * GET handler for Chat Messages API
 * 
 * Flow:
 * 1. Extract chatId from route params
 * 2. Fetch messages from database using getMessagesByChatId
 * 3. Return messages array
 * 
 * @param request - HTTP Request object
 * @param params - Route params containing chatId
 * @returns JSON response with messages array
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
): Promise<Response> {
  try {
    // Handle Next.js 15 async params
    const resolvedParams = await Promise.resolve(params);
    const { chatId } = resolvedParams;

    if (!chatId || chatId.trim() === '') {
      logger.warn('[GET /api/chat/[chatId]/messages] Missing chatId');
      return handleApiError(
        new Error('Chat ID is required')
      );
    }

    logger.info(`[GET /api/chat/[chatId]/messages] Fetching messages for chat: ${chatId}`);

    //////////////////////////////////
    // Fetch Messages: Get all messages for this chat
    // Why: Load chat history when user selects a chat
    // How: Call getMessagesByChatId query function
    //////////////////////////////////
    const messages = await getMessagesByChatId({ chatId: chatId.trim() });

    //////////////////////////////////
    // Return Response: Send messages array
    // Why: Client needs messages to display in chat
    // How: Return JSON with messages array
    //////////////////////////////////
    return Response.json({ messages }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    // Centralized error handling
    logger.error('[GET /api/chat/[chatId]/messages] Error:', error);
    return handleApiError(error);
  }
}
