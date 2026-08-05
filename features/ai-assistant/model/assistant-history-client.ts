/**
 * @file features/ai-assistant/model/assistant-history-client.ts
 * Assistant history client contract.
 *
 * Purpose: Defines the provider-neutral client operations used by history UI.
 * Used in: history sidebar hooks and application HTTP client composition.
 */

export type {
  AssistantHistoryClient,
  AssistantHistoryItem,
  AssistantHistoryPage,
} from './assistant-persistence';
