/**
 * @file features/ai-assistant/providers/assistant-root-provider.tsx
 * Assistant root provider: composes reusable assistant contexts behind one shell.
 * Used in: ShopMate assistant integrations and future host app assistant mounts.
 * Used for: Hiding assistant provider internals from app layouts while allowing
 * host apps to inject their own invisible stream processor.
 */

'use client';

import type { ReactNode } from 'react';
import { DataStreamProvider } from '@/features/ai-assistant/data-stream/data-stream-provider';
import { FullscreenProvider } from '@/features/ai-assistant/providers/fullscreen-context';

/**
 * Props for {@link AssistantRootProvider}.
 */
interface AssistantRootProviderProps {
  /** The assistant UI subtree that needs fullscreen and stream contexts. */
  children: ReactNode;
  /** Optional host-app processor for streamed UI data parts. */
  streamHandler?: ReactNode;
}

/**
 * Composes the reusable assistant provider shell.
 *
 * @example
 * ```tsx
 * <AssistantRootProvider streamHandler={<MyStreamHandler />}>
 *   <AssistantWidget />
 * </AssistantRootProvider>
 * ```
 */
export function AssistantRootProvider({
  children,
  streamHandler = null,
}: AssistantRootProviderProps) {
  return (
    <FullscreenProvider>
      <DataStreamProvider>
        {children}
        {streamHandler}
      </DataStreamProvider>
    </FullscreenProvider>
  );
}
