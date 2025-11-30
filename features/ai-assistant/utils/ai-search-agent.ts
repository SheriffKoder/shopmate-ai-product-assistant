/**
 * AI Search Agent
 * 
 * Purpose: Shared AI-powered search functionality for ranking items by relevance
 * Used in: product-search-tool.ts, cart-info-tool.ts
 * Why: Centralizes AI search logic to avoid code duplication
 */

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod/v3';

/**
 * Generic item structure for AI analysis
 */
interface SearchableItem {
  id: string;
  name?: string;
  category?: string;
  description?: string;
  shortDescription?: string;
  price?: number;
  rating?: number;
  reviewsCount?: number;
  features?: string[];
  colors?: string[];
  keywords?: string[];
  [key: string]: any; // Allow additional properties
}

/**
 * Analyze and rank items by relevance to a query using AI
 * @param query - User's search query
 * @param items - Array of items to analyze (products or cart items)
 * @param itemType - Type of items being analyzed (for better context in prompts)
 * @returns Array of items ranked by relevance to the query
 */
export async function analyzeItemsWithAI<T extends SearchableItem>(
  query: string,
  items: T[],
  itemType: 'products' | 'cart-items' = 'products'
): Promise<T[]> {
  // If no items, return empty array
  if (items.length === 0) {
    return [];
  }

  const itemTypeLabel = itemType === 'products' ? 'PRODUCT' : 'CART ITEM';
  console.log('========================================');
  console.log(`AI ${itemTypeLabel} SEARCH - analyzeItemsWithAI`);
  console.log('Query:', query);
  console.log(`Total ${itemType} to analyze:`, items.length);
  console.log('========================================');

  try {
    // Prepare items for AI analysis
    const itemsForAnalysis = items.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      description: item.description,
      shortDescription: item.shortDescription,
      price: item.price,
      rating: item.rating,
      reviewsCount: item.reviewsCount,
      features: item.features,
      colors: item.colors,
      keywords: item.keywords,
    }));

    // Use structured output to get ranked item IDs
    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      system: `You are a ${itemType === 'products' ? 'product' : 'cart item'} search assistant. Analyze ${itemType} and rank them by relevance to the user's query. 

CRITICAL RULES:
1. **STRICT CATEGORY MATCHING**: If the user asks for a specific ${itemType === 'products' ? 'product type' : 'item type'} (e.g., "laptops", "smartphones", "tablets"), ONLY return ${itemType} from that exact category. Do NOT return ${itemType} from other categories.
2. **PRICE FILTERING**: If the user specifies a price range (e.g., "under $3000", "below $500", "cheaper items"), ONLY return ${itemType} that match that price criteria.
3. **RELEVANCE**: Only include ${itemType} that are actually relevant to the query. If no ${itemType} match, return an empty array.
4. **RANKING**: Rank ${itemType} by relevance - exact matches first, then close alternatives within the same category.

Consider:
- ${itemType === 'products' ? 'Product' : 'Item'} name, category, and description (category must match if specified)
- Features and specifications
- Price (must match if specified in query)
- Rating and reviews
- Keywords and colors
- Overall match to user intent

EXAMPLES:
- Query: "laptops under $3000" → ONLY return ${itemType} where category is "laptop" AND price <= 3000
- Query: "smartphones" → ONLY return ${itemType} where category is "smartphone"
- Query: "${itemType === 'products' ? 'gaming laptops' : 'cheaper items'}" → ${itemType === 'products' ? 'ONLY return items where category is "laptop" AND features/keywords mention gaming' : 'Return items sorted by price (lowest first)'}

Return a JSON array of ${itemType === 'products' ? 'product' : 'item'} IDs ranked by relevance, most relevant first. Only include ${itemType} that are actually relevant to the query. If no ${itemType} are relevant, return an empty array.`,
      prompt: `Analyze these ${itemType} and rank them by relevance to: "${query}"

${itemType === 'products' ? 'Products' : 'Cart Items'}:
${JSON.stringify(itemsForAnalysis, null, 2)}

Return a JSON array of ${itemType === 'products' ? 'product' : 'item'} IDs ranked by relevance, most relevant first.`,
      schema: z.object({
        rankedItemIds: z.array(z.string()).describe(`Array of ${itemType === 'products' ? 'product' : 'item'} IDs ranked by relevance to the query, most relevant first`),
      }),
      temperature: 0.3, // Lower temperature for more consistent ranking
    });

    const rankedIds = result.object.rankedItemIds;
    
    console.log(`AI ranked ${itemType} IDs:`, rankedIds);
    console.log(`Number of ${itemType} ranked:`, rankedIds.length);
    
    // Create a map for quick lookup
    const itemMap = new Map(items.map(item => [item.id, item]));
    
    // Sort items based on AI ranking - ONLY return items that were ranked by AI
    const rankedItems = rankedIds
      .map(id => itemMap.get(id))
      .filter((item): item is T => item !== undefined);
    
    console.log(`Final ranked ${itemType}:`, rankedItems.map(item => ({ 
      id: item.id, 
      name: item.name || 'Unknown', 
      category: item.category,
      price: item.price || 0
    })));
    console.log('========================================');
    
    // CRITICAL: Only return items that were ranked by AI
    // If AI didn't rank an item, it means it's not relevant to the query
    return rankedItems;
  } catch (error) {
    console.error('========================================');
    console.error(`ERROR in AI ${itemType} analysis:`, error);
    console.error('Query:', query);
    console.error(`Falling back to ${itemType === 'products' ? 'rating-based' : 'name-based'} sort`);
    console.error('========================================');
    // Fallback: return items sorted appropriately
    if (itemType === 'products') {
      return (items as any[]).sort((a, b) => (b.rating || 0) - (a.rating || 0)) as T[];
    } else {
      return items.sort((a, b) => {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB);
      });
    }
  }
}

