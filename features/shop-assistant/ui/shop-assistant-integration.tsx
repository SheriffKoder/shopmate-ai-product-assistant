/**
 * @file features/shop-assistant/ui/shop-assistant-integration.tsx
 * Shop assistant integration: mounts the reusable assistant shell with ShopMate
 * adapter pieces.
 * Used in: components/layout-wrapper.tsx.
 * Used for: Keeping app layout orchestration small while wiring ShopMate stream
 * handling and chat identity into the portable AI assistant UI.
 */

'use client';

import { Suspense, useCallback, useMemo } from 'react';
import { useCart } from '@/features/cart/hooks/use-cart';
import { ChatWrapper } from '@/features/ai-assistant/chat-wrapper';
import { DataStreamHandler } from '@/features/ai-assistant/data-stream/data-stream-handler';
import { generateUUID } from '@/features/ai-assistant/lib/utils';
import { createShopAssistantConfig } from './shop-assistant-config';
import { createShopAssistantCommandHandler } from '../model/shop-assistant-command-handler';
import { useArtifact } from '@/features/ai-assistant/components/artifacts/hooks/use-artifact';
import type { DataUIPart } from 'ai';
import type { AssistantUIDataTypes } from '@/features/ai-assistant/types/stream';

export function ShopAssistantDataStreamHandler() {
  const { setArtifact } = useArtifact();
  const handleDataPart = useCallback((part: DataUIPart<AssistantUIDataTypes>) => {
    switch (part.type) {
      case 'data-artifactId':
        setArtifact((current) => ({ ...current, documentId: String(part.data), isVisible: true }));
        break;
      case 'data-artifactTitle':
        setArtifact((current) => ({ ...current, title: String(part.data) }));
        break;
      case 'data-artifactKind':
        setArtifact((current) => ({ ...current, kind: String(part.data) as typeof current.kind }));
        break;
      case 'data-artifactStatus':
        setArtifact((current) => ({ ...current, status: part.data === 'complete' ? 'complete' : 'streaming' }));
        break;
      case 'data-artifactClear':
        setArtifact((current) => ({ ...current, content: '' }));
        break;
      case 'data-chartDelta':
        setArtifact((current) => ({ ...current, content: String(part.data) }));
        break;
    }
  }, [setArtifact]);

  return <DataStreamHandler onDataPart={handleDataPart} />;
}

/**
 * Props for {@link ShopAssistantIntegration}.
 */
/**
 * Mounts the ShopMate-flavored assistant experience.
 *
 * The generated chat id lives here so the global layout no longer knows about
 * assistant session mechanics.
 */
export function ShopAssistantIntegration() {
  const { cart, addItem, removeItem, decreaseQuantity, increaseQuantity } = useCart();
  //////////////////////////////////
  // Chat Identity: Generate once for the current mounted assistant session.
  // Why: Existing chat URLs can override this id, but new chats need a stable fallback.
  //////////////////////////////////
  const chatId = useMemo(function createAssistantChatId() {
    return generateUUID();
  }, []);
  const assistantConfig = createShopAssistantConfig();
  const commandHandler = useMemo(
    function createCommandHandler() {
      return createShopAssistantCommandHandler({ addItem, removeItem, decreaseQuantity, increaseQuantity });
    },
    [addItem, removeItem, decreaseQuantity, increaseQuantity]
  );

  return (
    <Suspense fallback={null}>
        <ChatWrapper
          chatId={chatId}
          toolRenderers={assistantConfig.toolRenderers}
          endpoint={assistantConfig.endpoint}
          suggestions={assistantConfig.suggestions}
          toolRendererContext={{ cart, onCommand: commandHandler }}
        />
      </Suspense>
  );
}
