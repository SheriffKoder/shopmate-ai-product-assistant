# ShopMate Database Guide

This document explains how to connect ShopMate to Supabase, which tables the application uses, and where to replace the current database provider.

## 1. Database architecture

ShopMate currently uses Supabase Postgres as its database provider.

Application database access is organized into these boundaries:

```text
Routes and views
  → entity repositories / assistant persistence contract
  → shared/infrastructure/supabase
  → Supabase Postgres
```

- `shared/infrastructure/supabase/` contains the concrete Supabase service client, query functions, and database types.
- `entities/category/repository/` and `entities/product/repository/` read catalog data through the Supabase client.
- `features/ai-assistant/message-persistence/model/assistant-persistence.ts` defines the provider-neutral assistant persistence contract.
- `features/ai-assistant/message-persistence/server/supabase-assistant-persistence.ts` is the current Supabase implementation of that contract.
- `supabase/migrations/` contains database migrations and remains at the repository root for Supabase CLI compatibility.

The browser does not receive the Supabase service-role key. Server-side repositories and routes create the service client through `create-service-client.ts`.

## 2. Environment setup

Copy the example file and fill in the project-specific values:

```bash
cp .env.example .env.local
```

Required database variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
DEV_EMAIL=demo@example.com
DEV_PASSWORD=change-this-password
SUPABASE_TABLE_PREFIX=sm_
```

The `SUPABASE_TABLE_PREFIX` value must match the prefix used by the database tables. With the default `sm_` value, the application reads these names:

```text
sm_categories
sm_products
sm_users
sm_chats
sm_messages
sm_documents
```

The assistant also needs `OPENAI_API_KEY` and its model settings. See the root `.env.example` for the complete environment template.

Never commit `.env.local`, a service-role key, or an OpenAI API key.

## 3. Create or update the database

Install and authenticate with the Supabase CLI, then link the local project to the target Supabase project:

```bash
supabase login
supabase link --project-ref your-project-ref
```

Apply the migrations:

```bash
supabase db push
```

The application-specific migrations are:

- `032_create_shadow_catalog.sql` creates `sm_categories` and `sm_products`.
- `033_create_prefixed_assistant_tables.sql` creates `sm_users`, `sm_chats`, `sm_messages`, and `sm_documents`.

The earlier migration files are part of the repository's existing database history. Apply migrations in order to a new project unless you are deliberately provisioning only the ShopMate tables in a separate database.

For local development, start Supabase with:

```bash
supabase start
supabase db reset
```

Use `supabase db reset` only when you intentionally want to recreate the local database from migrations.

## 4. Available application tables

### `sm_categories`

Public product categories.

- `id`: UUID primary key
- `slug`: unique route and lookup key
- `name`: localized JSON object, normally containing `en` and `ar`
- `description`: optional localized JSON object
- `sort_order`: display ordering
- `is_active`: public visibility flag
- `created_at`, `updated_at`: timestamps

### `sm_products`

Public catalog products.

- `id`: UUID primary key
- `slug`: unique product route and lookup key
- `category_id`: foreign key to `sm_categories`
- `name`, `short_description`, `description`: localized JSON objects
- `price`, `rating`, `reviews_count`: product display and review data
- `features`: localized feature lists
- `image_url`, `image_url_variations`: product media paths
- `is_featured`, `is_active`: catalog selection flags
- `keywords`, `colors`: product search and display metadata
- `created_at`, `updated_at`: timestamps

### `sm_users`

Application-level users used by assistant persistence. These are separate from the client-side guest session and may optionally reference Supabase Auth through `auth_user_id`.

### `sm_chats`

Assistant conversations. Each chat belongs to an application user through `userId`.

### `sm_messages`

Assistant messages belonging to a chat. Message `parts` and `attachments` are stored as JSONB.

### `sm_documents`

Assistant artifact versions for text, code, sheet, and chart content. The primary key uses both `id` and `createdAt` to support version history.

The cart is intentionally not stored in these tables. Cart state currently lives in the browser through `features/cart/store/cart-store.ts`.

## 5. Seed development data

The `/dev` page can seed the catalog using:

- `views/dev/model/initial-catalog-data.ts`: development seed records
- `views/dev/server/seed-catalog.ts`: Supabase seed action
- `views/dev/server/revalidate-public-pages.ts`: cache invalidation after changes

The seed action upserts categories and products into the tables generated from `SUPABASE_TABLE_PREFIX`, then invalidates the public catalog cache.

## 6. Switching database providers

There is no single-provider environment switch yet. Supabase is currently the concrete provider, but most application code is insulated from it by repository and persistence boundaries.

### Catalog provider replacement

To replace Supabase for catalog reads:

1. Keep the contracts and domain models in `entities/category/model` and `entities/product/model`.
2. Replace the implementations in `entities/category/repository` and `entities/product/repository` with repositories for the new provider.
3. Preserve the existing query functions (`listCategories`, `listProducts`, `getProductBySlug`, and related functions) so views do not change.
4. Move provider-specific connection code out of `shared/infrastructure/supabase` into a new provider infrastructure folder.
5. Update `views/dev/server/seed-catalog.ts` with a provider-specific seed implementation.

### Assistant persistence provider replacement

Implement `AssistantPersistence` from:

```text
features/ai-assistant/message-persistence/model/assistant-persistence.ts
```

The replacement must provide:

- `loadOrCreateChat`
- `saveLatestUserMessage`
- `saveAssistantMessages`

Then inject the new implementation from the assistant route/runtime composition. The UI and generic assistant handler should continue to depend on the contract, not on Supabase.

### What remains provider-specific

These areas require replacement or equivalent implementations when changing providers:

- `shared/infrastructure/supabase/`
- catalog repositories
- assistant history API query functions
- assistant message persistence
- artifact document persistence
- development seed and revalidation operations
- migration and deployment scripts

Do not import Supabase clients directly into reusable UI or generic assistant code. Keep provider-specific logic behind repositories, server adapters, or infrastructure modules.

## 7. Verification checklist

After database setup or a provider change:

```bash
npx tsc --noEmit
npm run build
```

Then verify manually:

1. `/dev` can seed the catalog.
2. `/en` and `/ar` display categories and products.
3. Product detail pages resolve by slug.
4. The assistant can create and reload a chat.
5. Assistant history can list and delete chats.
6. Artifact creation and loading work when document persistence is enabled.
