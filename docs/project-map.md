# ShopMate Project Map

Use this as the first repo read when you need orientation. It is intentionally compact so agents can avoid repeatedly scanning raw source. Do not treat this as a replacement for checking the specific files you edit.

## What This App Is

- ShopMate is a Next.js 15 App Router e-commerce app for electronics, with a persistent AI shopping assistant.
- Main user flows: home discovery, product browsing/search, product detail, cart management, checkout shell, AI-assisted product search/recommendations/cart answers, and chat/document history.
- Primary stack: React 19, TypeScript, Tailwind CSS 4, Radix UI, SWR, Vercel AI SDK, Supabase.

## Entry Points

- `app/layout.tsx` is the root server layout; it loads global CSS, local font metadata, and wraps pages with `components/layout-wrapper.tsx`.
- `components/layout-wrapper.tsx` is the app shell: assistant root provider, global toast container, `widgets/app-header`, page content, one `features/shop-assistant` integration mount, and footer.
- `proxy.ts` redirects the bare root path `/` to the default localized storefront at `/en`.
- `app/page.tsx` is a minimal root fallback redirect to `/en`.
- `app/[locale]/page.tsx` renders the server-first localized home view from `views/home`.
- `app/[locale]/products/page.tsx` renders the server-first localized product listing view from `views/products`.
- `app/[locale]/products/[slug]/page.tsx` renders the server-first localized product detail view from `views/product-detail`.
- `app/[locale]/categories/[slug]/page.tsx` renders the server-first localized category view from `views/category`.
- `app/[locale]/checkout/page.tsx` renders the server-first localized checkout shell from `views/checkout`, with cart contents hydrated by a `features/cart` client island.
- `app/[locale]/checkout/success/page.tsx` renders the server-first localized checkout success shell from `views/checkout-success`, with mock order/user data and local cart receipt items.
- `app/dev/page.tsx` renders the development/admin view from `views/dev`.
- `app/not-found.tsx` is the app-level 404 required by project guidelines.

## Server-First Pages

- `app/[locale]/layout.tsx`: localized layout. It validates the locale and sets the page `dir` while the root layout wrapper keeps the main header/footer shell mounted once.
- `views/home/`: server-first home composition with ISR-ready data reads.
- `views/products/`: server-first products listing composition without URL/server-side filtering.
- `views/product-detail/`: server-first product detail composition with static params support.
- `views/category/`: server-first category composition with static params support.
- `views/checkout/`: server-first checkout composition; local cart state is read only inside `features/cart/ui/checkout-cart-panel.tsx`.
- `views/checkout-success/`: server-first checkout success composition with mock order/customer data and a cart receipt client island.
- `views/dev/`: dynamic development/admin composition for env-driven dev user creation, initial catalog seeding, and on-demand revalidation.

## Server Page Source Responsibilities

- `views/`: route composition. Each view loads dictionary copy, calls catalog queries, handles page-level outcomes such as `notFound()`, and passes ready data to UI.
- `entities/category/` and `entities/product/`: catalog domain types, Zod row schemas, transforms, Supabase repositories, and cached read queries.
- `widgets/`: reusable server UI sections such as the temporary header, home hero, category navigation, product card, and product grid.
- `features/locale-switcher/`: the small client-only locale dropdown island and pure href builder.
- `shared/i18n/`: EN/AR locale config, typed dictionaries, locale assertion, dictionary loading, and localized catalog text helpers.
- `shared/config/`: cache constants, environment validation, and `SHADOW_SUPABASE_TABLE_PREFIX`-driven table names.
- `shared/supabase/server/create-service-client.ts`: server-only Supabase service client boundary for catalog reads and dev writes.
- `shadow/development/initial-data/products.ts`: seed data consumed only by `/dev`.
- `shadow/development/migrations/032_create_shadow_catalog.sql`: active catalog migration for prefixed catalog tables. Other copied migration files in this folder are external compatibility history and should not be read unless the user explicitly asks.

## API Routes

- `app/api/ai-assistant/route.ts`: thin Next.js adapter for the assistant server handler and injected ShopMate runtime.
- `app/api/ai-assistant/history/route.ts`: paginated chat history for the AI sidebar.
- `app/api/ai-assistant/document/route.ts`: artifact/document persistence endpoint.
- `app/api/ai-assistant/user/route.ts`: constant/development user endpoint.

## Main Feature Areas

- `features/ai-assistant/`: reusable provider shell, chat container/wrapper, prompt input with model picker, message rendering, data streaming, generic tool-renderer registration, model configuration, artifacts, history sidebar, assistant providers/hooks/types, server request handling, and assistant utilities. Business adapters inject runtimes and tool renderers from outside the core.
- `features/auth/`: auth-facing UI islands such as the user account header button placeholder.
- `features/cart/`: local-only client cart store, hook, header cart dropdown UI, and browser persistence. The assistant/cart interaction uses this hook contract.
- `features/catalog/`: legacy-compatible product model and initial catalog data used by cart/assistant interactive surfaces until the Supabase catalog fully replaces those contracts.
- `features/header-search/`: header product search input and localized product-search navigation helper.
- `features/locale-switcher/`: locale dropdown island and href builder for EN/AR route switching.
- `features/shop-assistant/`: ShopMate AI assistant adapter with electronics prompts, query/product classifiers, product/cart agents, product/cart data-source contracts, mock/DB-ready catalog sources, tool factories, product/cart tool renderers, renderer registry, UI integration shell, adapter search helpers, and runtime model consumption.

