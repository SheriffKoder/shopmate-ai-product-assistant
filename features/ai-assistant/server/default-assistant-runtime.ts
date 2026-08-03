/**
 * @file features/ai-assistant/server/default-assistant-runtime.ts
 * Default Assistant Runtime
 *
 * Purpose: Adapts the current ShopMate agent router to the reusable assistant runtime contract.
 * Used in: app/api/ai-assistant/route.ts.
 * Used for: Preserving current behavior while phase 04 moves business-specific routing into a dedicated adapter.
 *
 * Function Index:
 * defaultAssistantRuntime: Transitional runtime implementation for ShopMate.
 *
 * Steps:
 * 1. Classify the user query with the existing query classifier.
 * 2. Rebuild the current agent request from generic business context.
 * 3. Delegate to the existing router until the business adapter extraction phase.
 */

import type { AssistantRuntime } from '../model/assistant-runtime';
import { classifyQuery } from '../agents';
import { routeToAgent, type AgentRequest } from '../lib/router';

/**
 * Transitional runtime that preserves current ShopMate assistant behavior.
 */
export const defaultAssistantRuntime: AssistantRuntime<Record<string, unknown>> = {
  async stream(request, dataStream) {
    // 1. Keep current query classification behavior behind the runtime boundary.
    const classification = await classifyQuery({ query: request.userQuery });

    // 2. Adapt generic business context back into the existing ShopMate agent request shape.
    return routeToAgent(
      classification,
      {
        messages: request.messages,
        ...request.businessContext,
      } as AgentRequest,
      request.userQuery,
      dataStream
    );
  },
};
