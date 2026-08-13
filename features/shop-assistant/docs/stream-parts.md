# Stream parts

What a stream part is, which ones Shop Assistant writes, and how chat remounts them.

## One sentence

A stream part is one typed chunk of an assistant message. Chat is a list of parts, not one string.

## Where they come from

The AI SDK streams a UI message over SSE. Each item in `message.parts` is a stream part. The runtime can also `dataStream.write(...)` extra parts while it runs.

```text
runtime / speaker
  → SSE message
    → message.parts[]
      → MessagePartRenderer
        → text | artifact preview | streamPartRenderers[part.type]
```

## Part kinds in this app

| Part type | What it is |
|---|---|
| `text` | The spoken reply |
| `reasoning` | Thinking steps |
| `dynamic-tool` | An AI tool call/result (`productSearch`, `createDocument`, …) |
| `data-*` | Custom UI payload written with `dataStream.write(...)` |

In Shop Assistant, **stream part** usually means those `data-*` payloads, not tool calls. The planner already chose the view. Render writes data. Chat mounts UI.

v1 durable cards lived on `dynamic-tool` (`toolName === 'productSearch'`). v2 does not emit fake tool parts for catalog or cart. See [`tools.md`](./tools.md).

## ShopMate `data-*` parts

| Type | Transient? | Who writes it | Who mounts it |
|---|---|---|---|
| `data-productCard` | yes | `server/render/store-output.ts` | live only; not saved |
| `data-productCards` | no | same | `ui/cards/product-cards.tsx` via stream-part registry |
| `data-cartUpdate` | yes | `server/render/cart.ts` | live only; not saved |
| `data-cart` | no | same | `ui/cart/cart-panel.tsx` via stream-part registry |
| `data-uiMetadata` | no | `server/render/ui-metadata.ts` | `ui/metadata/buttons.tsx` via stream-part registry |
| `data-artifactContent` | no | artifact helpers in `features/ai-assistant` | `DocumentPreview` + artifact panel |

Also streamed for the artifact panel: `data-artifactId`, `data-artifactTitle`, `data-artifactKind`, `data-artifactStatus`, `data-textDelta`, `data-sheetDelta`. Those hydrate panel state in `ui/integration/shop-assistant-integration.tsx`. Chat preview for sheets/documents comes from persisted `data-artifactContent`.

`data-uiMetadata` payload:

```ts
{
  type: 'buttons',
  items: [{ label: 'Tablets', value: 'tablet' }],
  maxPrice?: number | null,
}
```

Registry switches on `type`. Buttons UI is `Find` + `items.map`. Click calls `sendMessage({ text: 'Provide tablet from the catalog' })`. Unknown / `none` types return null. See [`conversation.md`](./conversation.md).

## Transient vs persisted

- `transient: true` — UI-only for the current stream. Not saved on the message. Example: `data-productCard`, `data-cartUpdate`.
- no `transient` — saved on the message. Refresh remounts UI. Example: `data-productCards`, `data-cart`, `data-uiMetadata`, `data-artifactContent`.

v2 remounts from persisted parts. Do not depend on transient singular cards after reload.

## How chat mounts them

1. Runtime render writes a non-transient `data-*` part.
2. Generic `MessagePartRenderer` looks up `streamPartRenderers[part.type]` and forwards `sendMessage`.
3. ShopMate registers keys in [`ui/integration/stream-part-registry.tsx`](../ui/integration/stream-part-registry.tsx).
4. Parsers in `lib/stream/` read the payload. Components in `ui/cards/`, `ui/cart/`, and `ui/metadata/` draw it.

The registry contract lives in `features/ai-assistant/model/stream-part-renderer-registry.ts`. `features/ai-assistant` must not import ShopMate UI. Context (cart, `onCommand`) is opaque and passed through `toolRendererContext`. `sendMessage` is optional; Find chips use it, cards/cart ignore it.

Artifacts are generic, so `data-artifactContent` is special-cased in `MessagePartRenderer` instead of the ShopMate registry.

## Display order

Stream order can write `data-uiMetadata` before speaker text. Chat still shows Find chips **under** the reply, and only after that reply finishes (`status` is not `streaming` / `submitted` on the last message). Older chips stay visible while a new turn streams.

`message-list.tsx` uses `orderMessagePartsForDisplay` (`features/ai-assistant/lib/order-message-parts-for-display.ts`). `data-uiMetadata` is pulled out and inserted after the last `text` part. Original indexes stay for React keys.

## What not to do

- Do not wrap catalog cards or cart as `dynamicTool` just so the old tool renderer can mount them.
- Do not invent a `tools/` folder for these parts. Execute/render is `server/render/`. UI is `ui/`. Parse is `lib/stream/`.
- Do not treat `view: sheet` or `view: cards` as an AI tool choice. View is presentation. The runtime writes the matching stream part.
- Do not dump cards on `view: conversation`. Find chips are `data-uiMetadata` from schema metadata.
- Do not put Find chips in speaker markdown. Click is a visible user message, not a silent `businessContext` bypass.
