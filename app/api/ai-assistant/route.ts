/**
 * @file app/api/ai-assistant/route.ts
 * AI Assistant API Route
 *
 * Purpose: Thin Next.js route adapter for the reusable assistant request handler.
 * Used in: Browser chat submissions from features/ai-assistant/chat-container.tsx.
 * Used for: Exposing the assistant HTTP endpoint without owning parsing, persistence, or routing logic.
 *
 * Function Index:
 * POST: Delegates the request to handleAssistantRequest with the current runtime adapter.
 *
 * Steps:
 * 1. Keep route-level Next.js configuration close to the route.
 * 2. Pass the incoming Request to the reusable assistant handler.
 * 3. Inject the current default runtime so business behavior remains replaceable.
 */

import { handleAssistantRequest } from '@/features/ai-assistant/server/handle-assistant-request';
import { shopAssistantRuntime } from '@/features/shop-assistant/server/shop-assistant-runtime';
import { assistantChatPersistence } from '@/features/ai-assistant/message-persistence/server/supabase-assistant-persistence';

// Allow streaming responses up to 30 seconds.
export const maxDuration = 30;

/**
 * Delegate the assistant request flow to the feature server handler.
 *
 * @param req - Incoming assistant HTTP request.
 * @returns Streaming assistant response or normalized error response.
 */
export async function POST(req: Request): Promise<Response> {
  // 1. Keep the route as an adapter and let the assistant feature own the request lifecycle.
  return handleAssistantRequest(req, shopAssistantRuntime, assistantChatPersistence);
}
