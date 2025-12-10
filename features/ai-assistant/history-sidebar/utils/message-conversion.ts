/**
 * Message Conversion Utilities
 * 
 * Purpose: Convert database Message format to UIMessage format for useChat
 * Used in: Chat container when loading messages from database using params
 * Why: Database messages need to be converted to AI SDK's UIMessage format
 */

import type { UIMessage } from 'ai';
import type { Message } from '@/lib/supabase/types';

/**
 * Convert database Message to UIMessage format
 * 
 * Database Message structure:
 * - id, chatId, role, parts, attachments, createdAt
 * 
 * UIMessage structure (from AI SDK):
 * - id, role, parts, (optional: content, annotations, etc.)
 * 
 * @param message - Database message object
 * @returns UIMessage compatible with AI SDK's useChat
 * 
 * @example
 * ```typescript
 * const dbMessages = await getMessagesByChatId({ chatId });
 * const uiMessages = dbMessages.map(convertMessageToUIMessage);
 * ```
 */
export function convertMessageToUIMessage(message: Message): UIMessage {
  return {
    id: message.id,
    role: message.role as 'user' | 'assistant' | 'system',
    parts: message.parts || [],
    // Include attachments if present
    ...(message.attachments && message.attachments.length > 0 && {
      attachments: message.attachments,
    }),
  };
}

/**
 * Convert array of database messages to UIMessage array
 * 
 * @param messages - Array of database messages
 * @returns Array of UIMessages
 * 
 * @example
 * ```typescript
 * const dbMessages = await getMessagesByChatId({ chatId });
 * const uiMessages = convertMessagesToUIMessages(dbMessages);
 * ```
 */
export function convertMessagesToUIMessages(messages: Message[]): UIMessage[] {
  return messages.map(convertMessageToUIMessage);
}

