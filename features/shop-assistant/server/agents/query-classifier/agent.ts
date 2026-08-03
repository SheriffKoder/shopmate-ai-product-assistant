/**
 * Query Classifier Agent
 * 
 * Purpose: Classifies user queries into categories (related, technical-discussion, notrelated)
 * Used in: app/api/ai-assistant/route.ts
 * Why: Determines if queries are related to the shop context before processing
 */

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { getQueryClassifierPrompt } from './prompt';

export type QueryClassification = 'related' | 'technical-discussion' | 'notrelated';

interface QueryClassifierRequest {
  query: string;
}

// Schema for structured output
const classificationSchema = z.object({
  classification: z.enum(['related', 'technical-discussion', 'notrelated']).describe('The classification of the user query'),
});

/**
 * Classify a user query into one of three categories
 * @param request - Request containing the user query
 * @returns Classification result: 'related', 'technical-discussion', or 'notrelated'
 */
export async function classifyQuery(request: QueryClassifierRequest): Promise<QueryClassification> {
  const { query } = request;

  // Get system prompt
  const systemPrompt = getQueryClassifierPrompt();

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
      schema: classificationSchema,
      temperature: 0.1, // Very low temperature for consistent classification
    });

    return result.object.classification;
  } catch (error) {
    // Fallback to 'related' if there's an error
    console.error('Error classifying query:', error);
    console.warn(`Failed to classify query: "${query}". Defaulting to "related".`);
    return 'related';
  }
}

