/**
 * Request Validation Schemas
 * 
 * Purpose: Zod schemas for validating API requests
 * Used in: API routes for request validation
 * Why: Ensures type safety and prevents invalid requests from reaching business logic
 */

import { z } from 'zod';
import type { UIMessage } from 'ai';
import type { Product } from '../types/product';
import type { CartState } from '../types/cart';

/**
 * Schema for Product (matches Product interface)
 * FUTURE IMPLEMENTATION: Add more strict validation when product data is more structured
 */
export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  rating: z.number().min(0).max(5),
  shortDescription: z.string(),
  description: z.string(),
  price: z.number().min(0),
  reviewsCount: z.number().min(0),
  features: z.array(z.string()),
  image_url: z.string().nullable(),
  image_url_variations: z.array(z.string()).nullable().optional(),
  featured: z.boolean().optional(),
  keywords: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
});

/**
 * Schema for CartItem
 */
export const cartItemSchema = z.object({
  productId: z.string(),
  product: productSchema,
  quantity: z.number().min(1),
});

/**
 * Schema for CartState
 */
export const cartStateSchema = z.object({
  items: z.array(cartItemSchema),
  totalItems: z.number().min(0),
  totalPrice: z.number().min(0),
});

/**
 * Schema for UIMessage part
 * Note: UIMessage from AI SDK is complex, so we use a flexible schema
 * that validates the structure we need (text parts)
 * FUTURE IMPLEMENTATION: Add stricter validation when we know all part types we use
 */
const messagePartSchema = z.object({
  type: z.string(),
  text: z.string().optional(),
  // Allow other properties from AI SDK (tool calls, reasoning, etc.)
}).passthrough();

/**
 * Schema for UIMessage
 * Note: This is a simplified validation - UIMessage from AI SDK has many optional properties
 * We validate the structure we actually use (role, parts)
 * FUTURE IMPLEMENTATION: Add stricter validation when message structure is more defined
 */
const uiMessageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(['user', 'assistant', 'system', 'tool']),
  parts: z.array(messagePartSchema).optional(),
  content: z.string().optional(),
  // Allow other properties from AI SDK (annotations, toolInvocations, etc.)
}).passthrough();

/**
 * Schema for AI Assistant API request body
 * This is the main schema used to validate incoming requests
 */
export const aiAssistantRequestSchema = z.object({
  id: z.string().optional(), // Chat ID (optional, will be generated if not provided)
  messages: z.array(uiMessageSchema).min(1, 'At least one message is required'),
  products: z.array(productSchema).optional().default([]),
  cart: cartStateSchema.optional(),
});

/**
 * Type inferred from the request schema
 * Use this type instead of manually defining request types
 */
export type AIAssistantRequest = z.infer<typeof aiAssistantRequestSchema>;

/**
 * Validate and parse request body
 * 
 * @param body - Raw request body (unknown type)
 * @returns Validated and typed request object
 * @throws {z.ZodError} If validation fails
 * 
 * @example
 * ```typescript
 * try {
 *   const body = await req.json();
 *   const request = validateRequest(body);
 *   // request is now typed as AIAssistantRequest
 * } catch (error) {
 *   if (error instanceof z.ZodError) {
 *     return handleApiError(error);
 *   }
 * }
 * ```
 */
export function validateRequest(body: unknown): AIAssistantRequest {
  return aiAssistantRequestSchema.parse(body);
}

/**
 * Safe validation that returns result instead of throwing
 * Useful when you want to handle validation errors gracefully
 * 
 * @param body - Raw request body (unknown type)
 * @returns Validation result with success flag
 * 
 * @example
 * ```typescript
 * const result = safeValidateRequest(body);
 * if (!result.success) {
 *   return handleApiError(result.error);
 * }
 * const request = result.data;
 * ```
 */
export function safeValidateRequest(body: unknown): 
  | { success: true; data: AIAssistantRequest }
  | { success: false; error: z.ZodError } {
  const result = aiAssistantRequestSchema.safeParse(body);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, error: result.error };
}

// FUTURE IMPLEMENTATION: Add more schemas as features are added
// - Chat ID validation (when chat persistence is added)
// - User ID validation (when authentication is added)
// - Model selection validation (when model selection is added)
// - Visibility type validation (when chat visibility is added)
// - Rate limiting request validation (when rate limiting is added)
// - Stream resumption request validation (when stream resumption is added)

