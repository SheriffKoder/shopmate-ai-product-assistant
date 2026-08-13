# Shop Assistant Architecture Patterns

The Shop Assistant is more than a business-specific copy of the AI assistant. It demonstrates the application patterns used to connect business workflows, agents, APIs, tools, and client state without coupling them to the generic assistant UI.

## 1. Runtime injection

Business behavior is isolated behind the generic `AssistantRuntime` contract. The application route injects the Shop Assistant runtime into the reusable assistant request handler.

```text
API route
  → generic assistant handler
    → injected ShopAssistantRuntime
      → Shop Assistant router and agents
```

This keeps the assistant reusable for normal chat or for another business domain.

## 2. Responsibility-based agent routing

Routing is separate from request parsing and transport. Agents are organized by behavior:

- Query classification
- Product classification
- Product/cart assistance
- Recommendations
- Filtering
- Technical discussion
- Unrelated-query fallback

The router decides which workflow should handle a request. It does not own the generic assistant stream or database persistence.

## 3. Explicit data-source contracts

Agents and tools do not depend directly on a database or application store. They use focused contracts such as:

- `CatalogSource`
- `CartSource`
- `ShopApiClient`

The broader API client is adapted into smaller source interfaces so each agent receives only the operations it needs.

```text
agent/tool → focused source contract → ShopApiClient → mock API or database provider
```

This allows mock data today and backend filtering, database queries, or another provider later.

## 4. API-shaped mock data

Development data is accessed through an API-shaped client rather than imported directly into agents. This preserves the same boundary that a real HTTP or database-backed implementation will use later.

The mock client is replaceable without changing prompts, agents, or tool schemas.

## 5. Tools separated from renderers

Each tool has two responsibilities separated in code:

- Server tool: schema validation and business operation.
- Client renderer: presentation of the structured tool result.

The renderer registry maps tool names to UI components. The generic assistant renders the registry contract; Shop Assistant supplies the business renderers.

```text
agent → tool schema/execution → structured result
                                      ↓
                         Shop Assistant renderer registry → UI
```

## 6. Explicit command-based mutations

Assistant UI does not import the cart store directly. When a user clicks a cart action in a tool result, the renderer sends a typed Shop Assistant command to an injected command handler.

```text
tool card click
  → ShopAssistantCommand
    → application cart command handler
      → Zustand cart store
```

This keeps the assistant independent from the application’s state library and allows the same assistant UI to work with Redux, Zustand, server actions, or another state mechanism.

## 7. Structured stream events

Tool results and business UI updates are sent as typed stream events instead of being encoded into assistant text. Examples include:

- Product cards
- Cart information
- Artifact metadata
- Artifact content deltas
- Agent thinking-step summaries

This lets the client render rich UI while preserving the assistant response as normal conversational text.

## 8. Safe progress summaries

Agents can emit concise, user-facing progress stages such as:

```text
Classifying · done
Product intent · done
Recommendation · loading
Creating artifact · done
Price comparison for iPhone · done
```

These are summaries of observable work, not raw chain-of-thought, hidden prompts, model output, or internal tool arguments.

## 9. Artifact names as progress metadata

When a tool creates an artifact, the artifact title is attached to the progress step:

```text
Creating artifact · done
Discussion about iPhone and Samsung phones
```

The artifact id, kind, and content remain separate structured events used by the artifact UI.

## 10. Thin application composition

The API route should compose dependencies and delegate work. It may select:

- The generic assistant handler
- The Shop Assistant runtime
- Persistence implementation
- Database/API provider

It should not contain classification logic, tool execution, prompt construction, or data preparation.

## 11. Generic assistant independence

The dependency direction is one-way:

```text
application → shop-assistant → ai-assistant contracts
application → ai-assistant UI
```

The generic assistant must not import Shop Assistant code, product models, cart state, or a concrete database client. Without Shop Assistant, the generic assistant continues to work as a normal chat experience.

## 12. Recommended business-adapter recipe

For a new project:

1. Copy the generic `features/ai-assistant` feature.
2. Create a sibling business feature.
3. Define business source contracts in `model/`.
4. Add an API client and mock implementation.
5. Add focused agents and prompts under `server/agents/`.
6. Add tools and structured result renderers.
7. Add a business runtime and router.
8. Add a renderer registry and integration component.
9. Inject the runtime and persistence from the application route.
10. Inject application state commands instead of importing the application store.

## Reference files

- [`features/shop-assistant/server/shop-assistant-runtime.ts`](../features/shop-assistant/server/shop-assistant-runtime.ts)
- [`features/shop-assistant-v1/server/router.ts`](../features/shop-assistant-v1/server/router.ts)
- [`features/shop-assistant/model/sources/catalog-source.ts`](../features/shop-assistant/model/sources/catalog-source.ts)
- [`features/shop-assistant/model/sources/cart-source.ts`](../features/shop-assistant/model/sources/cart-source.ts)
- [`features/shop-assistant/model/sources/shop-api-client.ts`](../features/shop-assistant/model/sources/shop-api-client.ts)
- [`features/shop-assistant/model/sources/shop-assistant-command-handler.ts`](../features/shop-assistant/model/sources/shop-assistant-command-handler.ts)
- [`features/shop-assistant/ui/integration/stream-part-registry.tsx`](../features/shop-assistant/ui/integration/stream-part-registry.tsx)
- [`features/shop-assistant/ui/integration/shop-assistant-integration.tsx`](../features/shop-assistant/ui/integration/shop-assistant-integration.tsx)
- [`app/api/ai-assistant/route.ts`](../app/api/ai-assistant/route.ts)

