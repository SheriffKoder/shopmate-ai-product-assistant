/**
 * @file features/shop-assistant/server/shop-assistant-runtime.ts
 * Shop Assistant runtime: schema → plan → lookup → render → speaker.
 * Used in: app/api/ai-assistant/route.ts via shop-assistant-config.
 * Used for: Deterministic shop UI from lookup rows, then optional speaker prose with no tools.
 *
 * Function Index:
 * shopAssistantRuntime: AssistantRuntime implementation.
 *
 * Steps:
 * 1. Label the query with the one schema LLM.
 * 2. planFromSchema(action + view) — no agent switch.
 * 3. Look up catalog rows when the plan requires it (conversation skips lookup).
 * 4. Render cards / sheet / document / cart / refuse / policy / conversation metadata.
 * 5. Optional speaker (no tools). Deterministic text if speaker skips or fails.
 */

import type { AssistantRuntime } from '@/features/ai-assistant/model/assistant-runtime';
import { logger } from '@/features/ai-assistant/lib/logger';
import { getAssistantModels } from '@/features/ai-assistant/server/assistant-model-provider';
import { getInitialProducts } from '@/features/catalog/model/initial-data';
import type { Product } from '@/features/catalog/model/product';
import type { CartState } from '@/features/cart/model/cart';
import type { AssistantMetadata } from '../model/assistant-request';
import type { ExecutionPlan } from '../model/execution-plan';
import { planFromSchema } from '../model/execution-plan';
import { catalogRenderTitle, resolveRuntimeLookup } from '../lib/catalog/runtime-lookup';
import { buildCatalogFacts } from '../lib/catalog/build-catalog-facts';
import { buildFindChipsFromProducts } from '../lib/catalog/find-chips-from-products';
import { labelAssistantRequest } from './request-agent';
import { createMockShopApiClient } from './sources/mock-shop-api-client';
import {
  createCatalogSourceFromShopApi,
  createCartSourceFromShopApi,
} from './sources/shop-api-sources';
import {
  EMPTY_CATALOG_MESSAGE,
  POLICY_MESSAGE,
  REFUSE_MESSAGE,
  createTextReplyStream,
} from './render/reply';
import { renderCart } from './render/cart';
import { renderStoreOutput, renderTechnicalDocument } from './render/store-output';
import { renderUiMetadata } from './render/ui-metadata';
import { createSpeakerStream } from './speaker';

/** Use a client-sent cart snapshot when present; otherwise the mock starts empty. */
function readBusinessCart(businessContext: Record<string, unknown>): CartState | undefined {
  const cart = businessContext.cart;
  if (!cart || typeof cart !== 'object') return undefined;
  if (!Array.isArray((cart as { items?: unknown }).items)) return undefined;
  return cart as CartState;
}

/**
 * Runtime: schema → plan → lookup → render → optional speaker.
 */
