# ShopMate

An AI assistant integration for an e-commerce website built with Next.js. ShopMate combines conversational shopping with a server-first storefront using SSG/ISR patterns, localization, and a responsive product experience.

[See it live](https://shopmate-ai-product-assistant.vercel.app/)

---

## What is this project?

ShopMate explores how an AI assistant can become part of the shopping journey instead of living as a separate support widget. Users can discover products, compare options, manage their cart, create useful artifacts, and continue their conversation while navigating the storefront.

The project is designed around a reusable assistant core with a ShopMate-specific business adapter. This keeps the chat, streaming, artifact, and persistence features reusable while the adapter owns schema labeling, catalog lookup, server render, and stream-part UI.

![ShopMate preview](docs/assets/shopmate-preview.png)

---

## AI assistant features

| Feature | Description |
| --- | --- |
| Continuous chat | Navigation preserves the active conversation so users do not lose their work while browsing pages. |
| Product discovery | Natural language search, recs, and compare. Defined product asks stream cards; rec/compare can offer Find chips first. |
| Cart actions | Users can view, add, remove, and adjust products through the assistant. |
| Product discussions | The assistant can answer product questions and compare options such as Windows and Mac laptops. |
| Schema + deterministic runtime | One schema LLM labels the request. A planner chooses lookup, view, cart, refuse, or policy. No specialist-agent router. |
| Artifacts | Create downloadable text documents, sheets/tables, and charts from a conversation. Catalog tables come from real lookup rows. |
| Guest persistence | Logged-out users keep chat history and artifacts in local browser storage. |
| Login merge | Local conversations are merged into the authenticated user's database history after login. |
| Voice dictation | Supports browser dictation with an OpenAI transcription path when needed. |
| Streaming UI | Responses, thinking steps, stream parts (cards, cart, Find chips), and artifact updates appear progressively. |
| Assistant-aware navigation | Links and routing preserve assistant URL state and the active chat. |

---

## How the assistant is wired

The project separates the reusable assistant from ShopMate's business logic:

```text
features/ai-assistant
        ↓ configuration and contracts
features/shop-assistant
        ↓ schema, lookup, render
features/cart / catalog
```

### 1. Standalone assistant

[`features/ai-assistant`](features/ai-assistant/) owns the reusable experience: chat transport, streaming, message rendering, artifacts, history, navigation state, and persistence contracts. It does not know ShopMate's products, cart rules, or store routing.

### 2. Business logic

[`features/cart`](features/cart/) owns the cart state and actions used by the storefront. It uses Zustand as a small, shared client-side state layer so the storefront and assistant can read and update the same cart without coupling the assistant to the cart implementation. See the [cart architecture](features/cart/architecture.md) and [why Zustand](docs/why-zustand.md) notes for the design rationale.

### 3. ShopMate bridge

[`features/shop-assistant`](features/shop-assistant/) connects the standalone assistant to the business domain. It provides one schema LLM, a deterministic planner/lookup/render path, stream-part UI mounts, suggestions, and an optional speaker. See [architecture](features/shop-assistant/docs/architecture.md), [retrieval-first pattern](features/ai-assistant/docs/retrieval-first-business-logic.md), and [Find chips](features/shop-assistant/docs/conversation.md).

The application passes those capabilities through [`shop-assistant-config.tsx`](features/shop-assistant/ui/integration/shop-assistant-config.tsx) and [`shop-assistant-integration.tsx`](features/shop-assistant/ui/integration/shop-assistant-integration.tsx). On the server, [`app/api/ai-assistant/route.ts`](app/api/ai-assistant/route.ts) injects [`shop-assistant-runtime.ts`](features/shop-assistant/server/shop-assistant-runtime.ts) into [`handle-assistant-request.ts`](features/ai-assistant/server/handle-assistant-request.ts).

This allows the assistant feature to be reused in another application by supplying a different runtime, stream-part renderers, suggestions, and persistence adapter.

### Request flow

ShopMate labels each request with one schema LLM ([`request-agent.ts`](features/shop-assistant/server/request-agent.ts)), then [`planFromSchema`](features/shop-assistant/model/execution-plan.ts) chooses lookup, view, cart, refuse, or policy. Catalog facts come from lookup rows ([`match-catalog-products.ts`](features/shop-assistant/lib/catalog/match-catalog-products.ts)), not from a second AI search. The live flow is in the [Shop Assistant README](features/shop-assistant/README.md). The previous multi-agent router is archived at [`features/shop-assistant-v1`](features/shop-assistant-v1/).

Example: “Should I get an iPhone or a Samsung for social media reels?”

```text
User prompt
  → schema LLM: action=catalog, view=conversation, metadata.buttons=[Smartphones]
  → plan: skip lookup; speaker + Find chips
  → speaker: explain camera / video trade-offs (no invented SKUs)
  → Find [Smartphones]
  → click → “Provide smartphone from the catalog”
  → lookup → product cards
```

“Show me smart phones” skips Find chips: `view=cards` → lookup → cards only.

---

## What the adapter renders

Catalog, cart, and rec/compare UI are **server render + components**, not AI tools. See [tools vs server functions](features/shop-assistant/docs/tools.md) and [stream parts](features/shop-assistant/docs/stream-parts.md).

| User ask | What runs | Files |
| --- | --- | --- |
| Show me phones | Lookup → product cards | [`store-output.ts`](features/shop-assistant/server/render/store-output.ts), [`product-cards.tsx`](features/shop-assistant/ui/cards/product-cards.tsx) |
| All products in a table | Lookup → sheet artifact from real CSV | [`store-output.ts`](features/shop-assistant/server/render/store-output.ts), [`product-catalog-csv.ts`](features/shop-assistant/transform/catalog/product-catalog-csv.ts) |
| Rec / compare | Speaker + Find chips | [`speaker.ts`](features/shop-assistant/server/speaker.ts), [`buttons.tsx`](features/shop-assistant/ui/metadata/buttons.tsx) |
| Edit my cart | Cart UI from `CartSource` | [`cart.ts`](features/shop-assistant/server/render/cart.ts), [`cart-panel.tsx`](features/shop-assistant/ui/cart/cart-panel.tsx) |
| Windows vs Mac laptops | Technical text artifact | [`store-output.ts`](features/shop-assistant/server/render/store-output.ts) |

Chat remounts cards, cart, and Find chips from [`stream-part-registry.tsx`](features/shop-assistant/ui/integration/stream-part-registry.tsx).

Possible extensions include order lookup, customer support workflows, inventory, account actions, and HITL writes ([workflow / HITL](features/ai-assistant/docs/workflow-hitl-business-logic.md)).

---

## Business model

ShopMate demonstrates an AI-assisted commerce layer that can help businesses:

- Improve product discovery and conversion.
- Reduce repetitive pre-sale support.
- Increase average order value through recommendations.
- Turn product information into useful customer-facing artifacts.
- Offer a more personal shopping experience without requiring a human agent for every interaction.

---

## Detailed documentation

- [AI assistant architecture and integration guide](features/ai-assistant/README.md)
- [Retrieval-first business pattern](features/ai-assistant/docs/retrieval-first-business-logic.md)
- [Shop Assistant README](features/shop-assistant/README.md)
- [Shop Assistant architecture](features/shop-assistant/docs/architecture.md)
- [Message persistence architecture](features/ai-assistant/message-persistence/README.md)
- [Project map](docs/project-map.md)

---

## Stack

- Next.js App Router
- React and TypeScript
- Vercel AI SDK (`@ai-sdk/react`, `@ai-sdk/openai`) for model integration, streaming responses, tool calls, and a consistent React chat transport.
- OpenAI models
- Supabase
- Tailwind CSS
- Lucide icons

---

## High-level project structure

```text
app/                    # Routes, layouts, and API adapters
views/                  # Server-first page composition
features/ai-assistant/  # Reusable assistant core
features/shop-assistant/# ShopMate business adapter
features/cart/          # Cart state and business actions
entities/               # Product and category domain models
widgets/                # Composed storefront sections
shared/                 # Shared configuration, UI, i18n, and Supabase boundaries
docs/                   # Architecture decisions and project notes
```

The AI layer is useful here because the Vercel AI SDK provides the application-facing primitives for streaming model output, rendering UI messages, and connecting React state to the assistant transport. ShopMate can therefore focus on schema, lookup, and render instead of rebuilding the chat protocol.

### What the AI SDK provides

ShopMate uses the Vercel AI SDK as the communication layer between the interface and the language model:

- `useChat` manages the client chat state, message updates, submission status, and streamed responses.
- `DefaultChatTransport` sends the current UI message history and request configuration to the assistant API.
- `UIMessage` provides a structured message format with text, reasoning, metadata, and custom `data-*` parts.
- Stream helpers progressively deliver model output, thinking steps, and generated UI data to the client.
- AI SDK tools remain available when a runtime must let the **model** call something with unknown args. ShopMate catalog, cart, and shop artifacts do not use that path.

This gives the assistant a consistent foundation for structured conversations and continued threads. The SDK handles the chat protocol and in-memory conversation state; ShopMate owns long-term history and thread persistence by loading and saving messages through local storage and Supabase.

See the official [AI SDK introduction](https://ai-sdk.dev/docs/introduction), [`useChat`](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat), [tool calling](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling), and [chat message persistence](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence) documentation.

---

## Getting started

```bash
npm install
npm run dev
```

Create `.env.local` with the required OpenAI and Supabase variables, then open [http://localhost:3000](http://localhost:3000).

---

## Status

This is a demo and starter kit for expanding an AI-assisted e-commerce experience. The storefront and assistant flows are functional, while capabilities such as payments, production authentication, order fulfillment, and additional business adapters can be connected as the project evolves.
