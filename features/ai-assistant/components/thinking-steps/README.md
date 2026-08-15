# Thinking Steps

Generic assistant UI for safe, user-facing progress during a turn. Business adapters emit steps; this folder only renders them.

## Files

| File | Role |
|---|---|
| [`thinking-steps.tsx`](./thinking-steps.tsx) | List + collapse under a resolution header |
| [`thinking-step-item.tsx`](./thinking-step-item.tsx) | One detail row (`loading` / `done` / `error` icon) |

## Event shape

Steps use [`AssistantStepEvent`](../../model/assistant-events.ts):

```ts
{
  id: string;           // stable; same id upserts loading → done
  label: string;
  summary?: string;
  status: 'loading' | 'done' | 'error';
  kind?: 'step' | 'resolution';  // default: step
}
```

Adapters write live progress with [`writeAssistantStep`](../../server/assistant-step.ts) as **transient** `data-assistantStep` parts (UI upsert only).

After the runtime finishes its step emissions, the request handler writes a **non-transient** `data-assistant-thinking-steps` snapshot onto the assistant message — the same persistence pattern as `data-productCards`. Helpers live in [`lib/thinking-steps-part.ts`](../../lib/thinking-steps-part.ts). That part is what survives refresh:

| Mode | Storage |
|---|---|
| Logged in (`database`) | Message `parts` in Supabase |
| Guest (`local`) | Message `parts` in `localStorage` via [`prepare-guest-chat-save.ts`](../../message-persistence/lib/prepare-guest-chat-save.ts) |

[`message-list.tsx`](../message-list.tsx) prefers live `assistantSteps` for the in-flight last message, otherwise reads the persisted part.

ShopMate labels and emission points: [`features/shop-assistant/lib/runtime-steps.ts`](../../../shop-assistant/lib/runtime-steps.ts).

## Collapse behavior

While work is in progress, the panel shows every **detail** step (`kind !== 'resolution'`).

After a **resolution** event arrives:

| Detail steps | UI |
|---|---|
| ≤ 2 | Stay expanded (resolution header not shown) |
| > 2 | Collapse under `[CircleCheck \| CircleX] {resolution.label}` + chevron |

- `CircleCheck` when `resolution.status === 'done'`
- `CircleX` when `resolution.status === 'error'`
- Expand the header to see the full detail list again

## Ownership

| Layer | Owns |
|---|---|
| `features/ai-assistant` | Transport (`data-assistantStep`), upsert, render, collapse |
| Business runtime (e.g. Shop Assistant) | Step ids, labels, when to emit loading/done/error/resolution |

Core never invents shop-specific copy. Adapters never mount this UI themselves — [`message-list.tsx`](../message-list.tsx) mounts `ThinkingSteps` above the reply.
