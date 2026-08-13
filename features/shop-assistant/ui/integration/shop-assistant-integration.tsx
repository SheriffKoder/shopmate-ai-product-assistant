/**
 * @file features/shop-assistant/ui/integration/shop-assistant-integration.tsx
 * Shop Assistant integration: artifact panel hydration + stream-part chat mounts.
 * Used in: components/layout-wrapper.tsx.
 * Used for: Hydrating artifacts and remounting cards/cart from persisted data parts.
 *
 * Function Index:
 * ShopAssistantDataStreamHandler: Hydrate artifact panel state from stream parts.
 * ShopAssistantIntegration: Mount the ShopMate-flavored assistant shell.
 *
 * Steps:
 * 1. Forward artifact metadata/status into panel state, including fullscreen open.
 * 2. Hydrate completed artifact content from persisted data-artifactContent.
 * 3. Mount ChatWrapper with stream-part renderers and cart command context.
 */

'use client';

import { Suspense, useCallback, useMemo } from 'react';
import { useCart } from '@/features/cart/hooks/use-cart';
import { ChatWrapper } from '@/features/ai-assistant/chat-wrapper';
import { DataStreamHandler } from '@/features/ai-assistant/data-stream/data-stream-handler';
import { generateUUID } from '@/features/ai-assistant/lib/utils';
import { useArtifact } from '@/features/ai-assistant/components/artifacts/hooks/use-artifact';
import { getArtifactContentPart } from '@/features/ai-assistant/lib/artifact-content-part';
import type { DataUIPart } from 'ai';
import type { AssistantUIDataTypes } from '@/features/ai-assistant/types/stream';
import { createShopAssistantConfig } from './shop-assistant-config';
import { createShopAssistantCommandHandler } from '../../model/sources/shop-assistant-command-handler';

/**
 * Hydrate the artifact panel from stream parts. Cards and cart remount from message parts.
 */
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
      case 'data-artifactContent': {
        const artifactContent = getArtifactContentPart(part);
        if (artifactContent) {
          setArtifact((current) => ({
            ...current,
            documentId: artifactContent.id || current.documentId,
            title: artifactContent.title || current.title,
            kind: artifactContent.kind || current.kind,
            content: artifactContent.content ?? current.content,
            status: 'complete',
          }));
        }
        break;
      }
      case 'data-textDelta':
      case 'data-sheetDelta':
        setArtifact((current) => ({ ...current, content: `${current.content}${String(part.data)}` }));
        break;
      case 'data-chartDelta':
        setArtifact((current) => ({ ...current, content: String(part.data) }));
        break;
    }
  }, [setArtifact]);

  return <DataStreamHandler onDataPart={handleDataPart} />;
}

/**
 * Mount the ShopMate-flavored assistant experience.
 */
export function ShopAssistantIntegration() {
  const { cart, addItem, removeItem, decreaseQuantity, increaseQuantity } = useCart();
  const chatId = useMemo(function createAssistantChatId() {
    return generateUUID();
  }, []);
  const assistantConfig = createShopAssistantConfig();
  const commandHandler = useMemo(
    function createCommandHandler() {
      return createShopAssistantCommandHandler({ addItem, removeItem, decreaseQuantity, increaseQuantity });
    },
    [addItem, removeItem, decreaseQuantity, increaseQuantity],
  );

  return (
    <Suspense fallback={null}>
      <ChatWrapper
        chatId={chatId}
        streamPartRenderers={assistantConfig.streamPartRenderers}
        endpoint={assistantConfig.endpoint}
        suggestions={assistantConfig.suggestions}
        toolRendererContext={{ cart, onCommand: commandHandler }}
      />
    </Suspense>
  );
}
