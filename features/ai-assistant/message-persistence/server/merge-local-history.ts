import { supabaseAdmin } from '@/shared/infrastructure/supabase/server/create-service-client';
import { getSupabaseTableNames } from '@/shared/config/table-names';
import type { LocalChatHistoryItem } from '../model/local-chat-history';
import { generateUUID } from '@/features/ai-assistant/lib/utils';

const tableNames = getSupabaseTableNames();

export async function mergeLocalChatHistory(
  userId: string,
  chats: LocalChatHistoryItem[],
): Promise<void> {
  if (chats.length === 0) return;

  const chatRows = chats.map((chat) => ({
    id: chat.id,
    userId,
    title: chat.title,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
  }));

  const { error: chatError } = await supabaseAdmin
    .from(tableNames.chats)
    .upsert(chatRows, { onConflict: 'id' });

  if (chatError) throw new Error(`Failed to merge chats: ${chatError.message}`);

  const messageRows = chats.flatMap((chat) => chat.messages.map((message) => ({
    id: generateUUID(),
    chatId: chat.id,
    role: message.role === 'assistant' || message.role === 'system' ? message.role : 'user',
    parts: message.parts || [],
    attachments: (message as any).attachments || [],
    createdAt: chat.updatedAt,
  })));

  if (messageRows.length === 0) return;

  const { error: messageError } = await supabaseAdmin
    .from(tableNames.messages)
    .upsert(messageRows, { onConflict: 'id' });

  if (messageError) throw new Error(`Failed to merge messages: ${messageError.message}`);
}
