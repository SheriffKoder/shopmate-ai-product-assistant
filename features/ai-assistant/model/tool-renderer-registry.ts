/**
 * @file features/ai-assistant/model/tool-renderer-registry.ts
 * Assistant Tool Renderer Registry
 *
 * Purpose: Defines a generic renderer map for adapter-provided assistant tools.
 * Used in: features/ai-assistant/components/message-part-orchestrator-renderer.tsx and business adapter UI registries.
 * Used for: Letting the assistant core render arbitrary tool names without importing business tool UI.
 *
 * Function Index:
 * AssistantToolRendererProps: Common props passed to every registered tool renderer.
 * AssistantToolRenderer: Function signature for a registered tool renderer.
 * AssistantToolRendererRegistry: Lookup map from AI tool name to renderer function.
 *
 * Steps:
 * 1. The app adapter creates a registry keyed by tool name.
 * 2. MessagePartRenderer looks up a renderer by the dynamic tool part name.
 * 3. The adapter renderer receives generic context and casts it to its own business shape.
 */

import type { ReactNode } from 'react';

export interface AssistantToolRendererProps<TContext = any> {
  /** Dynamic tool part emitted by the AI SDK. */
  toolPart: any;
  /** Message id used for stable React keys. */
  messageId: string;
  /** Part index used for stable React keys. */
  partIndex: number;
  /** Adapter-owned UI context such as cart state or dispatchers. */
  context?: TContext;
}

export type AssistantToolRenderer<TContext = any> = (
  props: AssistantToolRendererProps<TContext>
) => ReactNode;

export type AssistantToolRendererRegistry<TContext = any> = Record<
  string,
  AssistantToolRenderer<TContext>
>;
