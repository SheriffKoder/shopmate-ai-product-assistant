/**
 * @file features/ai-assistant/model/stream-part-renderer-registry.ts
 * Generic renderer map for persisted assistant data parts.
 * Used in: MessagePartRenderer and business adapter UI registries.
 * Used for: Mounting chat UI from data-* parts without importing business components.
 *
 * Function Index:
 * AssistantSendMessage: Submit a follow-up user turn from a mounted data-part UI.
 * AssistantStreamPartRendererProps: Props passed to every registered data-part renderer.
 * AssistantStreamPartRenderer: Function signature for a registered data-part renderer.
 * AssistantStreamPartRendererRegistry: Lookup map from part type to renderer.
 *
 * Steps:
 * 1. The app adapter creates a registry keyed by part type (for example data-productCards).
 * 2. MessagePartRenderer looks up a renderer by part.type and forwards sendMessage + status.
 * 3. The adapter renderer receives opaque context and casts it to its own shape.
 */

import type { ReactNode } from 'react';

/** Submit a visible follow-up user message from a stream-part UI (Find chips, discussion, …). */
export type AssistantSendMessage = (
  message: { text: string },
  options?: { body: any },
) => void;

/** Common props passed to every registered stream-part renderer. */
export interface AssistantStreamPartRendererProps<TContext = any> {
  /** Persisted data-* message part. */
  part: unknown;
  /** Message id used for stable React keys. */
  messageId: string;
  /** Part index used for stable React keys. */
  partIndex: number;
  /** Adapter-owned UI context such as cart state or command dispatchers. */
  context?: TContext;
  /** Optional chat submitter. Conversation metadata buttons use this; cards/cart ignore it. */
  sendMessage?: AssistantSendMessage;
  /** Chat status. Find chips wait until the current reply is no longer streaming. */
  status?: 'idle' | 'streaming' | 'submitted' | 'error' | 'ready';
  /** Whether this part belongs to the latest message. Older Find chips stay visible. */
  isLastMessage?: boolean;
}

/** Function signature for a registered stream-part renderer. */
export type AssistantStreamPartRenderer<TContext = any> = (
  props: AssistantStreamPartRendererProps<TContext>
) => ReactNode;

/** Lookup map from persisted data part type to renderer function. */
export type AssistantStreamPartRendererRegistry<TContext = any> = Record<
  string,
  AssistantStreamPartRenderer<TContext>
>;
