/**
 * @file features/shop-assistant/server/render/store-output.ts
 * Deterministic catalog + technical artifact renderer.
 * Used in: server/shop-assistant-runtime.ts after lookup (or instead of lookup for technical docs).
 * Used for: Cards, CSV sheets, and text artifacts without AI tools.
 *
 * Function Index:
 * renderStoreOutput: Stream cards / sheet / catalog document from rows.
 * renderTechnicalDocument: Text artifact from the user topic (no catalog rows).
 *
 * Steps:
 * 1. Skip missing streams or empty catalog lookups.
 * 2. Cards: stream live data-productCard + persist data-productCards.
 * 3. Sheet: precomputed CSV → createSheetDocument.
 * 4. Catalog document: precomputed markdown → createTextDocument.
 * 5. Technical document: createTextDocument from the title (no fake SKUs from lookup).
 */

import type { UIMessageStreamWriter } from 'ai';
import type { Product } from '@/features/catalog/model/product';
import type { PersistenceMode } from '@/features/ai-assistant/message-persistence/model/persistence-mode';
import { generateUUID } from '@/features/ai-assistant/lib/utils';
import { logger } from '@/features/ai-assistant/lib/logger';
import { streamArtifactMetadata } from '@/features/ai-assistant/components/artifacts/text/tool/create-document-tool';
import { createSheetDocument } from '@/features/ai-assistant/components/artifacts/sheet/server';
import { createTextDocument } from '@/features/ai-assistant/components/artifacts/text/tool/server';
import { toProductCatalogCsv } from '../../transform/catalog/product-catalog-csv';
import { toProductCatalogDocument } from '../../transform/catalog/product-catalog-document';
import { buildProductCardsPart } from '../../transform/catalog/product-cards-part';

/** Catalog views this renderer owns. Technical document is a separate call. */
export type StoreRenderKind = 'cards' | 'sheet' | 'document';

/** Input required to render catalog rows after lookup. */
export interface RenderStoreOutputInput {
  products: Product[];
  render: StoreRenderKind;
  title?: string;
  dataStream?: UIMessageStreamWriter<any>;
  persistenceMode: PersistenceMode;
}

/** Result consumed by the runtime confirm stub and later speaker. */
export interface RenderStoreOutputResult {
  kind: StoreRenderKind | 'none';
  title?: string;
  documentId?: string;
  productCount: number;
  empty: boolean;
}

/**
 * Stream cards, a sheet, or a catalog document from lookup rows.
 *
 * @example
 * await renderStoreOutput({ products, render: 'sheet', dataStream, persistenceMode: 'local' })
 */
export async function renderStoreOutput(
  input: RenderStoreOutputInput,
): Promise<RenderStoreOutputResult> {
  const productCount = input.products.length;

  // 1. Conversation-equivalent skips happen in the runtime. Empty lookup must not invent UI.
  if (!input.dataStream || productCount === 0) {
    logger.node({
      name: 'RENDER',
      input: { render: input.render, productCount, hasDataStream: Boolean(input.dataStream) },
      details: productCount === 0
        ? 'Empty lookup. No cards, sheet, or catalog document.'
        : 'No dataStream. Catalog render skipped.',
      result: { kind: 'none', productCount, empty: productCount === 0 },
      status: 'skipped',
    });
    return { kind: 'none', productCount, empty: productCount === 0 };
  }

  try {
    if (input.render === 'cards') {
      // 2. Live cards for the current stream + a persisted part for refresh/remount.
      const part = buildProductCardsPart(input.products, input.title);
      for (const product of input.products) {
        input.dataStream.write({
          type: 'data-productCard',
          data: product,
          transient: true,
        });
      }
      input.dataStream.write({
        type: 'data-productCards',
        data: part,
      });
      logger.node({
        name: 'RENDER',
        input: { render: 'cards', productCount, title: input.title },
        details: 'Streamed product cards from lookup rows. No second catalog search.',
        result: { kind: 'cards', productCount, names: input.products.map((product) => product.name) },
        status: 'success',
      });
      return { kind: 'cards', title: input.title, productCount, empty: false };
    }

    if (input.render === 'sheet') {
      // 3. Precomputed CSV only. Model does not invent rows.
      const title = input.title || 'ShopMate product catalog';
      const documentId = generateUUID();
      streamArtifactMetadata(input.dataStream, { id: documentId, title, kind: 'sheet' });
      await createSheetDocument({
        title,
        dataStream: input.dataStream,
        documentId,
        persistenceMode: input.persistenceMode,
        content: toProductCatalogCsv(input.products),
      });
      logger.node({
        name: 'RENDER',
        input: { render: 'sheet', productCount, title, documentId },
        details: 'Built a sheet artifact from real catalog CSV.',
        result: { kind: 'sheet', title, documentId, productCount },
        status: 'success',
      });
      return { kind: 'sheet', title, documentId, productCount, empty: false };
    }

    // 4. Catalog document filled from rows. Not a specialist agent.
    const title = input.title || 'ShopMate buying guide';
    const documentId = generateUUID();
    streamArtifactMetadata(input.dataStream, { id: documentId, title, kind: 'text' });
    await createTextDocument({
      title,
      dataStream: input.dataStream,
      documentId,
      persistenceMode: input.persistenceMode,
      content: toProductCatalogDocument(input.products, title),
    });
    logger.node({
      name: 'RENDER',
      input: { render: 'document', productCount, title, documentId },
      details: 'Built a text artifact from lookup rows. Model did not invent SKUs.',
      result: { kind: 'document', title, documentId, productCount },
      status: 'success',
    });
    return { kind: 'document', title, documentId, productCount, empty: false };
  } catch (error) {
    logger.node({
      name: 'RENDER',
      input: { render: input.render, productCount, title: input.title },
      details: 'Catalog render failed.',
      status: 'error',
      error,
    });
    throw error;
  }
}

/**
 * Create a technical text artifact from the user topic. No catalog lookup rows.
 *
 * @example
 * await renderTechnicalDocument({ title: 'Windows vs Mac laptops', dataStream, persistenceMode: 'local' })
 */
export async function renderTechnicalDocument(input: {
  title: string;
  dataStream?: UIMessageStreamWriter<any>;
  persistenceMode: PersistenceMode;
}): Promise<RenderStoreOutputResult> {
  if (!input.dataStream) {
    logger.node({
      name: 'RENDER',
      input: { render: 'technical-document', title: input.title },
      details: 'No dataStream. Technical document skipped.',
      result: { kind: 'none', empty: true },
      status: 'skipped',
    });
    return { kind: 'none', title: input.title, productCount: 0, empty: true };
  }

  const documentId = generateUUID();

  try {
    // 5. Title is the topic. No catalog rows — createTextDocument generates prose from the title.
    streamArtifactMetadata(input.dataStream, { id: documentId, title: input.title, kind: 'text' });
    await createTextDocument({
      title: input.title,
      dataStream: input.dataStream,
      documentId,
      persistenceMode: input.persistenceMode,
    });
    logger.node({
      name: 'RENDER',
      input: { render: 'technical-document', title: input.title, documentId },
      details: 'Created a technical text artifact from the user topic. No catalog lookup.',
      result: { kind: 'document', title: input.title, documentId },
      status: 'success',
    });
    return { kind: 'document', title: input.title, documentId, productCount: 0, empty: false };
  } catch (error) {
    logger.node({
      name: 'RENDER',
      input: { render: 'technical-document', title: input.title, documentId },
      details: 'Technical document render failed.',
      status: 'error',
      error,
    });
    throw error;
  }
}
