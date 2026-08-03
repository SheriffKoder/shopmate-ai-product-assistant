# ShopMate Project Map

Use this as the first repo read when you need orientation. It is intentionally compact so agents can avoid repeatedly scanning raw source. Do not treat this as a replacement for checking the specific files you edit.

## What This App Is

- ShopMate is a Next.js 15 App Router e-commerce app for electronics, with a persistent AI shopping assistant.
- Main user flows: home discovery, product browsing/search, product detail, cart management, checkout shell, AI-assisted product search/recommendations/cart answers, and chat/document history.
- Primary stack: React 19, TypeScript, Tailwind CSS 4, Radix UI, SWR, Vercel AI SDK, Supabase.

## Entry Points

- `app/layout.tsx` is the root server layout; it loads global CSS, local font metadata, and wraps pages with `components/layout-wrapper.tsx`.
- `components/layout-wrapper.tsx` is the app shell: `features/shop` `ShopProvider`, assistant `FullscreenProvider`, assistant `DataStreamProvider`, global toast container, `MainHeader`, page content, chat wrapper, footer, and stream handler.
- `app/page.tsx` renders `features/home/index.tsx`.
- `app/products/page.tsx` renders `features/products/products-page-content.tsx`.
- `app/products/[id]/page.tsx` renders `features/products/product-detail-page-content.tsx`.
- `app/cart/page.tsx` renders `features/cart/cart-page-content.tsx`.
- `app/checkout/page.tsx` renders `features/checkout/checkout-page-content.tsx`.
- `app/not-found.tsx` is the app-level 404 required by project guidelines.

## Shadow Server-First Pages

- `app/shadow/[locale]/layout.tsx`: localized shadow layout. It validates the locale, sets `dir`, loads dictionary copy, and mounts `shadow/widgets/shadow-header`.
- `app/shadow/[locale]/page.tsx`: server-first home route with ISR; renders `shadow/views/home`.
- `app/shadow/[locale]/products/page.tsx`: server-first products listing route with ISR; renders `shadow/views/products` without URL/server-side filtering.
- `app/shadow/[locale]/products/[slug]/page.tsx`: server-first product detail route with ISR and static params; renders `shadow/views/product-detail`.
- `app/shadow/[locale]/categories/[slug]/page.tsx`: server-first category route with ISR and static params; renders `shadow/views/category`.
- `app/shadow/dev/page.tsx`: dynamic development/admin route; renders `shadow/views/dev` for env-driven dev user creation, initial catalog seeding, and on-demand revalidation.
- Shadow pages are intentionally independent from the current app: do not import current `features/`, `components/`, or `lib/` into `app/shadow/**` or `shadow/**`.

## Shadow Folder Responsibilities

- `shadow/views/`: route composition. Each view loads dictionary copy, calls shadow queries, handles page-level outcomes such as `notFound()`, and passes ready data to UI.
- `shadow/entities/category/` and `shadow/entities/product/`: catalog domain types, Zod row schemas, transforms, Supabase repositories, and cached read queries.
- `shadow/widgets/`: reusable server UI sections such as the shadow header, home hero, category navigation, product card, and product grid.
- `shadow/features/locale-switcher/`: the small client-only locale dropdown island and pure href builder.
- `shadow/shared/i18n/`: EN/AR locale config, typed dictionaries, locale assertion, dictionary loading, and localized catalog text helpers.
- `shadow/shared/config/`: shadow cache constants, environment validation, and `SHADOW_SUPABASE_TABLE_PREFIX`-driven table names.
- `shadow/shared/supabase/server/create-shadow-service-client.ts`: server-only Supabase service client boundary for shadow reads and dev writes.
- `shadow/development/initial-data/products.ts`: seed data consumed only by `/shadow/dev`.
- `shadow/development/migrations/032_create_shadow_catalog.sql`: active shadow catalog migration for prefixed catalog tables. Other copied migration files in this folder are external compatibility history and should not be read unless the user explicitly asks.

## API Routes

- `app/api/ai-assistant/route.ts`: thin Next.js adapter for the assistant server handler and injected ShopMate runtime.
- `app/api/products/route.ts`: product data endpoint used by SWR hooks and shop state.
- `app/api/cart/route.ts`: cart data/mutation endpoint used by SWR hooks and shop state.
- `app/api/history/route.ts`: paginated chat history for the AI sidebar.
- `app/api/chat/[chatId]/route.ts` and `app/api/chat/[chatId]/messages/route.ts`: chat/message retrieval and operations.
- `app/api/document/route.ts`: artifact/document persistence endpoint.
- `app/api/user/route.ts`: constant/development user endpoint.

