/**
 * @file features/ai-assistant/model/api-endpoints.ts
 * Assistant endpoint contracts.
 *
 * Purpose: Centralizes transport paths used by the reusable assistant.
 * Used in: assistant integration configuration and version-2 clients.
 */

/** Configurable assistant and persistence resource paths. */
export interface AssistantApiEndpoints {
  assistant: string;
  history: string;
  chat: string;
  document: string;
  user: string;
}

/** Canonical application endpoints used by the assistant. */
export const assistantApiEndpoints: AssistantApiEndpoints = {
  assistant: '/api/ai-assistant',
  history: '/api/ai-assistant/history',
  chat: '/api/ai-assistant/chat',
  document: '/api/ai-assistant/document',
  user: '/api/ai-assistant/user',
};
