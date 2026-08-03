/**
 * Shop Assistant Cart Info Tool
 * 
 * Purpose: Creates the ShopMate cart information tool for cart display and item lookup.
 * Used in: features/shop-assistant/server/agents.
 * Used for: Returning structured cart display instructions that adapter-owned UI can render with controls.
 * 
 * Function Index:
 * cleanQuery: Removes modification words before matching product names.
 * createCartInfoTool: Builds the dynamic AI SDK tool for cart queries.
 *
 * Returns structured data with:
 * - header: Section header text
 * - paragraph: AI-generated response text
 * - cartItems: Array of cart items to display
 * - footer: Optional footer text
 *
 * Steps:
 * 1. Determine whether the user wants the full cart or specific items.
 * 2. Rank or filter cart items by the cleaned query.
 * 3. Stream the current cart state as transient data.
 * 4. Return final structured tool output for message rendering.
 */

import { dynamicTool, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod/v3';
import { CartState, CartItem } from '@/features/shop/model/cart';
import { searchInTarget, searchInProduct } from '../../lib/search-utils';
import { analyzeItemsWithAI } from '../../lib/ai-search-agent';

/**
 * Clean query by removing modification-related words
 * This helps extract the actual product identifier from modification requests
 */
function cleanQuery(query: string): string {
  const modificationWords = [
    'modify', 'modification', 'change', 'update', 'adjust', 'edit', 'alter',
    'remove', 'delete', 'can i', 'i want to', 'i would like to', 'please',
    'the', 'in', 'my', 'cart', 'from', 'of', 'quantity', 'item', 'items'
  ];
  
  let cleaned = query.toLowerCase().trim();
  
  // Remove modification words
  modificationWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleaned = cleaned.replace(regex, '');
  });
  
  // Clean up extra spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // If cleaned query is empty, return original query (fallback)
  return cleaned || query.toLowerCase().trim();
}

// Schema for the cart info tool output
const cartInfoOutputSchema = z.object({
  header: z.string().describe('Section header text in markdown format (e.g., "## Your Shopping Cart")'),
  paragraph: z.string().describe('AI-generated friendly response text explaining the cart contents. Format using markdown (use **bold** for emphasis, use double newlines for paragraphs).'),
  display: z.enum(['all', 'some']).describe('Display mode: "all" means show all items from cart (use current cart state directly), "some" means show only specific items (filter by productIds). Use "all" when user asks for all items or general cart queries. Use "some" when user asks for specific products.'),
  productIds: z.array(z.string()).optional().describe('Array of product IDs to display (only used when display is "some"). If query is for a specific product, return only that product ID.'),
  footer: z.string().optional().describe('Optional footer text in markdown format'),
});

export const createCartInfoTool = (
  cart: CartState,
  dataStream?: UIMessageStreamWriter<any>
) => dynamicTool({
  description: 'MANDATORY: Use this tool when users ask about their shopping cart, want to see cart items, want to modify cart items, or ask questions about items in their cart. Examples: "show me my cart" → use this tool, "what\'s in my cart?" → use this tool, "show me the iPhone in my cart" → use this tool with specific product, "remove item from cart" → use this tool, "how much is my cart?" → use this tool. CRITICAL: When users ask to modify, change, update, adjust, or remove items (e.g., "can I modify the iPhone?", "change quantity", "update item"), you MUST use this tool immediately to display the item with controls. Do NOT ask for clarification first - show the item so they can use the controls. DO NOT use this tool for general product questions - use productSearch instead. This tool is specifically for cart-related queries.',
  inputSchema: z.object({
    query: z.string().describe('The user\'s query about their cart. Can be "all" for all items, a product name/ID for specific item, or a general question about the cart. For modification requests, extract the product name/ID from the query (e.g., "modify the iPhone" → "iPhone", "change quantity of AirPods" → "AirPods"). Examples: "all", "show all items", "iPhone 15", "iPhone", "what\'s in my cart?", "how much does my cart cost?", "modify iPhone", "change AirPods quantity".'),
  }),
  execute: async (input) => {
    const { query } = input as {
      query: string;
    };

    const queryLower = query.toLowerCase().trim();

    // Determine if query is for all items or specific product
    const isAllQuery = queryLower === 'all' || 
                       queryLower.includes('all') || 
                       queryLower.includes('everything') ||
                       queryLower.includes('show my cart') ||
                       queryLower.includes('show cart') ||
                       queryLower.includes('my cart') ||
                       queryLower === 'cart';

    // Determine display mode and product IDs
    let display: 'all' | 'some' = 'all';
    let matchingProductIds: string[] = [];
    
    if (isAllQuery) {
      // For "all" queries, use display: 'all' (renderer will use cart directly)
      display = 'all';
    } else {
      // For specific product queries, use display: 'some' with filtered IDs
      display = 'some';
      
      // Clean the query to remove modification-related words
      const cleanedQuery = cleanQuery(query);
      
      // Use AI-powered search for filtering cart items (similar to product search)
      try {
        // Convert cart items to searchable format for AI analysis
        const searchableCartItems = cart.items.map(item => ({
          id: item.productId,
          name: item.product?.name,
          category: item.product?.category,
          description: item.product?.description,
          shortDescription: item.product?.shortDescription,
          price: item.product?.price,
          rating: item.product?.rating,
          reviewsCount: item.product?.reviewsCount,
          features: item.product?.features,
          colors: item.product?.colors,
          keywords: item.product?.keywords,
          quantity: item.quantity,
        }));
        
        const rankedItems = await analyzeItemsWithAI(cleanedQuery, searchableCartItems, 'cart-items');
        matchingProductIds = rankedItems.map(item => item.id);
      } catch (error) {
        console.error('Error in AI cart item search, falling back to basic search:', error);
        // Fallback to basic search if AI fails
        const matchingItems = cart.items.filter((item) => {
          const product = item.product;
          if (searchInProduct(cleanedQuery, product)) {
            return true;
          }
          return false;
        });
        matchingProductIds = matchingItems.map(item => item.productId);
      }
    }

    // Generate header
    const header = isAllQuery
      ? `## Your Shopping Cart`
      : matchingProductIds.length > 0
      ? `## Cart Item${matchingProductIds.length > 1 ? 's' : ''}`
      : `## Cart Information`;

    // Generate paragraph
    let paragraph = '';
    if (display === 'all') {
      // For "all" mode, we'll use the actual count in renderer
      paragraph = `Here's what's in your cart:`;
    } else if (matchingProductIds.length === 0) {
      const displayQuery = cleanQuery(query) || query;
      paragraph = `I couldn't find "${displayQuery}" in your cart. Your cart might be empty, or that product isn't in your cart yet.`;
    } else {
      paragraph = `I found ${matchingProductIds.length} matching item${matchingProductIds.length > 1 ? 's' : ''} in your cart:`;
    }

    // Generate footer
    const footer = (display === 'all' || matchingProductIds.length > 0)
      ? 'You can adjust quantities or remove items using the controls below each item.'
      : undefined;

    //////////////////////////////////
    // Stream Cart Update: Send current cart state to client
    // Why: Real-time cart updates appear immediately
    // How: Streams full cart state for UI synchronization
    //////////////////////////////////
    dataStream?.write({
      type: "data-cartUpdate",
      data: cart,
      transient: true, // UI-only, don't save to message history
    });

    return {
      header,
      paragraph,
      display,
      ...(display === 'some' && { productIds: matchingProductIds }),
      footer,
    };
  },
});
