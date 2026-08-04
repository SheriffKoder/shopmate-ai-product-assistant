/**
 * AI Agents Index
 * 
 * Purpose: Central export point for all AI agents
 * Used in: API routes and other parts of the application
 * Why: Provides a single import location for all agents
 */

export { classifyQuery } from './query-classifier/agent';
export type { QueryClassification } from './query-classifier/agent';

export { classifyProductQuery } from './product-classifier/agent';
export type { ProductClassification } from './product-classifier/agent';

export { processTechnicalDiscussionRequest } from './technical-discussion/agent';
export { processNotRelatedRequest } from './not-related/agent';
export { processRecommendationRequest } from './recommendation/agent';
export { processFilteringRequest } from './filtering/agent';
export { processPriceTrendRequest } from './price-trend/agent';
