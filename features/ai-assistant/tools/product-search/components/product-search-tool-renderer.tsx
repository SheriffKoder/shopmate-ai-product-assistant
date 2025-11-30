/**
 * Product Search Tool Renderer
 * 
 * Purpose: Renders productSearch tool output
 * Used in: message-part-orchestrator-renderer.tsx
 * Why: Separates product search tool rendering logic
 */

'use client';

import { Product } from '@/features/ai-assistant/types/product';
import { CartAction, CartState } from '@/features/ai-assistant/types/cart';
import { MarkdownText } from '../../../components/ui/markdown-text';
import { ProductCard } from './product-card';

interface ProductSearchToolRendererProps {
  toolPart: any;
  messageId: string;
  partIndex: number;
  dispatchCartAction?: (action: CartAction) => void;
  cart?: CartState;
}

export const ProductSearchToolRenderer = ({
  toolPart,
  messageId,
  partIndex,
  dispatchCartAction,
  cart,
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
        <div className="grid grid-cols-1 gap-4 mt-4">
          {searchOutput.products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              dispatchCartAction={dispatchCartAction}
              cart={cart}
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

