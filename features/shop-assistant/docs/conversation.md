# Conversation and answer Find chips

How rec / compare / product Q&A replies offer follow-up catalog searches without dumping cards.

Related: [`architecture.md`](./architecture.md), [`stream-parts.md`](./stream-parts.md).

## One sentence

Schema `view` chooses listing vs Q&A vs discussion. Schema `metadata` chooses Find chips. Click starts a visible new turn. Runtime stays dumb.

## Turn flow

```text
Turn 1a  catalog + conversation
         speaker text
         Find [Smartphones] [Tablets]     ← metadata.type = buttons

Turn 1b  catalog + answer
         lookup → speaker cites store facts
         Find [iPhone 15 Pro Max]         ← from lookup product names
         (no product cards)

Turn 2   click → "Provide tablets from the catalog"
         catalog + cards → lookup → cards
```

Conversation and answer never stream product cards. Cards appear only after the user picks a chip (or asks to see products directly).

## Schema

```ts
metadata: {
  type: 'none' | 'buttons',   // extend later: links, chips, …
  items: Array<{ label: string; value: string }>  // max 3
}
```

Default: `{ type: 'none', items: [] }`.

| Field | Meaning |
|---|---|
| `type` | Which UI to mount (`buttons` → `ui/metadata/buttons.tsx`) |
| `items[].label` | Chip text (`Tablets`) |
| `items[].value` | Turn-2 search fragment (`tablet`) |

Click prompt: `Provide ${item.value} from the catalog`.  
If `constraints.maxPrice` is set, append it: `Provide headphones under $200 from the catalog`.

Persisted stream part:

```ts
data-uiMetadata: {
  type: 'buttons',
  items: [{ label: 'Tablets', value: 'tablet' }],
  maxPrice?: number | null,
}
```

`value` is a catalog category (`smartphone`, `laptop`, `tablet`, `smartwatch`, `headphones`), not an invented product name. Constraint fields such as `sortBy` are optional with defaults so omitting them does not drop a valid label.

## When the labeler uses them

| User | Schema |
|---|---|
| diary on the go, what products match? | `view: conversation`, `metadata.buttons`: Smartphones, Tablets |
| tablets or laptops for X? | `view: conversation`, items: Tablets, Laptops |
| what features the iphone 15 pro max has? | `view: answer`, catalogQuery for the SKU, Find chip from lookup name |
| Show me smart phones | `view: cards`, `metadata: none` |
| Provide tablets from the catalog | `view: cards`, `category: tablet`, `metadata: none` |

Rules in `server/request-agent.ts`:

- Rec / compare → `view: conversation`. Set `category` when the aisle is clear so lookup can cite products. Use `metadata.buttons` when there is no single aisle.
- Features / specs / tell me about X → `view: answer`, lookup query set, `metadata: none` (runtime chips from product names).
- Show me / table / document / cart → `metadata.type: none`, `items: []`.
- `"Provide tablets from the catalog"` → `action: catalog`, `view: cards`, `category: tablet`, `metadata: none`.

## Runtime

`planFromSchema` maps `view` to render. Lookup and UI follow the plan.

| Path | Lookup | Render | Metadata |
|---|---|---|---|
| catalog + conversation | when category or query set | speaker may cite products; no cards | product-name chips if rows, else schema aisle chips |
| catalog + answer | yes | speaker from store facts (no cards) | Find chips from matched **product names** |
| catalog + cards | yes | cards + confirm | ignore |
| sheet / document / cart / refuse / policy | as usual | as usual | ignore |

Speaker answers the question in full. It does not confirm briefly, invent SKUs, or put chips in markdown. Find chips are a separate `data-uiMetadata` part.

## UI

1. `server/render/ui-metadata.ts` writes the persisted part.
2. `lib/stream/get-ui-metadata-part.ts` parses it.
3. `ui/integration/stream-part-registry.tsx` switches on `type` and mounts `ui/metadata/buttons.tsx`.
4. Chat shows chips **under** the reply (`orderMessagePartsForDisplay`) and only after that reply finishes (`status` is not `streaming` / `submitted` on the last message). Older chips stay visible while a new turn streams.
5. Click calls `sendMessage({ text: 'Provide tablet from the catalog' })`. No silent `businessContext` bypass.

`features/ai-assistant` forwards `sendMessage` and `status` into stream-part renderers. It does not import ShopMate UI.

## What this is not

- Not a `find: CatalogCategory[]` schema field. Metadata covers it.
- Not lookup-based offer builders or invented SKU chips.
- Not speaker markdown chips.
- Not dumping cards on `metadata.type: buttons` or on `view: answer`.
- Not a `tools/` folder. Execute is `server/render/`. UI is `ui/metadata/`. Parse is `lib/stream/`.
