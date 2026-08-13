# Persist assistant thinking steps

## Goal

Persist completed assistant routing steps with the assistant response so a reopened chat can display the same progress summary. Live steps should still stream immediately during the response.

## Design

Use the existing `Message.parts` JSONB column. Add one structured part to the final assistant message:

```ts
{
  type: 'data-assistant-thinking-steps',
  data: AssistantStepEvent[]
}
```

The browser continues to receive `data-assistantStep` events as transient stream data. Transient events provide live UI updates; the structured message part provides durable history.

## Actionable tasks

### 1. Define the persisted message-part contract

References:

- [`features/ai-assistant/model/assistant-events.ts`](../model/assistant-events.ts)
- [`features/ai-assistant/types/stream.ts`](../types/stream.ts)
- [`features/ai-assistant/model/assistant-persistence.ts`](../model/assistant-persistence.ts)

Tasks:

- Define a provider-neutral `AssistantThinkingStepsPart` type.
- Keep it separate from transport-only `AssistantStepEvent` types where persistence needs a stable shape.
- Document that only completed request summaries are persisted.

Outcome: Generic assistant code has one typed contract for durable thinking-step parts.

### 2. Add request-scoped step collection

References:

- [`features/ai-assistant/server/assistant-step.ts`](../server/assistant-step.ts)
- [`features/ai-assistant/model/assistant-runtime.ts`](../model/assistant-runtime.ts)
- [`features/ai-assistant/server/handle-assistant-request.ts`](../server/handle-assistant-request.ts)
- [`features/shop-assistant/server/shop-assistant-runtime.ts`](../../shop-assistant/server/shop-assistant-runtime.ts)

Tasks:

- Create a collector owned by one assistant request.
- Continue writing live steps with `transient: true`.
- Add each emitted step to the request collector.
- Upsert lifecycle updates by step ID so `loading` and `done` become one step rather than duplicate rows.
- Ensure concurrent requests cannot share step state.

Outcome: The server has the complete step sequence when streaming finishes.

### 3. Attach steps to the final assistant message

References:

- [`features/ai-assistant/server/handle-assistant-request.ts`](../server/handle-assistant-request.ts)
- [`app/infrastructure/assistant/supabase/assistant-persistence.ts`](../../../app/infrastructure/assistant/supabase/assistant-persistence.ts)

Tasks:

- In the stream finish path, find the response assistant message.
- Append one `data-assistant-thinking-steps` part.
- Avoid adding the part when no steps were emitted.
- Avoid duplicate parts if finish handling is retried.

Outcome: The existing `Message.parts` JSONB value contains the durable summary without a schema migration.

### 4. Render persisted steps on history load

References:

- [`features/ai-assistant/components/message-list.tsx`](../components/message-list.tsx)
- [`features/ai-assistant/components/thinking-steps/thinking-steps.tsx`](../components/thinking-steps/thinking-steps.tsx)
- [`features/ai-assistant/components/message-part-orchestrator-renderer.tsx`](../components/message-part-orchestrator-renderer.tsx)

Tasks:

- Read `assistant-thinking-steps` parts from loaded assistant messages.
- Render completed historical steps without using the live provider state.
- Normalize persisted steps by ID when rendering, protecting the UI from older messages that contain duplicate lifecycle entries.
- Keep live steps limited to the current response while it is streaming.
- Render nothing when the step list is empty.

Outcome: Reopening a chat shows completed thinking steps, while new requests still update progressively.

### 5. Test and verify persistence behavior

References:

- [`app/api/ai-assistant/route.ts`](../../../app/api/ai-assistant/route.ts)
- [`app/api/ai-assistant/chat/[chatId]/messages/route.ts`](../../../app/api/ai-assistant/chat/[chatId]/messages/route.ts)
- [`lib/supabase/migrations/003_create_chat_and_message_tables.sql`](../../../lib/supabase/migrations/003_create_chat_and_message_tables.sql)

Checklist:

- [ ] A routed request streams steps one by one.
- [ ] The final assistant message contains one structured steps part.
- [ ] A request with no steps does not create an empty steps part.
- [ ] Refreshing or reopening the chat renders persisted steps.
- [ ] Empty reasoning content renders no text, trigger, or chevron.
- [ ] In-memory persistence can exercise the flow without Supabase.
- [ ] TypeScript compilation and lint pass.

Outcome: Thinking progress is both responsive during streaming and durable in conversation history.

## Future decision point

If steps later need analytics, search, independent retention, or per-step querying, migrate them to a dedicated `AssistantStep` table. Until then, message-part JSONB keeps the relationship local and avoids unnecessary schema complexity.
