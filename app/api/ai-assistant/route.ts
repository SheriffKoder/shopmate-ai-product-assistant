/**
 * AI Assistant API Route
 * 
 * Purpose: HTTP endpoint for electronic products promotion and Q&A AI assistant
 * Used in: Next.js API routes
 * Why: Handles HTTP request/response, delegates business logic to agent
 */

import { UIMessage } from 'ai';
import { processProductAssistantRequest, maxDuration } from '@/features/ai-assistant/agents/products-cart/agent';
import { 
  classifyQuery, 
  classifyProductQuery,
  processTechnicalDiscussionRequest, 
  processNotRelatedRequest,
  processRecommendationRequest,
  processFilteringRequest,
} from '@/features/ai-assistant/agents';

// Re-export maxDuration for Next.js route configuration
export { maxDuration };

export async function POST(req: Request) {
  const {
    messages,
    products = [],
    cart,
  }: { 
    messages: UIMessage[]; 
    products?: any[];
    cart?: any;
  } = await req.json();

  // Extract the last user message for classification
  const lastMessage = messages[messages.length - 1];
  const userQuery = lastMessage?.parts
    ?.filter((p: any) => p.type === 'text')
    .map((p: any) => p.text)
    .join('') || '';

  // Classify the query
  const classification = await classifyQuery({ query: userQuery });
  
  // Console log the classification
  console.log('========================================');
  console.log('QUERY CLASSIFICATION:', classification);
  console.log('User Query:', userQuery);
  console.log('========================================');

  // Route to appropriate agent based on classification
  switch (classification) {
    case 'related':
      // Classify the product-related query into subcategories
      const productClassification = await classifyProductQuery({ query: userQuery });
      
      // Console log the product classification
      console.log('========================================');
      console.log('PRODUCT CLASSIFICATION:', productClassification);
      console.log('User Query:', userQuery);
      console.log('========================================');

      // Route to appropriate product agent based on sub-classification
      switch (productClassification) {
        case 'products':
          // Use the main product assistant agent for direct product display requests
          return await processProductAssistantRequest({
            messages,
            products,
            cart,
          });

        case 'recommendation':
          // Use recommendation agent for use cases, compatibility, and recommendations
          return await processRecommendationRequest({
            messages,
            products,
            cart,
          });

        case 'filtering':
          // Use filtering agent for price, budget, features, availability, brands
          return await processFilteringRequest({
            messages,
            products,
            cart,
          });

        default:
          // Fallback to main agent
          console.warn(`Unknown product classification: ${productClassification}. Using main agent.`);
          return await processProductAssistantRequest({
            messages,
            products,
            cart,
          });
      }

    case 'technical-discussion':
      // Use technical discussion agent
      return await processTechnicalDiscussionRequest({
        messages,
      });

    case 'notrelated':
      // Use not-related agent for simple apology response
      console.log('Routing to not-related agent');
      const notRelatedResult = await processNotRelatedRequest();
      console.log('Not-related agent response created');
      return notRelatedResult;

    default:
      // Fallback to main agent
      console.warn(`Unknown classification: ${classification}. Using main agent.`);
      return await processProductAssistantRequest({
        messages,
        products,
        cart,
      });
  }
}