/**
 * Product Classifier Agent
 * 
 * Purpose: Classifies product-related queries into subcategories (products, recommendation, filtering)
 * Used in: app/api/ai-assistant/route.ts
 * Why: Determines the specific type of product query before processing
 */

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { getProductClassifierPrompt } from './prompt';

export type ProductClassification = 'products' | 'recommendation' | 'filtering';

interface ProductClassifierRequest {
  query: string;
}

// Schema for structured output
const productClassificationSchema = z.object({
  classification: z.enum(['products', 'recommendation', 'filtering']).describe('The classification of the product-related query'),
});

/**
 * Classify a product-related query into one of three categories
 * @param request - Request containing the user query
 * @returns Classification result: 'products', 'recommendation', or 'filtering'
 */
export async function classifyProductQuery(request: ProductClassifierRequest): Promise<ProductClassification> {
  const { query } = request;

  // Get system prompt
  const systemPrompt = getProductClassifierPrompt();

  try {
    // Generate classification using structured output for more reliable results
    const result = await generateObject({
      model: openai('o3-mini'),
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: query,
        },
      ],
      schema: productClassificationSchema,
      temperature: 0.1, // Very low temperature for consistent classification
    });

    return result.object.classification;
  } catch (error) {
    // Fallback to 'products' if there's an error
    console.error('Error classifying product query:', error);
    console.warn(`Failed to classify product query: "${query}". Defaulting to "products".`);
    return 'products';
  }
}

