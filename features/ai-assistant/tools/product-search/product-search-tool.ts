/**
 * Product Search Tool
 * 
 * Purpose: Tool for searching and recommending products based on user queries
 * Used in: app/api/ai-assistant/route.ts
 * 
 * Returns structured data with:
 * - header: Section header text
 * - paragraph: AI-generated response text
 * - products: Array of matching products
 * - footer: Optional footer text
 */

import { dynamicTool, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod/v3';
import { Product } from '../../types/product';
import { analyzeItemsWithAI } from '../../utils/ai-search-agent';

// Schema for product output (matches Product interface)
const productSchema = z.object({
  id: z.string().describe('Unique identifier for the product'),
  name: z.string().describe('Product name'),
  category: z.string().describe('Product category (e.g., "smartphone", "laptop", "tablet", "smartwatch", "headphones" - note: headphones and earbuds are in the same "headphones" category)'),
  rating: z.number().describe('Product rating (0-5 scale)'),
  shortDescription: z.string().describe('Brief one-line description'),
  description: z.string().describe('Full detailed description'),
  price: z.number().describe('Product price'),
  reviewsCount: z.number().describe('Number of customer reviews'),
  features: z.array(z.string()).describe('Array of product features'),
  colors: z.array(z.string()).describe('Array of available color options (e.g., ["white", "black", "blue"])'),
  keywords: z.array(z.string()).describe('Array of search keywords for better matching'),
  image_url: z.string().nullable().describe('Product image URL'),
});

// Schema for the product search tool output
const productSearchOutputSchema = z.object({
  header: z.string().describe('Section header text in markdown format (e.g., "## Best Smartphones")'),
  paragraph: z.string().describe('AI-generated friendly response text explaining the products. Format using markdown (use **bold** for emphasis, use double newlines for paragraphs).'),
  products: z.array(productSchema).describe('Array of products matching the user\'s query'),
  footer: z.string().optional().describe('Optional footer text in markdown format'),
});

export const createProductSearchTool = (
  products: Product[] = [],
  dataStream?: UIMessageStreamWriter<any>
) => dynamicTool({
  description: 'MANDATORY: Use this tool whenever a user asks about products, wants to buy something, asks to see products, requests recommendations, or searches for specific items. This tool displays products in visual cards that users can see. Examples: "I want to buy an AirPod" → use this tool, "show me smartphones" → use this tool, "what are the best laptops?" → use this tool, "recommend products under $500" → use this tool, "show me tablets" → use this tool, "what products do you have?" → use this tool. DO NOT just describe products from memory - always use this tool to show actual products from the catalog. Filter and return products that match the user\'s query based on name, category, price range, rating, or features.',
  inputSchema: z.object({
    query: z.string().describe('The user\'s search query or request. Extract keywords like product type (smartphone, laptop, tablet, etc.), price range, rating requirements, or specific features. Examples: "smartphones", "laptops under $1000", "best rated products", "gaming laptops", "products with 5G"'),
    maxResults: z.number().optional().describe('Maximum number of products to return. Default is 10. Use smaller numbers (3-5) for "best" or "top" queries, and larger numbers (10-20) for general browsing.'),
    sortBy: z.enum(['rating', 'price-low', 'price-high', 'reviews', 'name']).optional().describe('How to sort the results. Default is "rating" for best products, or "name" for alphabetical. Use "price-low" for budget options, "price-high" for premium, "reviews" for most reviewed.'),
  }),
  execute: async (input) => {
    const { query, maxResults = 10, sortBy = 'rating' } = input as {
      query: string;
      maxResults?: number;
      sortBy?: 'rating' | 'price-low' | 'price-high' | 'reviews' | 'name';
    };

    //////////////////////////////////
    // Stream Search Status: Notify client that search has started
    // Why: Provides immediate feedback to user
    //////////////////////////////////
    dataStream?.write({
      type: "data-productSearchStatus",
      data: { status: "searching" },
      transient: true, // UI-only, don't save to message history
    });

    // Use AI to analyze and rank products by relevance to the query
    let matchingProducts: Product[] = [];
    
    try {
      // Analyze products with AI to rank by relevance
      const rankedProducts = await analyzeItemsWithAI(query, products, 'products');
      
      // Apply additional sorting if specified (after AI relevance ranking)
      if (sortBy !== 'rating') {
        rankedProducts.sort((a, b) => {
          switch (sortBy) {
            case 'price-low':
              return a.price - b.price;
            case 'price-high':
              return b.price - a.price;
            case 'reviews':
              return b.reviewsCount - a.reviewsCount;
            case 'name':
              return a.name.localeCompare(b.name);
            default:
              return 0; // Keep AI ranking
          }
        });
      }
      
      // Limit results
      matchingProducts = rankedProducts.slice(0, maxResults);
    } catch (error) {
      console.error('Error in AI product search:', error);
      // Fallback: return all products sorted by rating
      matchingProducts = products
        .sort((a, b) => b.rating - a.rating)
        .slice(0, maxResults);
    }

    //////////////////////////////////
    // Stream Products: Send each product as it's found
    // Why: Real-time product cards appear as AI finds them
    // How: Streams each product individually for progressive UI updates
    //////////////////////////////////
    for (const product of matchingProducts) {
      dataStream?.write({
        type: "data-productCard",
        data: product,
        transient: true, // UI-only, don't save to message history
      });
    }

    //////////////////////////////////
    // Stream Completion Status: Notify client that search is complete
    // Why: Provides feedback on search results count
    //////////////////////////////////
    dataStream?.write({
      type: "data-productSearchStatus",
      data: { status: "complete", count: matchingProducts.length },
      transient: true,
    });

    // Normalize query to lowercase for header generation
    const queryLower = query.toLowerCase();

    // Generate header based on query
    const header = queryLower.includes('best') || queryLower.includes('top')
      ? `## Best ${query.replace(/best|top/gi, '').trim()}`
      : queryLower.includes('recommend')
      ? `## Recommendations`
      : `## Products Matching Your Search`;

    // Generate paragraph
    const paragraph = matchingProducts.length > 0
      ? `I found ${matchingProducts.length} product${matchingProducts.length > 1 ? 's' : ''} that match your search. Here are the results:`
      : `I couldn't find any products matching "${query}".`;

    // CRITICAL: Do NOT return all products if no matches found
    // The AI search should only return products it actually ranked as relevant
    // If AI found no matches, return empty array (don't show unrelated products)

    return {
      header,
      paragraph,
      products: matchingProducts,
      footer: matchingProducts.length > 0 ? 'Click on any product to learn more.' : undefined,
    };
  },
});


