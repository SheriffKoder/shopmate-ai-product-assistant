/**
 * Chat Database Queries
 * 
 * Purpose: Database operations for chat and message management
 * Used in: Chat API route, message persistence
 * Why: Centralized database queries for chat operations
 * 
 * How it works:
 * 1. Uses supabaseAdmin client for server-side operations
 * 2. Handles errors gracefully with logging
 * 3. Returns null on errors (caller can handle)
 * 4. Provides type-safe operations using Chat and Message types
 */

import { supabaseAdmin } from '@/shared/supabase/server/create-service-client';
import type { Chat, ChatInsert, Message, MessageInsert } from '@/lib/supabase/types';
import { logger } from '@/features/ai-assistant/lib/logger';
import { getSupabaseTableNames } from '@/shared/config/table-names';

const tableNames = getSupabaseTableNames();

/**
 * Create a new chat
 * 
 * Steps:
 * 1. Validate input (id, userId, title)
 * 2. Insert chat record into database
 * 3. Return created chat or null if error
 * 
 * @param id - Chat ID (UUID, typically generated on client)
 * @param userId - User ID who owns this chat
 * @param title - Chat title (auto-generated from first message)
 * @returns Created chat object or null if error
 * 
 * @example
 * ```typescript
 * const chat = await createChat({
 *   id: 'chat-uuid-here',
 *   userId: 'user-uuid-here',
 *   title: 'New Chat'
 * });
 * if (chat) {
 *   console.log('Chat created:', chat.id);
 * }
 * ```
 */
export async function createChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}): Promise<Chat | null> {
  try {
    //////////////////////////////////
    // Validate Input: Ensure required fields are provided
    // Why: All fields are required for chat creation
    // How: Check if id, userId, and title exist and are not empty
    //////////////////////////////////
    if (!id || id.trim() === '') {
      logger.warn('[createChat] Missing or empty id');
      return null;
    }

    if (!userId || userId.trim() === '') {
      logger.warn('[createChat] Missing or empty userId');
      return null;
    }

    if (!title || title.trim() === '') {
      logger.warn('[createChat] Missing or empty title');
      return null;
    }

    //////////////////////////////////
    // Prepare Chat Data: Build insert object
    // Why: Supabase requires specific format
    // How: Map function parameters to database columns
    //////////////////////////////////
    const chatData: ChatInsert = {
      id: id.trim(),
      userId: userId.trim(),
      title: title.trim(),
    };

    logger.info(`[createChat] Creating chat with id: ${chatData.id}, title: ${chatData.title}`);

    //////////////////////////////////
    // Insert Chat: Add new chat to database
    // Why: Creates new chat record
    // How: Uses Supabase insert with select to return created record
    //////////////////////////////////
    const { data, error } = await supabaseAdmin
      .from(tableNames.chats)
      .insert(chatData)
      .select()
      .single();

    //////////////////////////////////
    // Error Handling: Check for database errors
    // Why: Supabase operations can fail (duplicate id, foreign key violation, etc.)
    // How: Log error and return null for caller to handle
    //////////////////////////////////
    if (error) {
      logger.error('[createChat] Supabase error:', error);
      
      // Check for duplicate id error
      if (error.code === '23505') { // PostgreSQL unique violation
        logger.warn(`[createChat] Chat with id ${id} already exists`);
      }
      
      return null;
    }

    //////////////////////////////////
    // Success: Return created chat
    // Why: Caller needs the chat object with generated timestamps
    // How: Cast data to Chat type (Supabase returns correct structure)
    //////////////////////////////////
    logger.info(`[createChat] Successfully created chat: ${data.id}`);
    return data as Chat;
  } catch (error) {
    //////////////////////////////////
    // Exception Handling: Catch unexpected errors
    // Why: Network issues, type errors, etc. can occur
    // How: Log and return null
    //////////////////////////////////
    logger.error('[createChat] Unexpected error:', error);
    return null;
  }
}

