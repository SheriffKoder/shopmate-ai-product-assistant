/**
 * Product Search Tool Renderer
 * 
 * Purpose: Renders productSearch tool output
 * Used in: message-part-orchestrator-renderer.tsx
 * Why: Separates product search tool rendering logic
 */

'use client';

import { Product } from '@/features/catalog/model/product';
import { CartState } from '@/features/cart/model/cart';
import { MarkdownText } from '@/features/ai-assistant/components/ui/markdown-text';
import { ProductCard } from './product-card';
import type { ShopAssistantCommand } from '../../model/shop-assistant-command-handler';

interface ProductSearchToolRendererProps {
  toolPart: any;
  messageId: string;
  partIndex: number;
  cart?: CartState;
  onCommand?: (command: ShopAssistantCommand) => void | Promise<void>;
}

export const ProductSearchToolRenderer = ({
  toolPart,
  messageId,
  partIndex,
  cart,
  onCommand,
}: ProductSearchToolRendererProps) => {
  if (toolPart.state !== 'output-available' || !toolPart.output) {
    return null;
  }

  const searchOutput = toolPart.output as {
    header: string;
    paragraph: string;
    products: Product[];
    footer?: string;
  };

  return (
    <div key={`${messageId}-${partIndex}`} className="w-full space-y-4">
      {/* Header */}
      {searchOutput.header && (
        <MarkdownText className="!text-black text-xl font-semibold">
          {searchOutput.header}
        </MarkdownText>
      )}

      {/* Paragraph */}
      {searchOutput.paragraph && (
        <MarkdownText className="!text-black">
          {searchOutput.paragraph}
        </MarkdownText>
      )}

      {/* Products Grid */}
      {searchOutput.products && searchOutput.products.length > 0 && (
        <div className="flex flex-row gap-4 mt-4 flex-wrap">
          {searchOutput.products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              cart={cart}
              onCommand={onCommand}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      {searchOutput.footer && (
        <MarkdownText className="text-gray-400 text-sm">
          {searchOutput.footer}
        </MarkdownText>
      )}
    </div>
  );
};
