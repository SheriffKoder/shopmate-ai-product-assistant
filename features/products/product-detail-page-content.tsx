/**
 * Product Detail Page Content Component
 * 
 * Purpose: Client component that displays product details
 * Used in: app/products/[id]/page.tsx
 * Why: Separates client-side logic from server component page
 */

'use client';

import { useShop } from '@/features/ai-assistant/providers/shop-context';
import { ProductDetailPage } from '@/features/products/components/ProductDetailPage';
import { useRouter } from 'next/navigation';

interface ProductDetailPageContentProps {
  productId: string;
}

export function ProductDetailPageContent({ productId }: ProductDetailPageContentProps) {
  const { products, cart, dispatchCartAction } = useShop();
  const router = useRouter();

  // Find the product by ID
  const product = products.find((p) => p.id === productId);

  // Check if product is in cart
  const isProductInCart = product
    ? cart.items.some((item) => item.productId === product.id)
    : false;

  const handleBack = () => {
    router.back();
  };

  const handleAddToCart = (productId: string) => {
    const productToAdd = products.find((p) => p.id === productId);
    if (productToAdd) {
      dispatchCartAction({
        type: 'ADD_TO_CART',
        payload: productToAdd,
      });
    }
  };

  if (!product) {
    return (
      <div className="w-full min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-2">Product Not Found</h1>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <ProductDetailPage
      product={product}
      onBack={handleBack}
      onAddToCart={handleAddToCart}
      isInCart={isProductInCart}
    />
  );
}