/**
 * Get chat by ID
 * 
 * Steps:
 * 1. Validate input (id)
 * 2. Query Chat table by ID
 * 3. Return chat or null if not found
 * 
 * @param id - Chat ID (UUID)
 * @returns Chat object or null if not found
 * 
 * @example
 * ```typescript
 * const chat = await getChatById({ id: 'chat-uuid-here' });
 * if (chat) {
 *   console.log('Found chat:', chat.title);
 * } else {
 *   console.log('Chat not found');
 * }
 * ```
 */
export async function getChatById({
  id,
}: {
  id: string;
}): Promise<Chat | null> {
  try {
    //////////////////////////////////
    // Validate Input: Ensure ID is provided
    // Why: ID is required for query
    //////////////////////////////////
    if (!id || id.trim() === '') {
      logger.warn('[getChatById] Missing or empty id');
      return null;
    }

    logger.info(`[getChatById] Fetching chat with id: ${id}`);

    //////////////////////////////////
    // Query Chat: Search by ID
    // Why: ID is primary key, so we expect at most one result
    // How: Use eq() to filter by id, single() to get one result
    //////////////////////////////////
    const { data, error } = await supabaseAdmin
      .from(tableNames.chats)
      .select('*')
      .eq('id', id.trim())
      .single();

    //////////////////////////////////
    // Error Handling: Check for database errors
    // Why: Chat not found is not an error - return null
    // How: Check error code - PGRST116 means no rows found
    //////////////////////////////////
    if (error) {
      // Chat not found is not an error - return null
      if (error.code === 'PGRST116') {
        logger.info(`[getChatById] Chat not found with id: ${id}`);
        return null;
      }
      
      logger.error('[getChatById] Supabase error:', error);
      return null;
    }

    //////////////////////////////////
    // Success: Return found chat
    // Why: Caller needs the chat object
    // How: Cast data to Chat type
    //////////////////////////////////
    logger.info(`[getChatById] Successfully found chat: ${data.id}`);
    return data as Chat;
  } catch (error) {
    //////////////////////////////////
    // Exception Handling: Catch unexpected errors
    // Why: Network issues, type errors, etc.
    // How: Log and return null
    //////////////////////////////////
    logger.error('[getChatById] Unexpected error:', error);
    return null;
  }
}

/**
 * Save messages to database
 * 
 * Steps:
 * 1. Validate input (messages array)
 * 2. Insert messages into database
 * 3. Return created messages or null if error
 * 
 * Note: This function can save multiple messages in a single transaction.
 * Each message is inserted as a separate row.
 * 
 * @param messages - Array of message objects to save (without createdAt, which is auto-generated)
 * @returns Array of created message objects or null if error
 * 
 * @example
 * ```typescript
 * const messages = await saveMessages({
 *   messages: [
 *     {
 *       id: 'msg-1',
 *       chatId: 'chat-123',
 *       role: 'user',
 *       parts: [{ type: 'text', text: 'Hello' }],
 *       attachments: [],
 *     },
 *     {
 *       id: 'msg-2',
 *       chatId: 'chat-123',
 *       role: 'assistant',
 *       parts: [{ type: 'text', text: 'Hi there!' }],
 *       attachments: [],
 *     },
 *   ],
 * });
 * ```
 */
