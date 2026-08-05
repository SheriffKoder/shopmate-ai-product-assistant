/**
 * @file features/ai-assistant/model/assistant-events.ts
 * Generic Assistant Data Events
 *
 * Purpose: Defines transport-level events without embedding product, cart, or application models.
 * Used in: Data-stream parsing, assistant integrations, and host event handlers.
 * Used for: Allowing business adapters to interpret application-specific payloads outside assistant-core.
 */

/** Generic event received from an assistant stream. */
export interface AssistantDataEvent<TPayload = unknown> {
  type: string;
  payload: TPayload;
  id?: string;
}

/** Generic tool lifecycle event. */
export interface AssistantToolEvent<TInput = unknown, TResult = unknown> {
  type: 'tool-start' | 'tool-result' | 'tool-error';
  toolName: string;
  input?: TInput;
  result?: TResult;
  error?: string;
}

/** Artifact event understood by generic assistant artifact UI. */
export interface AssistantArtifactEvent<TArtifact = unknown> {
  type: 'artifact';
  artifact: TArtifact;
}

/** Safe, user-facing progress state for one routed assistant operation. */
export type AssistantStepStatus = 'loading' | 'done' | 'error';

/**
 * Progress summary shown before the assistant's final response.
 * This intentionally describes observable work rather than private reasoning.
 */
export interface AssistantStepEvent {
  id: string;
  label: string;
  summary?: string;
  status: AssistantStepStatus;
}