export const shopAssistantRuntime: AssistantRuntime<Record<string, unknown>> = {
  async stream(request, dataStream) {
    // 1. Resolve models once per stream. Same registry as v1.
    const models = getAssistantModels(request.modelId);

    // 2. One schema LLM. Failure already logged inside the request agent.
    const assistantRequest = await labelAssistantRequest({
      query: request.userQuery,
      model: models.chat,
    });

    // 3. Pure planner. View never overrides action.
    const plan = planFromSchema(assistantRequest);
    logger.node({
      name: 'EXECUTION PLAN',
      input: {
        query: request.userQuery,
        action: assistantRequest.action,
        view: assistantRequest.view,
        metadataType: assistantRequest.metadata.type,
      },
      details: 'Mapped action + view to lookup / render / speaker. No agent switch.',
      result: plan,
      status: 'success',
    });

    // 4. Compose catalog + cart sources. Prefer a client cart snapshot when the request includes one.
    const shopApi = createMockShopApiClient(
      getInitialProducts(),
      readBusinessCart(request.businessContext),
    );
    const catalogSource = createCatalogSourceFromShopApi(shopApi);
    const cartSource = createCartSourceFromShopApi(shopApi);
    const lookup = resolveRuntimeLookup({
      userQuery: request.userQuery,
      request: assistantRequest,
      plan,
    });

    // 5. Deterministic CatalogSource search. Skip when the plan is cart / technical / unrelated / policy.
    let catalogProducts: Product[] = [];
    try {
      catalogProducts = lookup.shouldLookup
        ? await catalogSource.searchProducts({
            query: lookup.lookupQuery,
            category: assistantRequest.category ?? undefined,
            minPrice: assistantRequest.constraints.minPrice ?? undefined,
            maxPrice: assistantRequest.constraints.maxPrice ?? undefined,
            colors: assistantRequest.constraints.colors,
            keywords: assistantRequest.constraints.features,
            sortBy: assistantRequest.constraints.sortBy ?? undefined,
            limit: lookup.limit,
          })
        : [];
      logger.node({
        name: 'CATALOG LOOKUP',
        input: {
          query: request.userQuery,
          catalogQuery: lookup.lookupQuery,
          browseAll: lookup.browseAll,
          category: assistantRequest.category,
          view: assistantRequest.view,
          requiresCatalogLookup: plan.requiresCatalogLookup,
          limit: lookup.limit,
        },
        details: lookup.shouldLookup
          ? 'Searched CatalogSource with unique-category matching.'
          : 'Skipped lookup; this request is not a catalog answer.',
        result: {
          productCount: catalogProducts.length,
          productNames: catalogProducts.slice(0, 8).map((product) => product.name),
        },
        status: lookup.shouldLookup ? 'success' : 'skipped',
      });
    } catch (error) {
      logger.node({
        name: 'CATALOG LOOKUP',
        input: {
          query: request.userQuery,
          catalogQuery: lookup.lookupQuery,
          browseAll: lookup.browseAll,
        },
        details: 'CatalogSource.searchProducts failed.',
        status: 'error',
        error,
      });
      throw error;
    }

    // 6. Render from the plan, then optional speaker prose with no tools.
    const rendered = await renderExecution({
      plan,
      products: catalogProducts,
      browseAll: lookup.browseAll,
      userQuery: request.userQuery,
      metadata: assistantRequest.metadata,
      maxPrice: assistantRequest.constraints.maxPrice,
      dataStream,
      persistenceMode: request.persistenceMode,
      cartSource,
    });

    const speakerStream = await createSpeakerStream({
      model: models.chat,
      speaker: plan.speaker,
      render: plan.render,
      userQuery: request.userQuery,
      catalogNames: rendered.catalogNames,
      catalogFacts: rendered.catalogFacts,
      cartItemCount: rendered.cartItemCount,
      renderedTitle: rendered.renderedTitle,
      lookupEmpty: rendered.lookupEmpty,
      categoryHints: rendered.categoryHints,
    });

    if (speakerStream) return speakerStream;
    return createTextReplyStream(rendered.reply);
  },
};

/** Deterministic render result. Speaker uses context; reply is the fallback stream. */
interface RenderExecutionResult {
  reply: string;
  catalogNames: string[];
  /** Factual lines for answer view. */
  catalogFacts?: string[];
  cartItemCount?: number;
  renderedTitle?: string;
  lookupEmpty: boolean;
  categoryHints?: string[];
}

function renderResult(
  reply: string,
  rest: Omit<RenderExecutionResult, 'reply'> = { catalogNames: [], lookupEmpty: false },
): RenderExecutionResult {
  return { reply, ...rest };
}