export async function saveMessages({
  messages,
}: {
  messages: Omit<Message, 'createdAt'>[];
}): Promise<Message[] | null> {
  try {
    //////////////////////////////////
    // Validate Input: Ensure messages array is provided and not empty
    // Why: Need at least one message to save
    // How: Check if messages exists and has length > 0
    //////////////////////////////////
    if (!messages || messages.length === 0) {
      logger.warn('[saveMessages] Missing or empty messages array');
      return null;
    }

    //////////////////////////////////
    // Validate Each Message: Ensure required fields
    // Why: Each message needs chatId, role, and parts
    // How: Check each message in the array
    //////////////////////////////////
    for (const message of messages) {
      if (!message.chatId || message.chatId.trim() === '') {
        logger.warn('[saveMessages] Message missing chatId');
        return null;
      }
      if (!message.role) {
        logger.warn('[saveMessages] Message missing role');
        return null;
      }
      if (!message.parts || !Array.isArray(message.parts)) {
        logger.warn('[saveMessages] Message missing or invalid parts array');
        return null;
      }
    }

    logger.info(`[saveMessages] Saving ${messages.length} message(s) to database`);

    //////////////////////////////////
    // Prepare Message Data: Build insert objects
    // Why: Supabase requires specific format
    // How: Map message objects to MessageInsert format
    // Note: createdAt is omitted (auto-generated by database)
    //////////////////////////////////
    const messageData: MessageInsert[] = messages.map((msg) => ({
      id: msg.id,
      chatId: msg.chatId.trim(),
      role: msg.role,
      parts: msg.parts,
      attachments: msg.attachments || [],
    }));

    //////////////////////////////////
    // Insert Messages: Add messages to database
    // Why: Persist messages for chat history
    // How: Uses Supabase insert with select to return created records
    // Note: Multiple messages inserted in single operation (transaction)
    //////////////////////////////////
    const { data, error } = await supabaseAdmin
      .from(tableNames.messages)
      .insert(messageData)
      .select();

    //////////////////////////////////
    // Error Handling: Check for database errors
    // Why: Supabase operations can fail (foreign key violation, etc.)
    // How: Log error and return null for caller to handle
    //////////////////////////////////
    if (error) {
      logger.error('[saveMessages] Supabase error:', error);
      return null;
    }

    //////////////////////////////////
    // Success: Return created messages
    // Why: Caller may need the message objects with generated timestamps
    // How: Cast data to Message[] type
    //////////////////////////////////
    logger.info(`[saveMessages] Successfully saved ${data?.length || 0} message(s)`);
    return (data || []) as Message[];
  } catch (error) {
    //////////////////////////////////
    // Exception Handling: Catch unexpected errors
    // Why: Network issues, type errors, etc. can occur
    // How: Log and return null
    //////////////////////////////////
    logger.error('[saveMessages] Unexpected error:', error);
    return null;
  }
}

/**
 * Get messages by chat ID (ordered by createdAt)
 * 
 * Steps:
 * 1. Validate input (chatId)
 * 2. Query Message table by chatId
 * 3. Order by createdAt ascending (chronological order)
 * 4. Return array of messages (empty array if none found)
 * 
 * Note: Returns messages in chronological order (oldest first).
 * This matches the conversation flow.
 * 
 * @param chatId - Chat ID to get messages for
 * @returns Array of message objects (empty array if none found or error)
 * 
 * @example
 * ```typescript
 * const messages = await getMessagesByChatId({ chatId: 'chat-123' });
 * // messages is ordered by createdAt (oldest first)
 * messages.forEach(msg => {
 *   console.log(`${msg.role}: ${msg.parts[0]?.text}`);
 * });
 * ```
 */
export async function getMessagesByChatId({
  chatId,
}: {
  chatId: string;
}): Promise<Message[]> {
  try {
    //////////////////////////////////
    // Validate Input: Ensure chatId is provided
    // Why: chatId is required for query
    //////////////////////////////////
    if (!chatId || chatId.trim() === '') {
      logger.warn('[getMessagesByChatId] Missing or empty chatId');
      return [];
    }

    logger.info(`[getMessagesByChatId] Fetching messages for chat: ${chatId}`);

    //////////////////////////////////
    // Query Messages: Search by chatId
    // Why: Get all messages for a specific chat
    // How: Use eq() to filter by chatId, order() to sort by createdAt
    // Note: Order by ascending (oldest first) for chronological conversation
    //////////////////////////////////
    const { data, error } = await supabaseAdmin
      .from(tableNames.messages)
      .select('*')
      .eq('chatId', chatId.trim())
      .order('createdAt', { ascending: true });

    //////////////////////////////////
    // Error Handling: Check for database errors
    // Why: Database queries can fail
    // How: Log error and return empty array (not an error if no messages found)
    //////////////////////////////////
    if (error) {
      logger.error('[getMessagesByChatId] Supabase error:', error);
      return [];
    }

    //////////////////////////////////
    // Success: Return messages array
    // Why: Caller needs the messages (even if empty)
    // How: Cast data to Message[] type, default to empty array if null
    //////////////////////////////////
    const messages = (data || []) as Message[];
    logger.info(`[getMessagesByChatId] Successfully fetched ${messages.length} message(s) for chat: ${chatId}`);
    return messages;
  } catch (error) {
    //////////////////////////////////
    // Exception Handling: Catch unexpected errors
    // Why: Network issues, type errors, etc.
    // How: Log and return empty array (not an error state)
    //////////////////////////////////
    logger.error('[getMessagesByChatId] Unexpected error:', error);
    return [];
  }
}

