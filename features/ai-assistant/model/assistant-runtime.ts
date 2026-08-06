/**
 * @file features/ai-assistant/model/assistant-runtime.ts
 * Assistant Runtime Contract
 *
 * Purpose: Defines the injectable business boundary used by the reusable assistant server handler.
 * Used in: features/ai-assistant/server/handle-assistant-request.ts and business runtime adapters.
 * Used for: Lets each app provide routing, tools, model selection, and finish hooks without changing core assistant flow.
 *
 * Function Index:
 * AssistantRuntimeRequest: Generic runtime input created after request parsing.
 * AssistantRuntime: Business adapter contract consumed by the reusable handler.
 *
 * Steps:
 * 1. The server handler parses reusable request fields and creates an AssistantRuntimeRequest.
 * 2. A business adapter implements AssistantRuntime.stream to classify, route, and create an AI stream.
 * 3. The server handler optionally calls AssistantRuntime.onFinish after persistence completes.
 */

import type { UIMessage, UIMessageStreamWriter } from 'ai';
import type { PersistenceMode } from '../message-persistence/model/persistence-mode';

/**
 * Parsed assistant request passed to runtime implementations.
 *
 * @template TBusinessContext - App-specific context such as product filters, cart state, tenant info, or user metadata.
 */
export interface AssistantRuntimeRequest<TBusinessContext = Record<string, unknown>> {
  /** Chat messages from the AI SDK UI transport. */
  messages: UIMessage[];
  /** Text extracted from the latest user message. */
  userQuery: string;
  /** App-specific data needed by a runtime, such as catalog or cart state. */
  businessContext: TBusinessContext;
  /** Selected model id when the client provides one. */
  modelId?: string;
  persistenceMode: PersistenceMode;
}

/**
 * Business-specific assistant behavior injected into the reusable server handler.
 *
 * @template TBusinessContext - App-specific context shape owned by the consuming application.
 */
export interface AssistantRuntime<TBusinessContext = Record<string, unknown>> {
  /** Route the request to the correct agent and return an AI SDK UI message stream. */
  stream: (
    request: AssistantRuntimeRequest<TBusinessContext>,
    dataStream?: UIMessageStreamWriter<any>
  ) => Promise<any>;
  /** Optional hook for business-specific side effects after the stream finishes. */
  onFinish?: (args: {
    request: AssistantRuntimeRequest<TBusinessContext>;
    messages: UIMessage[];
  }) => Promise<void> | void;
}
