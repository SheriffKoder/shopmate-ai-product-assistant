/**
 * @file features/shop-assistant/server/request-extraction-agent.ts
 * Structured LLM request extraction for ShopMate store conversations.
 * Used in: shop-assistant-runtime.ts before catalog lookup and route planning.
 * Used for: Understanding natural language without using regex as routing truth.
 */

import { generateObject, type LanguageModel } from 'ai';
import { logger } from '@/features/ai-assistant/lib/logger';
import type { StoreRequest } from '../model/store-request';
import { storeRequestSchema, validateStoreRequest } from '../schema/store-request-schema';

/** Input required by the structured request extractor. */
interface StoreRequestExtractionInput {
  query: string;
  model: LanguageModel;
}

const EXTRACTION_PROMPT = `You extract a structured request for an electronics store assistant.

Extract the user's intent and constraints, but do not invent catalog facts, product ids, prices, or availability.
Also create catalogQuery: a concise, natural search phrase for the store catalog. Rewrite conversational wording into the product terms the catalog is likely to contain. For example, "do you have iphones?" becomes "iphone" and "I need something for travelling under $1000" becomes "electronics for travel". Do not include greetings, filler words, or a conversational question in catalogQuery.
Use a null value when a field is uncertain. Treat use cases such as travel, gaming, school, or photography as useCase context, not as product categories.
Use productTerms for names or product concepts the store search should understand.
Choose product-cards when the user asks to see products, comparison for side-by-side requests, table for tables/spreadsheets, and conversation otherwise.
Cart requests identify intent only; they do not authorize a mutation.`;

/** Extract and validate one structured store request from natural language. */
export async function extractStoreRequest(
  input: StoreRequestExtractionInput
): Promise<StoreRequest | null> {
  try {
    const result = await generateObject({
      model: input.model,
      system: EXTRACTION_PROMPT,
      prompt: input.query,
      schema: storeRequestSchema,
      temperature: 0.1,
    });

    return validateStoreRequest(result.object);
  } catch (error) {
    logger.warn('Structured store request extraction failed; using fallback extraction.', error);
    return null;
  }
}