/**
 * Get chats by user ID with pagination
 * 
 * Steps:
 * 1. Validate input (userId, limit)
 * 2. Build query with optional cursor-based pagination
 * 3. Fetch chats ordered by createdAt DESC
 * 4. Determine if there are more pages
 * 5. Return chats and hasMore flag
 * 
 * @param userId - User ID to fetch chats for
 * @param limit - Number of chats to return per page
 * @param endingBefore - Optional chat ID to fetch chats before (cursor-based pagination)
 * @returns Object with chats array and hasMore boolean
 * 
 * @example
 * ```typescript
 * const result = await getChatsByUserId({
 *   userId: 'user-uuid-here',
 *   limit: 20,
 *   endingBefore: 'chat-uuid-here' // optional
 * });
 * // Returns: { chats: Chat[], hasMore: boolean }
 * ```
 */
export async function getChatsByUserId({
  userId,
  limit = 20,
  endingBefore,
}: {
  userId: string;
  limit?: number;
  endingBefore?: string | null;
}): Promise<{ chats: Chat[]; hasMore: boolean }> {
  try {
    //////////////////////////////////
    // Validate Input: Ensure required fields
    // Why: userId and limit are required for query
    // How: Check if userId exists and limit is valid
    //////////////////////////////////
    if (!userId || userId.trim() === '') {
      logger.warn('[getChatsByUserId] Missing or empty userId');
      return { chats: [], hasMore: false };
    }

    if (limit <= 0) {
      logger.warn('[getChatsByUserId] Invalid limit, using default: 20');
      limit = 20;
    }

    // Fetch one extra to determine if there are more pages
    const extendedLimit = limit + 1;

    logger.info(`[getChatsByUserId] Fetching chats for user: ${userId}, limit: ${extendedLimit}`);

    //////////////////////////////////
    // Cursor-Based Pagination: Handle endingBefore parameter
    // Why: Efficient pagination using cursor instead of offset
    // How: If endingBefore provided, fetch chat first to get its createdAt, then query chats before that date
    //////////////////////////////////
    let query = supabaseAdmin
      .from(tableNames.chats)
      .select('*')
      .eq('userId', userId.trim())
      .order('createdAt', { ascending: false })
      .limit(extendedLimit);

    // If endingBefore is provided, fetch that chat first to get its createdAt
    if (endingBefore) {
      const { data: cursorChat, error: cursorError } = await supabaseAdmin
        .from(tableNames.chats)
        .select('createdAt')
        .eq('id', endingBefore.trim())
        .eq('userId', userId.trim())
        .single();

      if (cursorError || !cursorChat) {
        logger.warn(`[getChatsByUserId] Cursor chat not found: ${endingBefore}`);
        return { chats: [], hasMore: false };
      }

      // Query chats created before the cursor chat's createdAt
      query = query.lt('createdAt', cursorChat.createdAt);
    }

    //////////////////////////////////
    // Execute Query: Fetch chats from database
    // Why: Get paginated list of user's chats
    // How: Use Supabase query builder with filters and ordering
    //////////////////////////////////
    const { data, error } = await query;

    //////////////////////////////////
    // Error Handling: Check for database errors
    // Why: Supabase operations can fail
    // How: Log error and return empty result
    //////////////////////////////////
    if (error) {
      logger.error('[getChatsByUserId] Supabase error:', error);
      return { chats: [], hasMore: false };
    }

    //////////////////////////////////
    // Determine Has More: Check if there are more pages
    // Why: Client needs to know if pagination should continue
    // How: If we got limit+1 results, there are more pages
    //////////////////////////////////
    const chats = (data || []) as Chat[];
    const hasMore = chats.length > limit;

    // Return only the requested number of chats
    const result = {
      chats: hasMore ? chats.slice(0, limit) : chats,
      hasMore,
    };

    logger.info(`[getChatsByUserId] Successfully fetched ${result.chats.length} chat(s) for user: ${userId}, hasMore: ${hasMore}`);
    return result;
  } catch (error) {
    //////////////////////////////////
    // Exception Handling: Catch unexpected errors
    // Why: Network issues, type errors, etc.
    // How: Log and return empty result
    //////////////////////////////////
    logger.error('[getChatsByUserId] Unexpected error:', error);
    return { chats: [], hasMore: false };
  }
}

