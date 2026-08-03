/**
 * @file features/shop-assistant/server/shop-assistant-runtime.ts
 * Shop Assistant Runtime
 *
 * Purpose: Adapts the current ShopMate agent router to the reusable assistant runtime contract.
 * Used in: app/api/ai-assistant/route.ts.
 * Used for: Keeping ShopMate classification, routing, and product/cart context outside the assistant core.
 *
 * Function Index:
 * shopAssistantRuntime: Runtime implementation for ShopMate.
 *
 * Steps:
 * 1. Classify the user query with the existing query classifier.
 * 2. Rebuild the current agent request from generic business context.
 * 3. Delegate to the ShopMate router inside this adapter package.
 */

import type { AssistantRuntime } from '@/features/ai-assistant/model/assistant-runtime';
import { getAssistantModels } from '@/features/ai-assistant/server/assistant-model-provider';
import type { CartState } from '@/features/shop/model/cart';
import type { Product } from '@/features/shop/model/product';
import { classifyQuery } from './agents';
import { createMockCartSource } from './mock-cart-source';
import { createMockCatalogSource } from './mock-catalog-source';
import { routeToAgent, type AgentRequest } from './router';

/**
 * Runtime that preserves current ShopMate assistant behavior behind the adapter contract.
 */
export const shopAssistantRuntime: AssistantRuntime<Record<string, unknown>> = {
  async stream(request, dataStream) {
    // 1. Resolve validated request models once so every agent shares the same runtime config.
    const models = getAssistantModels(request.modelId);

    // 2. Keep current query classification behavior behind the runtime boundary.
    const classification = await classifyQuery({ query: request.userQuery, model: models.chat });

    // 3. Build adapter-owned data sources from the current request context.
    const products = request.businessContext.products as Product[] | undefined;
    const cart = request.businessContext.cart as CartState | undefined;
    const catalogSource = createMockCatalogSource(products);
    const cartSource = cart ? createMockCartSource(cart) : undefined;

    // 4. Adapt generic business context back into the existing ShopMate agent request shape.
    return routeToAgent(
      classification,
      {
        messages: request.messages,
        ...request.businessContext,
        models,
        catalogSource,
        cartSource,
        userQuery: request.userQuery,
      } as AgentRequest,
      request.userQuery,
      dataStream
    );
  },
};