## Main Feature Areas

- `features/home/`: home page orchestration, product/category sections, banner carousel, promotional card config, footer config, and category helpers.
- `features/products/`: products page and product detail page content, product grid/detail UI, and navigation helpers.
- `features/cart/`: dedicated cart page content.
- `features/checkout/`: checkout page content.
- `features/ai-assistant/`: reusable chat container/wrapper, prompt input, message rendering, data streaming, generic tool-renderer registration, artifacts, history sidebar, assistant providers/hooks/types, server request handling, and assistant utilities. Product/cart ownership is being migrated out for assistant reusability.
- `features/shop-assistant/`: ShopMate AI assistant adapter with electronics prompts, query/product classifiers, product/cart agents, product/cart tool factories, product/cart tool renderers, renderer registry, and adapter search helpers.
- `features/shop/`: ShopMate product/cart model types, mock initial catalog data, shop provider, and product/cart state hooks used by the storefront and assistant integration.
- `features/ai-filter/`: reusable natural-language URL filter assistant. Host pages pass catalog/config; the package handles prompt building, response sanitization, and URL patch application.
- `features/toast-success/`: global toast primitives, hook, container, and error config.

## AI Assistant Internals

- `features/ai-assistant/model/assistant-runtime.ts` defines the reusable runtime contract that business adapters implement.
- `features/ai-assistant/model/tool-renderer-registry.ts` defines the generic client-side tool renderer registry contract.
- `features/ai-assistant/schema/assistant-request-schema.ts` validates reusable assistant request fields while preserving business context.
- `features/ai-assistant/server/handle-assistant-request.ts` owns assistant request parsing, chat persistence calls, stream creation, runtime invocation, and SSE response formatting.
- `features/ai-assistant/server/assistant-chat-persistence.ts` isolates development user/chat/message persistence use-cases from the API route.
- `features/ai-assistant/server/default-assistant-runtime.ts`, `features/ai-assistant/agents`, `features/ai-assistant/lib/router.ts`, and product/cart tool paths are temporary compatibility exports for the staged migration.
- `features/shop-assistant/server/shop-assistant-runtime.ts` implements the runtime injected into the reusable assistant handler.
- `features/shop-assistant/server/agents/query-classifier/` decides whether a query is shopping-related, technical discussion, or unrelated.
- `features/shop-assistant/server/agents/product-classifier/` routes shopping queries to products, recommendation, or filtering behavior.
- `features/shop-assistant/server/agents/products-cart/`, `recommendation/`, `filtering/`, `technical-discussion/`, and `not-related/` contain specialized ShopMate agent implementations and prompts.
- `features/shop-assistant/server/router.ts` coordinates ShopMate routing to the selected agent.
- `features/shop-assistant/tools/product-search/` and `tools/cart-info/` define ShopMate AI tool behavior.
- `features/shop-assistant/ui/tool-renderer-registry.tsx` registers ShopMate product/cart tool renderers for the generic assistant message renderer.
- `features/ai-assistant/artifacts/` contains text and sheet artifact support, version-history hooks, panel UI, and document tool result/call components.
- `features/ai-assistant/history-sidebar/` contains chat history UI, SWR pagination, date grouping, navigation helpers, and deletion operation notes.

## State And Data

- `features/shop/providers/shop-context.tsx` is the central client state provider for products and cart; it wraps SWR hooks and exposes dispatch-style compatibility actions.
- `features/shop/hooks/use-products-api-swr.ts` and `use-cart-api-swr.ts` bridge UI state to `/api/products` and `/api/cart`.
- `lib/storage/session-storage.ts` is the development storage abstraction for products/cart/user data.
- `lib/supabase/client.ts`, `types.ts`, `queries/chat-queries.ts`, and `queries/user-queries.ts` provide Supabase persistence for users, chats, messages, and documents.
- `lib/supabase/migrations/` contains SQL migrations for documents, users, chats, and messages.
- Product images and fonts live under `public/images/` and `public/fonts/`.

## Shared UI And Utilities

- `components/ui/` contains reusable Radix/Tailwind UI primitives.
- `components/ai-elements/` contains reusable AI/chat display primitives.
- `components/main-header/` contains the header, search bar, icon buttons, and dropdown pieces.
- `components/mobile-nav.tsx`, `components/footer.tsx`, and `components/layout-wrapper.tsx` are app-shell UI.
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
