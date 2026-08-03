/**
 * @file features/ai-assistant/server/assistant-chat-persistence.ts
 * Assistant Chat Persistence
 *
 * Purpose: Isolates development user lookup, chat creation, and assistant message persistence.
 * Used in: features/ai-assistant/server/handle-assistant-request.ts.
 * Used for: Keeping API routes and assistant runtime adapters free from Supabase persistence orchestration.
 *
 * Function Index:
 * loadOrCreateAssistantChat: Resolves the development user and loads or creates the chat row.
 * saveLatestUserMessage: Saves the newest user message when it is not already persisted.
 * saveAssistantMessages: Saves assistant messages after the stream finishes.
 *
 * Steps:
 * 1. Resolve the current development user through the existing user query boundary.
 * 2. Load or create a chat record for the request.
 * 3. Save the latest user message without duplicating retries.
 * 4. Save assistant messages after the stream completes.
 */

import type { UIMessage } from 'ai';
import {
  createChat,
  getChatById,
  getMessagesByChatId,
  saveMessages,
} from '@/lib/supabase/queries/chat-queries';
import { getOrCreateConstantUser } from '@/lib/supabase/queries/user-queries';
import { logger } from '../lib/logger';
import {
  extractTitleFromMessage,
  generateUUID,
  getLastUserMessage,
} from '../lib/utils';

interface AssistantChatSession {
  chatId: string;
}

/**
 * Load an existing assistant chat or create one for the development user.
 *
 * @param args.chatId - Existing chat id sent by the client, or undefined for a new chat.
 * @param args.messages - Current AI SDK UI messages used to create an initial chat title.
 * @returns The persisted chat session identifier.
 */
export async function loadOrCreateAssistantChat(args: {
  chatId?: string;
  messages: UIMessage[];
}): Promise<AssistantChatSession> {
  // 1. Keep the current development-user behavior behind persistence code.
  const user = await getOrCreateConstantUser();

  // 2. Fail fast if the development user cannot be resolved.
  if (!user) {
    logger.error('[assistant-persistence] Failed to get or create user');
    throw new Error('User not found. Please create a user first.');
  }

  // 3. Use the provided chat id when resuming history, otherwise create one.
  const finalChatId = args.chatId || generateUUID();

  // 4. Attempt to load the chat before creating it to preserve existing history.
  let chat = await getChatById({ id: finalChatId });

  if (!chat) {
    // 5. Derive a simple title from the latest user message for new chats.
    const lastUserMessage = getLastUserMessage(args.messages);
    const title = extractTitleFromMessage(lastUserMessage);

    // 6. Create the chat row through the existing Supabase query boundary.
    chat = await createChat({
      id: finalChatId,
      userId: user.id,
      title,
    });

    if (!chat) {
      logger.error('[assistant-persistence] Failed to create chat');
      throw new Error('Failed to create chat');
    }

    logger.info(`[assistant-persistence] Created new chat: ${chat.id}`);
  } else {
    logger.info(`[assistant-persistence] Using existing chat: ${chat.id}`);
  }

  return {
    chatId: chat.id,
  };
}

/**
 * Persist the latest user message when it has not already been saved.
 *
 * @param args.chatId - Persisted chat id that owns the message.
 * @param args.messages - Current AI SDK UI messages sent by the client.
 */
export async function saveLatestUserMessage(args: {
  chatId: string;
  messages: UIMessage[];
}): Promise<void> {
  // 1. useChat sends the full conversation, so save only the latest user message.
  const lastUserMessage = getLastUserMessage(args.messages);

  logger.info(`[assistant-persistence] Messages array length: ${args.messages.length}`);
  logger.info(`[assistant-persistence] Messages roles: ${args.messages.map((m) => m.role).join(', ')}`);

  if (!lastUserMessage) {
    logger.warn('[assistant-persistence] No user message found in messages array');
    logger.warn(
      `[assistant-persistence] Available messages: ${JSON.stringify(
        args.messages.map((m) => ({ id: m.id, role: m.role }))
      )}`
    );
    return;
  }

  logger.info(
    `[assistant-persistence] Found user message: ${lastUserMessage.id}, parts: ${
      lastUserMessage.parts?.length || 0
    }`
  );

  try {
    // 2. Check the existing rows by original UI message id to avoid duplicate saves on retries.
    const existingMessages = await getMessagesByChatId({ chatId: args.chatId });
    const messageExists = existingMessages.some(
      (message: { id: string }) => message.id === lastUserMessage.id
    );

    if (messageExists) {
      logger.info(
        `[assistant-persistence] User message already exists, skipping save: ${lastUserMessage.id}`
      );
      return;
    }

    // 3. Generate a database-safe UUID because UI message ids can be short client ids.
    const messageToSave = {
      id: generateUUID(),
      chatId: args.chatId,
      role: 'user' as const,
      parts: lastUserMessage.parts || [],
      attachments: (lastUserMessage as any).attachments || [],
    };

    logger.info(
      `[assistant-persistence] Saving user message: ${JSON.stringify({
        id: messageToSave.id,
        role: messageToSave.role,
        partsCount: messageToSave.parts.length,
        originalId: lastUserMessage.id,
      })}`
    );

    // 4. Persist through the shared chat query layer and keep streaming failures isolated.
    await saveMessages({
      messages: [messageToSave],
    });

    logger.info(`[assistant-persistence] Successfully saved user message: ${messageToSave.id}`);
  } catch (error) {
    logger.error('[assistant-persistence] Failed to save user message:', error);
    logger.error('[assistant-persistence] Error details:', JSON.stringify(error, null, 2));
  }
}

/**
 * Persist assistant messages after the stream finishes.
 *
 * @param args.chatId - Persisted chat id that owns the assistant messages.
 * @param args.messages - Final AI SDK messages returned by the stream lifecycle.
 */
export async function saveAssistantMessages(args: {
  chatId: string;
  messages: UIMessage[];
}): Promise<void> {
  try {
    // 1. Only assistant messages from the final stream result should be stored here.
    const assistantMessages = args.messages
      .filter((message) => message.role === 'assistant')
      .map((message) => ({
        id: generateUUID(),
        chatId: args.chatId,
        role: 'assistant' as const,
        parts: message.parts || [],
        attachments: (message as any).attachments || [],
      }));

    // 2. Skip empty saves because some tool-only responses can finish without assistant text.
    if (assistantMessages.length > 0) {
      await saveMessages({ messages: assistantMessages });
      logger.info(
        `[assistant-persistence] Saved ${assistantMessages.length} AI message(s) for chat: ${args.chatId}`
      );
    }
  } catch (error) {
    logger.error('[assistant-persistence] Failed to save AI messages:', error);
  }
}
