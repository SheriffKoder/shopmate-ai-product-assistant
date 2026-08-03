/**
 * Agent Router
 * 
 * Purpose: Routes requests to appropriate AI agents based on query classification
 * Used in: API routes
 * Why: Separates routing logic from HTTP handling, makes code testable and maintainable
 */

import type { UIMessage, UIMessageStreamWriter } from 'ai';
import type { Product } from '@/features/shop/model/product';
import type { CartState } from '@/features/shop/model/cart';
import type { ShopMateUIDataTypes } from '../types/stream';
import { logger } from './logger';
import { createError } from './errors';
import {
  classifyQuery,
  classifyProductQuery,
  processTechnicalDiscussionRequest,
  processNotRelatedRequest,
  processRecommendationRequest,
  processFilteringRequest,
} from '../agents';
import { processProductAssistantRequest } from '../agents/products-cart/agent';
import type { QueryClassification } from '../agents';
import type { ProductClassification } from '../agents';

/**
 * Agent request type - matches what agents expect
 */
type AgentRequest = {
  messages: UIMessage[];
  products?: Product[];
  cart?: CartState;
};

/**
 * Route request to appropriate agent based on classification
 * 
 * @param classification - Query classification result ('related', 'technical-discussion', 'notrelated')
 * @param request - Agent request with messages, products, and cart
 * @param userQuery - Extracted user query string (for logging and sub-classification)
 * @param dataStream - Optional data stream writer for custom UI data types
 * @returns Streaming response from the selected agent
 * @throws {ShopMateError} If routing fails or agent errors
 * 
 * @example
 * ```typescript
 * const classification = await classifyQuery({ query: userQuery });
 * const stream = await routeToAgent(classification, request, userQuery, dataStream);
 * ```
 */
export async function routeToAgent(
  classification: QueryClassification,
  request: AgentRequest,
  userQuery: string,
  dataStream?: UIMessageStreamWriter<any>
): Promise<any> {
  try {
    logger.classification('query', classification, userQuery);

    switch (classification) {
      case 'related':
        return await routeToProductAgent(request, userQuery, dataStream);

      case 'technical-discussion':
        logger.info('Routing to technical discussion agent');
        return await processTechnicalDiscussionRequest({
          messages: request.messages,
          dataStream,
        });

      case 'notrelated':
        logger.info('Routing to not-related agent');
        // FUTURE IMPLEMENTATION: Update not-related agent to support dataStream
        return await processNotRelatedRequest();

      default:
        // Fallback to main agent for unknown classifications
        logger.warn(
          `Unknown classification: ${classification}. Using main agent as fallback.`
        );
        return await processProductAssistantRequest(request, dataStream);
    }
  } catch (error) {
    logger.error('Error in routeToAgent', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw createError.serverError('agent', `Failed to route request to agent: ${errorMessage}`);
  }
}

/**
 * Route product-related queries to appropriate product agent
 * 
 * @param request - Agent request with messages, products, and cart
 * @param userQuery - User query string for product classification
 * @param dataStream - Optional data stream writer for custom UI data types
 * @returns Streaming response from the selected product agent
 * @throws {ShopMateError} If classification or routing fails
 */
async function routeToProductAgent(
  request: AgentRequest,
  userQuery: string,
  dataStream?: UIMessageStreamWriter<any>
): Promise<any> {
  try {
    // Classify the product-related query into subcategories
    const productClassification = await classifyProductQuery({
      query: userQuery,
    });

    logger.classification('product', productClassification, userQuery);

    switch (productClassification) {
      case 'products':
        logger.info('Routing to main product assistant agent');
        return await processProductAssistantRequest(request, dataStream);

      case 'recommendation':
        logger.info('Routing to recommendation agent');
        return await processRecommendationRequest(request, dataStream);

      case 'filtering':
        logger.info('Routing to filtering agent');
        return await processFilteringRequest(request, dataStream);

      default:
        // Fallback to main agent for unknown product classifications
        logger.warn(
          `Unknown product classification: ${productClassification}. Using main agent as fallback.`
        );
        return await processProductAssistantRequest(request, dataStream);
    }
  } catch (error) {
    logger.error('Error in routeToProductAgent', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw createError.serverError(
      'classification',
      `Failed to classify product query: ${errorMessage}`
    );
  }
}

// FUTURE IMPLEMENTATION: Add more routing features as they're implemented
// - Chat ID routing (when chat persistence is added)
// - Model selection routing (when model selection is added)
// - Stream resumption routing (when stream resumption is added)
// - Rate limiting checks (when rate limiting is added)
// - Authentication checks (when authentication is added)
