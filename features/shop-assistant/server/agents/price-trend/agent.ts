/** Handles product price-trend questions and creates a chart artifact. */

import { convertToModelMessages, smoothStream, streamText, type UIMessage, type UIMessageStreamWriter } from 'ai';
import { createDocumentTool } from '@/features/ai-assistant/components/artifacts/text/tool/create-document-tool';
import type { AssistantResolvedModels } from '@/features/ai-assistant/server/assistant-model-provider';
import type { CatalogSource } from '../../../model/catalog-source';
import { getPriceTrendPrompt } from './prompt';

interface PriceTrendRequest {
  messages: UIMessage[];
  userQuery: string;
  models: AssistantResolvedModels;
  catalogSource: CatalogSource;
}

export async function processPriceTrendRequest(
  request: PriceTrendRequest,
  dataStream?: UIMessageStreamWriter<any>
) {
  const products = await request.catalogSource.searchProducts({ query: request.userQuery, limit: 3 });
  const product = products[0];
  const productContext = product
    ? `Product: ${product.name}\nCurrent price: $${product.price.toFixed(2)}\nCategory: ${product.category}`
    : 'No exact product was found; explain that the trend is unavailable.';

  const mockHistory = product
    ? Array.from({ length: 5 }, (_, index) => ({
        year: String(new Date().getFullYear() - 4 + index),
        product: product.name,
        price: Number((product.price * (1.18 - index * 0.045)).toFixed(2)),
      }))
    : [];

  let sharedDocumentId: string | null = null;
  const result = streamText({
    model: request.models.chat,
    system: `${getPriceTrendPrompt()}\n\n${productContext}\n\nDevelopment price history:\n${JSON.stringify(mockHistory)}`,
    messages: convertToModelMessages(request.messages),
    experimental_transform: smoothStream({ delayInMs: 10, chunking: 'word' }),
    tools: dataStream ? {
      createDocument: createDocumentTool(dataStream, () => sharedDocumentId, (id) => { sharedDocumentId = id; }),
    } : undefined,
    onStepFinish: async ({ toolCalls }) => {
      if (!dataStream) return;
      for (const toolCall of toolCalls || []) {
        if (toolCall.toolName !== 'createDocument') continue;
        const input = 'input' in toolCall ? toolCall.input as { title: string; kind?: string } : undefined;
        if (!input || input.kind !== 'chart') continue;
        const chartContent = JSON.stringify({
          labels: mockHistory.map((entry) => entry.year),
          datasets: [{
            label: product?.name || 'Price',
            data: mockHistory.map((entry) => entry.price),
          }],
        });
        dataStream.write({ type: 'data-chartDelta', data: chartContent, transient: true });
        dataStream.write({ type: 'data-artifactStatus', data: 'complete', transient: true });
        sharedDocumentId = null;
      }
    },
  });

  result.consumeStream();
  return result.toUIMessageStream({ sendSources: true, sendReasoning: true });
}
