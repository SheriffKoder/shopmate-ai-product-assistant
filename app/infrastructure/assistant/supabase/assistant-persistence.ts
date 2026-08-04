/**
 * @file app/infrastructure/assistant/supabase/assistant-persistence.ts
 * Supabase assistant persistence adapter.
 *
 * Purpose: Maps the application's Supabase queries to the generic assistant persistence contract.
 * Used in: app/api/ai-assistant/route.ts.
 *
 * This file is intentionally outside features/ai-assistant. Replacing Supabase must only require
 * replacing this adapter and the application composition wiring.
 */

import type { UIMessage } from 'ai';
import {
  createChat,
  getChatById,
  getMessagesByChatId,
  saveMessages,
} from '@/lib/supabase/queries/chat-queries';
import { getOrCreateConstantUser } from '@/lib/supabase/queries/user-queries';
import { logger } from '@/features/ai-assistant/lib/logger';
import {
  extractTitleFromMessage,
  generateUUID,
  getLastUserMessage,
} from '@/features/ai-assistant/lib/utils';
import type { AssistantPersistence } from '@/features/ai-assistant/model/assistant-persistence';

async function loadOrCreateChat(args: {
  chatId?: string;
  messages: UIMessage[];
}): Promise<{ chatId: string }> {
  const user = await getOrCreateConstantUser();

  if (!user) {
    throw new Error('User not found. Please create a user first.');
  }

  const chatId = args.chatId || generateUUID();
  let chat = await getChatById({ id: chatId });

  if (!chat) {
    const title = extractTitleFromMessage(getLastUserMessage(args.messages));
    chat = await createChat({ id: chatId, userId: user.id, title });

    if (!chat) {
      throw new Error('Failed to create chat');
    }

    logger.info(`[assistant-persistence] Created new chat: ${chat.id}`);
  }

  return { chatId: chat.id };
}

async function saveLatestUserMessage(args: {
  chatId: string;
  messages: UIMessage[];
}): Promise<void> {
  const message = getLastUserMessage(args.messages);

  if (!message) {
    return;
  }

  try {
    const existingMessages = await getMessagesByChatId({ chatId: args.chatId });
    const alreadySaved = existingMessages.some((item: { id: string }) => item.id === message.id);

    if (alreadySaved) {
      return;
    }

    await saveMessages({
      messages: [{
        id: generateUUID(),
        chatId: args.chatId,
        role: 'user' as const,
        parts: message.parts || [],
        attachments: (message as any).attachments || [],
      }],
    });
  } catch (error) {
    logger.error('[assistant-persistence] Failed to save user message:', error);
  }
}

async function saveAssistantMessages(args: {
  chatId: string;
  messages: UIMessage[];
}): Promise<void> {
  try {
    const assistantMessages = args.messages
      .filter((message) => message.role === 'assistant')
      .map((message) => ({
        id: generateUUID(),
        chatId: args.chatId,
        role: 'assistant' as const,
        parts: message.parts || [],
        attachments: (message as any).attachments || [],
      }));

    if (assistantMessages.length > 0) {
      await saveMessages({ messages: assistantMessages });
    }
  } catch (error) {
    logger.error('[assistant-persistence] Failed to save AI messages:', error);
  }
}

export const assistantChatPersistence: AssistantPersistence = {
  loadOrCreateChat,
  saveLatestUserMessage,
  saveAssistantMessages,
};
