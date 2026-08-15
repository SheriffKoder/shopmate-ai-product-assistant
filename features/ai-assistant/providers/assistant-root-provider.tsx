/**
 * @file features/ai-assistant/providers/assistant-root-provider.tsx
 * Assistant root provider: composes reusable assistant contexts behind one shell.
 * Used in: ShopMate assistant integrations and future host app assistant mounts.
 * Used for: Hiding assistant provider internals from app layouts while allowing
 * host apps to inject their own invisible stream processor. Includes the shared
 * UserSessionProvider so demo login state is not wiped by multi-hook mounts.
 */

'use client';

import type { ReactNode } from 'react';
import { DataStreamProvider } from '../data-stream/data-stream-provider';
import { FullscreenProvider } from './fullscreen-context';
import { AssistantShellProvider } from './assistant-shell-context';
import { AssistantStyleProvider } from './assistant-style-context';
import { UserSessionProvider } from './user-session-context';

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
    <AssistantShellProvider>
      <AssistantStyleProvider>
        <UserSessionProvider>
          <FullscreenProvider>
            <DataStreamProvider>
              {children}
              {streamHandler}
            </DataStreamProvider>
          </FullscreenProvider>
        </UserSessionProvider>
      </AssistantStyleProvider>
    </AssistantShellProvider>
  );
}