/**
 * Delete a chat and all its messages
 * 
 * Steps:
 * 1. Validate input (id)
 * 2. Delete all messages for this chat (explicit delete for clarity, though CASCADE handles it)
 * 3. Delete the chat record
 * 4. Return success status
 * 
 * Note: Messages have ON DELETE CASCADE, so they'll be deleted automatically,
 * but we delete them explicitly for clarity and to handle edge cases
 * 
 * @param id - Chat ID (UUID) to delete
 * @returns true if deleted successfully, false otherwise
 * 
 * @example
 * ```typescript
 * const deleted = await deleteChatById({ id: 'chat-uuid-here' });
 * if (deleted) {
 *   console.log('Chat deleted successfully');
 * }
 * ```
 */
export async function deleteChatById({ id }: { id: string }): Promise<boolean> {
  try {
    //////////////////////////////////
    // Input Validation: Ensure chatId is provided
    // Why: Prevent invalid database queries
    // How: Check if id is non-empty string
    //////////////////////////////////
    if (!id || id.trim() === '') {
      logger.warn('[deleteChatById] Missing or empty chat ID');
      return false;
    }

    const chatId = id.trim();

    logger.info(`[deleteChatById] Deleting chat and messages: ${chatId}`);

    //////////////////////////////////
    // Delete Messages: Delete all messages for this chat
    // Why: Explicitly delete messages before chat (though CASCADE handles it)
    // How: Delete from Message table where chatId matches
    // Note: ON DELETE CASCADE will handle this automatically, but explicit is clearer
    //////////////////////////////////
    const { error: messagesError } = await supabaseAdmin
      .from(tableNames.messages)
      .delete()
      .eq('chatId', chatId);

    if (messagesError) {
      logger.error('[deleteChatById] Error deleting messages:', messagesError);
      // Continue with chat deletion even if message deletion fails
      // (CASCADE will handle it, but we want to log the error)
    } else {
      logger.info(`[deleteChatById] Successfully deleted messages for chat: ${chatId}`);
    }

    //////////////////////////////////
    // Delete Chat: Delete the chat record
    // Why: Remove chat from database
    // How: Delete from Chat table where id matches
    // Note: This will also cascade delete messages if the explicit delete above failed
    //////////////////////////////////
    const { error: chatError, data } = await supabaseAdmin
      .from(tableNames.chats)
      .delete()
      .eq('id', chatId)
      .select();

    //////////////////////////////////
    // Error Handling: Check for database errors
    // Why: Supabase operations can fail
    // How: Log error and return false
    //////////////////////////////////
    if (chatError) {
      logger.error('[deleteChatById] Supabase error:', chatError);
      return false;
    }

    // Check if chat was actually deleted (data will be empty array if not found)
    if (!data || data.length === 0) {
      logger.warn(`[deleteChatById] Chat not found: ${chatId}`);
      return false;
    }

    logger.info(`[deleteChatById] Successfully deleted chat: ${chatId}`);
    return true;
  } catch (error) {
    //////////////////////////////////
    // Exception Handling: Catch unexpected errors
    // Why: Network issues, type errors, etc.
    // How: Log and return false
    //////////////////////////////////
    logger.error('[deleteChatById] Unexpected error:', error);
    return false;
  }
}