## AI Assistant Internals

- `features/ai-assistant/model/assistant-runtime.ts` defines the reusable runtime contract that business adapters implement.
- `features/ai-assistant/model/assistant-model-config.ts` defines env-driven default, search, and allowed assistant model ids.
- `features/ai-assistant/model/tool-renderer-registry.ts` defines the generic client-side tool renderer registry contract.
- `features/ai-assistant/providers/assistant-root-provider.tsx` composes fullscreen and data-stream providers behind one reusable assistant root.
- `features/ai-assistant/server/assistant-model-provider.ts` resolves configured model ids into provider model instances behind one OpenAI-specific boundary.
- `features/ai-assistant/schema/assistant-request-schema.ts` validates reusable assistant request fields while preserving business context.
- `features/ai-assistant/server/handle-assistant-request.ts` owns assistant request parsing, chat persistence calls, stream creation, runtime invocation, and SSE response formatting.
- `features/ai-assistant/server/assistant-chat-persistence.ts` isolates development user/chat/message persistence use-cases from the API route.
- Old assistant-core product/cart compatibility export paths were removed in cleanup phase 08; use `features/catalog`, `features/cart`, `features/shop-assistant`, or generic assistant contracts as the canonical owners.
- `features/shop-assistant/server/shop-assistant-runtime.ts` implements the runtime injected into the reusable assistant handler and resolves selected request models once per stream.
- `features/shop-assistant/ui/shop-assistant-integration.tsx` mounts the reusable assistant root with ShopMate stream handling and chat id wiring.
- `features/shop-assistant/model/catalog-source.ts` and `model/cart-source.ts` define product/cart data contracts for assistant tools and renderers.
- `features/shop-assistant/server/mock-catalog-source.ts` adapts request/mock products to the catalog contract with deterministic filters before AI ranking.
- `features/shop-assistant/server/db-catalog-source.ts` documents the future Supabase/Postgres filter implementation boundary.
- `features/shop-assistant/server/agents/query-classifier/` decides whether a query is shopping-related, technical discussion, or unrelated.
- `features/shop-assistant/server/agents/product-classifier/` routes shopping queries to products, recommendation, or filtering behavior.
- `features/shop-assistant/server/agents/products-cart/`, `recommendation/`, `filtering/`, `technical-discussion/`, and `not-related/` contain specialized ShopMate agent implementations and prompts.
- `features/shop-assistant/server/router.ts` coordinates ShopMate routing to the selected agent.
- `features/shop-assistant/tools/product-search/` and `tools/cart-info/` define ShopMate AI tool behavior over adapter-owned catalog/cart sources.
- `features/shop-assistant/ui/tool-renderer-registry.tsx` registers ShopMate product/cart tool renderers for the generic assistant message renderer.
- Dependency rule: `features/shop-assistant` may import assistant contracts; `features/ai-assistant` must not import ShopMate adapter code; `app/api/ai-assistant/route.ts` imports only the reusable handler and current runtime composition.
- `features/ai-assistant/artifacts/` contains text and sheet artifact support, version-history hooks, panel UI, and document tool result/call components.
- `features/ai-assistant/history-sidebar/` contains chat history UI, SWR pagination, date grouping, navigation helpers, and deletion operation notes.

## State And Data

- `entities/category/` and `entities/product/` read public catalog data from prefixed Supabase tables through the server-only service client.
- `features/cart/store/cart-store.ts` is the central local-only client cart store used by the header and assistant integration.
- `lib/storage/session-storage.ts` is the development storage abstraction for products/cart/user data.
- `lib/supabase/client.ts`, `types.ts`, `queries/chat-queries.ts`, and `queries/user-queries.ts` provide Supabase persistence for users, chats, messages, and documents.
- `lib/supabase/migrations/` contains SQL migrations for documents, users, chats, and messages.
- Product images and fonts live under `public/images/` and `public/fonts/`.

## Shared UI And Utilities

- `components/ui/` contains reusable Radix/Tailwind UI primitives.
- `components/ai-elements/` contains reusable AI/chat display primitives.
- `components/mobile-nav.tsx`, `components/footer.tsx`, and `components/layout-wrapper.tsx` are app-shell UI.
- `shared/ui/header-icon-button.tsx` is the generic header icon button primitive used by feature-owned header controls.
- `widgets/app-header/ui/app-header.tsx` composes the feature-owned header search, locale switcher, user button, assistant toggle, and cart dropdown.
- `lib/utils.ts` and `lib/message-utils.ts` are shared utility files.
- `app/globals.css` holds global styles and Tailwind setup.

## Config And Instructions

- `package.json`: scripts and dependencies. Current scripts are `dev`, `build`, `start`, and `lint`.
- `next.config.ts`: Next.js config.
- `tailwind.config.ts` and `postcss.config.mjs`: styling pipeline config.
- `tsconfig.json`: TypeScript path aliases and compiler options.
- `AGENTS.md`: required agent workflow instructions.
- `.cursor/rules/project-structure.mdc`: responsibility-first folder rules and dependency direction.
- `app/development/project-guidelines/project-guidelines.md`: project coding, documentation, architecture, accessibility, and commit conventions.

## Scan Discipline

- Avoid scanning `node_modules/`, `.next/`, `.git/`, `dist/`, `build/`, and coverage/cache folders unless the user explicitly asks.
- Prefer `rg --files` or targeted `find` commands with excludes when locating files.
- Start with this map, then read only the relevant entry point, feature README/docs, and files you will edit.
