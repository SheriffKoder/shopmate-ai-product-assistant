# ShopMate

An AI assistant integration for an e-commerce website built with Next.js. ShopMate combines conversational shopping with a server-first storefront using SSG/ISR patterns, localization, and a responsive product experience.

## What is this project?

ShopMate explores how an AI assistant can become part of the shopping journey instead of living as a separate support widget. Users can discover products, compare options, manage their cart, create useful artifacts, and continue their conversation while navigating the storefront.

The project is designed around a reusable assistant core with a ShopMate-specific business adapter. This keeps the chat, streaming, artifact, and persistence features reusable while allowing each business to define its own tools, data, and workflows.

## AI assistant features

| Feature | Description |
| --- | --- |
| Continuous chat | Navigation preserves the active conversation so users do not lose their work while browsing pages. |
| Product discovery | Search, recommendations, filtering, and product cards are available through natural language. |
| Cart actions | Users can view, add, remove, and adjust products through the assistant. |
| Product discussions | The assistant can answer product questions and compare options such as Windows and Mac laptops. |
| Agent routing | Queries pass through classification and specialized agents for products, recommendations, filtering, technical discussions, and unrelated requests. |
| Artifacts | Create downloadable text documents, sheets/tables, and charts from a conversation. |
| Guest persistence | Logged-out users keep chat history and artifacts in local browser storage. |
| Login merge | Local conversations are merged into the authenticated user's database history after login. |
| Voice dictation | Supports browser dictation with an OpenAI transcription path when needed. |
| Streaming UI | Responses, reasoning steps, tool calls, and artifact updates appear progressively. |
| Assistant-aware navigation | Links and routing preserve assistant URL state and the active chat. |

## How the assistant is wired

The project separates the reusable assistant from ShopMate's business logic:

```text
features/ai-assistant
        ↓ configuration and contracts
features/shop-assistant
        ↓ business tools and agents
features/cart / catalog
```

### 1. Standalone assistant

[`features/ai-assistant`](features/ai-assistant/) owns the reusable experience: chat transport, streaming, message rendering, artifacts, history, navigation state, and persistence contracts. It does not know ShopMate's products, cart rules, or business agents.

### 2. Business logic

[`features/cart`](features/cart/) owns the cart state and actions used by the storefront. Catalog and product behavior live in their own feature/entity boundaries rather than inside the generic assistant.

### 3. ShopMate bridge

[`features/shop-assistant`](features/shop-assistant/) connects the standalone assistant to the business domain. It provides the runtime, agents, prompts, product/cart tools, tool renderers, suggestions, and stream handling.

The application passes those capabilities through configuration at [`shop-assistant-config.tsx`](features/shop-assistant/ui/shop-assistant-config.tsx) and mounts them through [`shop-assistant-integration.tsx`](features/shop-assistant/ui/shop-assistant-integration.tsx). On the server, [`app/api/ai-assistant/route.ts`](app/api/ai-assistant/route.ts) injects the ShopMate runtime into the generic assistant request handler.

This allows the assistant feature to be reused in another application by supplying a different runtime, tools, renderers, suggestions, and persistence adapter.

### Agent routing

ShopMate routes each request through a query classifier and then into the appropriate business agent. Shopping requests can be routed to product search, recommendations, or filtering; technical questions use a discussion agent; unrelated requests receive a separate fallback response. The routing boundary is implemented in [`features/shop-assistant/server/router.ts`](features/shop-assistant/server/router.ts).

Example: for the prompt “Should I get an iPhone or a Samsung for social media reels?” the flow can be:

```text
User prompt
  → query classifier: shopping-related
  → product classifier: recommendation/comparison
  → recommendation agent: evaluate camera, stabilization, video quality, and price
  → productSearch tool: retrieve relevant iPhone and Samsung products
  → tool renderer: display interactive product cards
  → assistant response: explain the trade-offs and recommend suitable options
```

## Business tools and examples

The assistant is built to support business-specific tools, not only general chat. Current examples include:

- `productSearch` for catalog discovery.
- `cartInfo` for cart inspection and editing.
- Product comparison and recommendation agents.
- Sheet generation for structured product information.
- Technical discussion flows for product education.

Possible extensions include order lookup, customer support workflows, inventory tools, account actions, lead qualification, and internal business dashboards.

## Business model

ShopMate demonstrates an AI-assisted commerce layer that can help businesses:

- Improve product discovery and conversion.
- Reduce repetitive pre-sale support.
- Increase average order value through recommendations.
- Turn product information into useful customer-facing artifacts.
- Offer a more personal shopping experience without requiring a human agent for every interaction.

## Detailed documentation

- [AI assistant architecture and integration guide](features/ai-assistant/README.md)
- [Message persistence architecture](features/ai-assistant/message-persistence/README.md)
- [Project map](docs/project-map.md)

## Stack

- Next.js App Router
- React and TypeScript
- Vercel AI SDK
- OpenAI models
- Supabase
- Tailwind CSS
- Lucide icons

## Getting started

```bash
npm install
npm run dev
```

Create `.env.local` with the required OpenAI and Supabase variables, then open [http://localhost:3000](http://localhost:3000).

## Status

This is an active product and architecture exploration. The storefront and assistant flows are functional, while commerce infrastructure such as payments, production authentication, and order fulfillment can be connected as the project evolves.
