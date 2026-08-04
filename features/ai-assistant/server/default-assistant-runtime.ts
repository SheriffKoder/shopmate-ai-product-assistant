/**
 * @file features/ai-assistant/server/default-assistant-runtime.ts
 * Default Assistant Runtime
 *
 * Purpose: Provides normal conversational behavior when no business adapter is injected.
 * Used in: Generic assistant API routes and runtime resolution.
 * Used for: Keeping agents and business tools optional.
 */

import { convertToModelMessages, streamText } from 'ai';
import type { AssistantRuntime } from '../model/assistant-runtime';
import { getAssistantModels } from './assistant-model-provider';

/** Generic runtime that streams a normal model response without business tools. */
export const defaultAssistantRuntime: AssistantRuntime = {
  async stream(request) {
    // 1. Resolve the configured model without requiring a business adapter.
    const models = getAssistantModels(request.modelId);

    // 2. Convert generic UI messages and stream a plain conversational response.
    return streamText({
      model: models.chat,
      messages: await convertToModelMessages(request.messages),
    }).toUIMessageStream();
  },
};