/** Run the planned server render and return fallback text plus speaker context. */
async function renderExecution(input: {
  plan: ExecutionPlan;
  products: Product[];
  browseAll: boolean;
  userQuery: string;
  metadata: AssistantMetadata;
  maxPrice?: number | null;
  dataStream: Parameters<AssistantRuntime['stream']>[1];
  persistenceMode: 'local' | 'database';
  cartSource: ReturnType<typeof createCartSourceFromShopApi>;
}): Promise<RenderExecutionResult> {
  const catalogNames = input.products.map((product) => product.name);

  if (input.plan.render === 'refuse') {
    logger.node({
      name: 'RENDER',
      input: { render: 'refuse' },
      details: 'Deterministic refuse. No lookup and no catalog UI.',
      result: { kind: 'refuse' },
      status: 'success',
    });
    return renderResult(REFUSE_MESSAGE);
  }

  if (input.plan.render === 'policy') {
    logger.node({
      name: 'RENDER',
      input: { render: 'policy' },
      details: 'Deterministic store policy. Schema did not invent legal copy.',
      result: { kind: 'policy' },
      status: 'success',
    });
    return renderResult(POLICY_MESSAGE);
  }

  if (input.plan.render === 'cart') {
    const cartPayload = await renderCart({ cartSource: input.cartSource, dataStream: input.dataStream });
    return renderResult("Here's your cart.", {
      catalogNames: [],
      cartItemCount: cartPayload.totalItems,
      lookupEmpty: false,
    });
  }

  if (input.plan.render === 'conversation') {
    // Speaker-owned. Never dump cards.
    // Prefer Find chips from matched products when lookup returned rows.
    // Else fall back to schema category chips (open rec with no filter).
    const productChips = buildFindChipsFromProducts(input.products);
    const schemaChips = input.plan.action === 'catalog'
      && input.metadata.type === 'buttons'
      && input.metadata.items.length > 0
      ? input.metadata
      : null;
    const chipsToWrite = productChips.type === 'buttons' && productChips.items.length > 0
      ? productChips
      : schemaChips;
    const metadataPart = chipsToWrite
      ? renderUiMetadata({
          metadata: chipsToWrite,
          maxPrice: input.maxPrice,
          dataStream: input.dataStream,
        })
      : null;
    const categoryHints = metadataPart?.items.map((item) => item.label) ?? [];
    const catalogFacts = buildCatalogFacts(input.products);

    logger.node({
      name: 'RENDER',
      input: {
        render: 'conversation',
        action: input.plan.action,
        productCount: input.products.length,
        chipSource: productChips.items.length > 0 ? 'products' : (schemaChips ? 'schema' : 'none'),
        itemCount: categoryHints.length,
      },
      details: catalogFacts.length > 0
        ? 'Conversation: speaker may cite lookup products. Find chips from matched names. No cards.'
        : metadataPart
          ? 'Conversation: no lookup rows. Streamed Find chips from schema metadata. No cards.'
          : 'Conversation: speaker-owned. No cards, no metadata chips.',
      result: {
        kind: 'conversation',
        metadataType: metadataPart?.type ?? 'none',
        values: metadataPart?.items.map((item) => item.value) ?? [],
        factCount: catalogFacts.length,
      },
      status: 'success',
    });

    return renderResult('How can I help with ShopMate shopping?', {
      catalogNames,
      catalogFacts,
      lookupEmpty: false,
      categoryHints,
    });
  }

  if (input.plan.render === 'answer') {
    // Schema view=answer: lookup already ran. Speaker owns the reply from store facts.
    // Find chips come from matched product names, not schema aisle metadata.
    const productChips = buildFindChipsFromProducts(input.products);
    const metadataPart = productChips.type === 'buttons' && productChips.items.length > 0
      ? renderUiMetadata({
          metadata: productChips,
          maxPrice: input.maxPrice,
          dataStream: input.dataStream,
        })
      : null;
    const categoryHints = metadataPart?.items.map((item) => item.label) ?? [];
    const catalogFacts = buildCatalogFacts(input.products);
    const lookupEmpty = input.products.length === 0;

    logger.node({
      name: 'RENDER',
      input: {
        render: 'answer',
        action: input.plan.action,
        productCount: input.products.length,
        chipCount: categoryHints.length,
      },
      details: lookupEmpty
        ? 'Answer path: empty lookup. Speaker may say the product is not in the store. No cards.'
        : 'Answer path: lookup facts for speaker. Find chips from matched product names. No cards.',
      result: {
        kind: 'answer',
        catalogNames,
        factCount: catalogFacts.length,
        metadataType: metadataPart?.type ?? 'none',
        values: metadataPart?.items.map((item) => item.value) ?? [],
      },
      status: 'success',
    });

    return renderResult(
      lookupEmpty
        ? EMPTY_CATALOG_MESSAGE
        : 'Here is what I found about that product in the store.',
      {
        catalogNames,
        catalogFacts,
        lookupEmpty,
        categoryHints,
      },
    );
  }

  if (input.plan.render === 'document' && input.plan.action === 'technical') {
    const title = input.userQuery.trim() || 'Technical note';
    await renderTechnicalDocument({
      title,
      dataStream: input.dataStream,
      persistenceMode: input.persistenceMode,
    });
    return renderResult('I created a document about that topic.', {
      catalogNames: [],
      renderedTitle: title,
      lookupEmpty: false,
    });
  }

  if (input.products.length === 0) {
    logger.node({
      name: 'RENDER',
      input: { render: input.plan.render, productCount: 0 },
      details: 'Empty catalog lookup. No invented cards, sheet, or document.',
      result: { kind: 'none', empty: true },
      status: 'skipped',
    });
    return renderResult(EMPTY_CATALOG_MESSAGE, { catalogNames: [], lookupEmpty: true });
  }

  const title = catalogRenderTitle(
    input.browseAll,
    input.plan.render as 'cards' | 'sheet' | 'document',
    input.userQuery,
  );
  const rendered = await renderStoreOutput({
    products: input.products,
    render: input.plan.render as 'cards' | 'sheet' | 'document',
    title,
    dataStream: input.dataStream,
    persistenceMode: input.persistenceMode,
  });

  if (rendered.kind === 'sheet') {
    return renderResult('I created a catalog sheet from the store products.', {
      catalogNames,
      renderedTitle: rendered.title,
      lookupEmpty: false,
    });
  }
  if (rendered.kind === 'document') {
    return renderResult('I created a document from the store products.', {
      catalogNames,
      renderedTitle: rendered.title,
      lookupEmpty: false,
    });
  }
  return renderResult('Here are the matching ShopMate products.', {
    catalogNames,
    renderedTitle: rendered.title,
    lookupEmpty: false,
  });
}
