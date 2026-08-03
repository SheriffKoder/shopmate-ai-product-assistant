/**
 * @file features/shop-assistant/ui/shop-assistant-integration.tsx
 * Shop assistant integration: mounts the reusable assistant shell with ShopMate
 * adapter pieces.
 * Used in: components/layout-wrapper.tsx.
 * Used for: Keeping app layout orchestration small while wiring ShopMate stream
 * handling and chat identity into the portable AI assistant UI.
 */

'use client';

import { Suspense, useMemo } from 'react';
import { ChatWrapper } from '@/features/ai-assistant/chat-wrapper';
import { DataStreamHandler } from '@/features/ai-assistant/data-stream/data-stream-handler';
import { generateUUID } from '@/features/ai-assistant/lib/utils';
import { AssistantRootProvider } from '@/features/ai-assistant/providers/assistant-root-provider';

/**
 * Props for {@link ShopAssistantIntegration}.
 */
interface ShopAssistantIntegrationProps {
  /** Whether the compact assistant is collapsed. */
  isChatCollapsed: boolean;
  /** Updates compact assistant collapse state from layout/header controls. */
  setIsChatCollapsed: (collapsed: boolean) => void;
}

/**
 * Mounts the ShopMate-flavored assistant experience.
 *
 * The generated chat id lives here so the global layout no longer knows about
 * assistant session mechanics.
 */
export function ShopAssistantIntegration({
  isChatCollapsed,
  setIsChatCollapsed,
}: ShopAssistantIntegrationProps) {
  //////////////////////////////////
  // Chat Identity: Generate once for the current mounted assistant session.
  // Why: Existing chat URLs can override this id, but new chats need a stable fallback.
  //////////////////////////////////
  const chatId = useMemo(function createAssistantChatId() {
    return generateUUID();
  }, []);

  return (
    <AssistantRootProvider streamHandler={<DataStreamHandler />}>
      <Suspense fallback={null}>
        <ChatWrapper
          chatId={chatId}
          isChatCollapsed={isChatCollapsed}
          setIsChatCollapsed={setIsChatCollapsed}
        />
      </Suspense>
    </AssistantRootProvider>
  );
}
