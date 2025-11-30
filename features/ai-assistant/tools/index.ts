/**
 * AI Tools Index
 * 
 * Purpose: Central export point for all AI assistant tools
 * Used in: app/api/ai-assistant/route.ts
 * Why: Provides a single import location for all tools
 */

export { createProductSearchTool } from './product-search/product-search-tool';
export { createCartInfoTool } from './cart-info/cart-info-tool';

