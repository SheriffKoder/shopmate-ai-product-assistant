import { NextResponse } from 'next/server';
import { getOrCreateConstantUser } from '@/lib/supabase/queries/user-queries';
import { mergeLocalChatHistory } from '@/features/ai-assistant/message-persistence/server/merge-local-history';
import type { LocalChatHistoryItem } from '@/features/ai-assistant/message-persistence/model/local-chat-history';

export async function POST(request: Request) {
  try {
    const user = await getOrCreateConstantUser();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 });

    const body = (await request.json()) as { chats?: LocalChatHistoryItem[] };
    const chats = Array.isArray(body.chats) ? body.chats : [];
    await mergeLocalChatHistory(user.id, chats);

    return NextResponse.json({ mergedChats: chats.length });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to merge local history' },
      { status: 500 },
    );
  }
}
