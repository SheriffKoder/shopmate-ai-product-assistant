/**
 * Shop Assistant Product Search Tool
 * 
 * Purpose: Creates the ShopMate product search tool for catalog search and product recommendations.
 * Used in: features/shop-assistant/server/agents.
 * Used for: Returning structured product results that adapter-owned UI can render as cards.
 * 
 * Function Index:
 * createProductSearchTool: Builds the dynamic AI SDK tool for product search.
 *
 * Returns structured data with:
 * - header: Section header text
 * - paragraph: AI-generated response text
 * - products: Array of matching products
 * - footer: Optional footer text
 *
 * Steps:
 * 1. Stream search status so the client can show progress.
 * 2. Rank catalog products with the adapter search helper.
 * 3. Stream matching product cards as transient data.
 * 4. Return final structured tool output for message rendering.
 */

import { dynamicTool, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod/v3';
import type { Product } from '@/features/catalog/model/product';
import type { CatalogSearchSort, CatalogSource } from '@/features/shop-assistant/model/catalog-source';

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
  catalogSource: CatalogSource,
  dataStream?: UIMessageStreamWriter<any>
) => dynamicTool({
  description: 'MANDATORY: Use this tool whenever a user asks about products, wants to buy something, asks to see products, requests recommendations, or searches for specific items. This tool displays products in visual cards that users can see. Examples: "I want to buy an AirPod" → use this tool, "show me smartphones" → use this tool, "what are the best laptops?" → use this tool, "recommend products under $500" → use this tool, "show me tablets" → use this tool, "what products do you have?" → use this tool. DO NOT just describe products from memory - always use this tool to show actual products from the catalog. Filter and return products that match the user\'s query based on name, category, price range, rating, or features.',
  inputSchema: z.object({
    query: z.string().describe('The user\'s search query or request. Extract keywords like product type (smartphone, laptop, tablet, etc.), price range, rating requirements, or specific features. Examples: "smartphones", "laptops under $1000", "best rated products", "gaming laptops", "products with 5G"'),
    category: z.string().optional().describe('Specific product category filter such as smartphone, laptop, tablet, smartwatch, or headphones.'),
    minPrice: z.number().optional().describe('Minimum product price when the user asks for products above a budget floor.'),
    maxPrice: z.number().optional().describe('Maximum product price when the user asks for products under or within a budget.'),
    color: z.string().optional().describe('Requested product color, if any.'),
    minRating: z.number().optional().describe('Minimum product rating from 0 to 5 when the user asks for highly rated products.'),
    keywords: z.array(z.string()).optional().describe('Specific feature, brand, or use-case keywords extracted from the request.'),
    maxResults: z.number().optional().describe('Maximum number of products to return. Default is 10. Use smaller numbers (3-5) for "best" or "top" queries, and larger numbers (10-20) for general browsing.'),
    sortBy: z.enum(['relevance', 'rating', 'price-low', 'price-high', 'reviews', 'name']).optional().describe('How to sort the results. Default is "relevance". Use "price-low" for budget options, "price-high" for premium, "reviews" for most reviewed.'),
  }),
  execute: async (input) => {
    const {
      query,
      category,
      minPrice,
      maxPrice,
      color,
      minRating,
      keywords,
      maxResults = 10,
      sortBy = 'relevance',
    } = input as {
      query: string;
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      color?: string;
      minRating?: number;
      keywords?: string[];
      maxResults?: number;
      sortBy?: CatalogSearchSort;
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

    // Search Catalog: Ask the adapter source for filtered products.
    // Why: Keeps mock/session data and future DB filters outside the reusable assistant contract.
    let matchingProducts: Product[] = [];
    
    try {
      matchingProducts = await catalogSource.searchProducts({
        query,
        category,
        minPrice,
        maxPrice,
        color,
        minRating,
        keywords,
        limit: maxResults,
        sortBy,
      });
    } catch (error) {
      console.error('Error in catalog product search:', error);
      matchingProducts = [];
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
