/**
 * History API Route
 * 
 * Purpose: HTTP endpoint for fetching user's chat history
 * Used in: Sidebar component for displaying chat list
 * Why: Provides paginated chat history for the sidebar
 */

import { NextRequest } from 'next/server';
import { getChatsByUserId } from '@/shared/infrastructure/supabase/queries/chat-queries';
import { getOrCreateConstantUser } from '@/shared/infrastructure/supabase/queries/user-queries';
import { handleApiError } from '@/features/ai-assistant/lib/errors';
import { logger } from '@/features/ai-assistant/lib/logger';

/**
 * GET handler for History API
 * 
 * Flow:
 * 1. Get user from session (or constant user for now)
 * 2. Parse pagination parameters (limit, ending_before)
 * 3. Fetch chats from database using getChatsByUserId
 * 4. Return paginated results
 * 
 * Query Parameters:
 * - limit (optional, default: 20) - Number of chats per page
 * - ending_before (optional) - Chat ID to fetch chats before (cursor-based pagination)
 * 
 * @param request - HTTP Request object
 * @returns JSON response with chats array and hasMore boolean
 */
export async function GET(request: NextRequest): Promise<Response> {
  try {
    // FUTURE IMPLEMENTATION: Get user from session
    // const session = await getSession(request);
    // if (!session?.user) {
    //   return handleApiError(new Error('Unauthorized'));
    // }
    // const userId = session.user.id;

    //////////////////////////////////
    // Get User: Get or create constant user
    // Why: Need user ID to fetch chats
    // How: Use getOrCreateConstantUser (will be replaced with session later)
    //////////////////////////////////
    const user = await getOrCreateConstantUser();
    if (!user) {
      logger.error('[GET /api/history] Failed to get or create user');
      return handleApiError(
        new Error('User not found. Please create a user first.')
      );
    }

    //////////////////////////////////
    // Parse Query Parameters: Extract pagination params
    // Why: Support cursor-based pagination
    // How: Get limit and ending_before from URL search params
    //////////////////////////////////
    const { searchParams } = request.nextUrl;
    const limitParam = searchParams.get('limit');
    const endingBefore = searchParams.get('ending_before');

    // Parse limit (default to 20, max 100)
    let limit = 20;
    if (limitParam) {
      const parsedLimit = Number.parseInt(limitParam, 10);
      if (!Number.isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100) {
        limit = parsedLimit;
      }
    }

    // Validate: Only one pagination parameter allowed
    if (searchParams.get('starting_after') && endingBefore) {
      return handleApiError(
        new Error('Only one of starting_after or ending_before can be provided.')
      );
    }

    logger.info(`[GET /api/history] Fetching chats for user: ${user.id}, limit: ${limit}, endingBefore: ${endingBefore || 'none'}`);

    //////////////////////////////////
    // Fetch Chats: Get paginated chats from database
    // Why: Return user's chat history
    // How: Call getChatsByUserId with pagination params
    //////////////////////////////////
    const result = await getChatsByUserId({
      userId: user.id,
      limit,
      endingBefore: endingBefore || null,
    });

    //////////////////////////////////
    // Return Response: Send paginated results
    // Why: Client needs chats and pagination info
    // How: Return JSON with chats array and hasMore boolean
    //////////////////////////////////
    return Response.json(result, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    // Centralized error handling
    logger.error('[GET /api/history] Error:', error);
    return handleApiError(error);
  }
}

// FUTURE IMPLEMENTATION: DELETE endpoint for deleting all chats
// export async function DELETE(request: NextRequest): Promise<Response> {
//   try {
//     const user = await getOrCreateConstantUser();
//     if (!user) {
//       return handleApiError(new Error('User not found'));
//     }
//
//     // Delete all chats for user
//     await deleteAllChatsByUserId({ userId: user.id });
//
//     return Response.json({ success: true });
//   } catch (error) {
//     logger.error('[DELETE /api/history] Error:', error);
//     return handleApiError(error);
//   }
// }
