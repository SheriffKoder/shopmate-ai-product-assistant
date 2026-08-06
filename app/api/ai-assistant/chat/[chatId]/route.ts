/**
 * Chat API Route
 * 
 * Purpose: HTTP endpoint for deleting a chat and its messages
 * Used in: Chat item actions (delete button)
 * Why: Provides API endpoint to delete chats from sidebar
 */

import { NextRequest } from 'next/server';
import { deleteChatById, getChatById } from '@/shared/infrastructure/supabase/queries/chat-queries';
import { getOrCreateConstantUser } from '@/shared/infrastructure/supabase/queries/user-queries';
import { AssistantError, handleApiError } from '@/features/ai-assistant/lib/errors';
import { logger } from '@/features/ai-assistant/lib/logger';

/**
 * DELETE handler for Chat API
 * 
 * Flow:
 * 1. Extract chatId from route params
 * 2. Get or create constant user (for now, using constant user)
 * 3. Verify chat exists and belongs to user
 * 4. Delete chat and all its messages
 * 5. Return success response
 * 
 * @param request - HTTP Request object
 * @param params - Route params containing chatId
 * @returns JSON response with success status
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
): Promise<Response> {
  try {
    // Handle Next.js 15 async params
    const resolvedParams = await Promise.resolve(params);
    const { chatId } = resolvedParams;

    if (!chatId || chatId.trim() === '') {
      logger.warn('[DELETE /api/chat/[chatId]] Missing chatId');
      return handleApiError(
        new Error('Chat ID is required')
      );
    }

    logger.info(`[DELETE /api/chat/[chatId]] Deleting chat: ${chatId}`);

    //////////////////////////////////
    // Get User: Get or create constant user
    // Why: Need to verify chat ownership
    // How: Call getOrCreateConstantUser
    // Note: In future, this will use authenticated user session
    //////////////////////////////////
    const user = await getOrCreateConstantUser();
    if (!user) {
      logger.error('[DELETE /api/chat/[chatId]] Failed to get or create user');
      return handleApiError(
        new Error('User not found. Please create a user first.')
      );
    }

    //////////////////////////////////
    // Verify Chat Exists: Check if chat exists and belongs to user
    // Why: Prevent unauthorized deletion and ensure chat exists
    // How: Fetch chat by ID and verify userId matches
    //////////////////////////////////
    const chat = await getChatById({ id: chatId.trim() });
    if (!chat) {
      logger.warn(`[DELETE /api/chat/[chatId]] Chat not found: ${chatId}`);
      return new AssistantError('not_found:api', 'Chat not found').toResponse();
    }

    // Verify chat belongs to user
    if (chat.userId !== user.id) {
      logger.warn(`[DELETE /api/chat/[chatId]] Unauthorized: Chat ${chatId} does not belong to user ${user.id}`);
      return new AssistantError('forbidden:api', 'You do not have permission to delete this chat').toResponse();
    }

    //////////////////////////////////
    // Delete Chat: Delete chat and all its messages
    // Why: Remove chat from database
    // How: Call deleteChatById query function
    //////////////////////////////////
    const deleted = await deleteChatById({ id: chatId.trim() });
    
    if (!deleted) {
      logger.error(`[DELETE /api/chat/[chatId]] Failed to delete chat: ${chatId}`);
      return handleApiError(
        new Error('Failed to delete chat')
      );
    }

    //////////////////////////////////
    // Return Response: Send success response
    // Why: Client needs confirmation that deletion succeeded
    // How: Return JSON with success status
    //////////////////////////////////
    logger.info(`[DELETE /api/chat/[chatId]] Successfully deleted chat: ${chatId}`);
    return Response.json(
      { success: true, message: 'Chat deleted successfully' },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    // Centralized error handling
    logger.error('[DELETE /api/chat/[chatId]] Error:', error);
    return handleApiError(error);
  }
}
