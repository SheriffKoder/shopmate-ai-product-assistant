/**
 * @file features/ai-assistant/lib/schemas.ts
 * Assistant Schema Compatibility Exports
 *
 * Purpose: Keeps older imports working while request schema ownership lives in the schema layer.
 * Used in: Transitional assistant modules that still import from features/ai-assistant/lib/schemas.ts.
 * Used for: Avoiding a breaking rename during the staged assistant refactor.
 *
 * Function Index:
 * aiAssistantRequestSchema: Backward-compatible schema export.
 * validateRequest: Backward-compatible throwing parser.
 * safeValidateRequest: Backward-compatible safe parser.
 *
 * Steps:
 * 1. Re-export the new schema owner under the previous name.
 * 2. Preserve the old validation function names.
 * 3. Remove this file in the cleanup phase after imports move to schema/.
 */

import { z } from 'zod';
import {
  assistantRequestSchema,
  type AssistantRequestBody,
} from '../schema/assistant-request-schema';

export const aiAssistantRequestSchema = assistantRequestSchema;
export type AIAssistantRequest = AssistantRequestBody;

/**
 * Validate and parse an assistant request body.
 *
 * @param body - Unknown request payload.
 * @returns Parsed assistant request body.
 */
export function validateRequest(body: unknown): AIAssistantRequest {
  // 1. Delegate validation to the schema-layer owner.
  return aiAssistantRequestSchema.parse(body);
}

/**
 * Safely validate an assistant request body.
 *
 * @param body - Unknown request payload.
 * @returns Success data or the Zod validation error.
 */
export function safeValidateRequest(body: unknown):
  | { success: true; data: AIAssistantRequest }
  | { success: false; error: z.ZodError } {
  // 1. Use safeParse for call sites that want to handle validation without throwing.
  const result = aiAssistantRequestSchema.safeParse(body);

  // 2. Normalize Zod's result shape to the compatibility API.
  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error };
}
