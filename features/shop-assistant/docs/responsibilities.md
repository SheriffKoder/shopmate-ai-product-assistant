# Shop Assistant responsibilities

## Owns

- ShopMate `AssistantRuntime` implementation (`server/shop-assistant-runtime.ts`). Injected by `/api/ai-assistant`.
- One schema LLM: `action`, filters, `view`, `metadata` (`server/request-agent.ts`, `model/assistant-request.ts`, `schema/assistant-request-schema.ts`).
- Deterministic `planFromSchema` (`model/execution-plan.ts`).
- Catalog lookup via `CatalogSource` / mock Shop API, including unique-value matching (`lib/catalog/match-catalog-products.ts`). Conversation skips lookup; answer looks up for speaker facts; schema `view` + `metadata` own listing vs Q&A vs discussion.
- Server render for cards, sheet, document, cart, refuse, policy, answer, and conversation Find chips (`server/render/store-output.ts`, `server/render/cart.ts`, `server/render/reply.ts`, `server/render/ui-metadata.ts`).
- Catalog payload mapping (`transform/catalog/`: CSV, markdown, card parts).
- Optional speaker with no tools (`server/speaker.ts`). Conversation / answer reply in full; cards/sheet/cart confirm briefly.
- Product/cart/metadata UI (`ui/cards/`, `ui/cart/`, `ui/metadata/`) and stream-part hydration (`ui/integration/`, `lib/stream/`).
- Suggestion chips and assistant integration mount.

## Does not own

- Generic assistant request parsing, SSE, persistence, or runtime contracts (`features/ai-assistant`).
- Artifact document storage and generic artifact panel (`features/ai-assistant` artifacts).
- Storefront catalog/cart state (`features/catalog`, `features/cart`, `entities/*`).

## Dependency direction

```text
app/api + layout
  → shop-assistant (runtime + ui)
    → ai-assistant contracts + artifact server helpers
    → catalog / cart models
```

- This feature may import `features/ai-assistant`, `features/catalog`, and `features/cart`.
- `features/ai-assistant` must not import this feature.
- Routes inject runtime composition only.

## Docs in this unit

| File | Role |
|---|---|
| [`architecture.md`](./architecture.md) | System + why v2 + expected replies |
| [`conversation.md`](./conversation.md) | Rec / compare / product Q&A Find chips from schema metadata |
| [`tools.md`](./tools.md) | Tool vs component vs server function |
| [`stream-parts.md`](./stream-parts.md) | Message `data-*` parts and chat remount |
