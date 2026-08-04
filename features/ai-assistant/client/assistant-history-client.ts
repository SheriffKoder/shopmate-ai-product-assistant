/**
 * @file features/ai-assistant/client/assistant-history-client.ts
 * HTTP implementation of the generic assistant history contract.
 *
 * Purpose: Keeps history UI independent from database response and provider details.
 * Used in: the assistant history sidebar and chat deletion actions.
 */

import { assistantApiEndpoints } from '../model/api-endpoints';
import type {
  AssistantHistoryClient,
  AssistantHistoryPage,
} from '../model/assistant-history-client';

export const assistantHttpHistoryClient: AssistantHistoryClient = {
  async list({ cursor, limit = 20 }): Promise<AssistantHistoryPage> {
    const params = new URLSearchParams({ limit: String(limit) });

    if (cursor) {
      params.set('ending_before', cursor);
    }

    const response = await fetch(`${assistantApiEndpoints.history}?${params}`);

    if (!response.ok) {
      throw new Error('Failed to fetch chat history');
    }

    return response.json();
  },

  async delete({ chatId }): Promise<void> {
    const response = await fetch(`${assistantApiEndpoints.chat}/${chatId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete chat: ${response.status}`);
    }
  },
};
