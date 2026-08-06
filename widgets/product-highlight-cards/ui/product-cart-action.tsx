/**
 * Product Cart Action
 *
 * Purpose: Provides add and quantity controls for a product card.
 * Used in: widgets/product-highlight-cards/ui/product-highlight-cards.tsx
 */

'use client';

import { Minus, Plus, ShoppingCart } from 'lucide-react';

import type { Product as CartProduct } from '@/features/catalog/model/product';
import { useCart } from '@/features/cart/hooks/use-cart';

type ProductCartActionProps = {
  cartProduct: CartProduct;
  name: string;
  size?: 'default' | 'large';
};

/**
 * Renders an add-to-cart button or quantity stepper.
 *
 * @param props - Cart-compatible product and accessible product name.
 * @returns The current cart action for the product.
 */
export function ProductCartAction({ cartProduct, name, size = 'default' }: ProductCartActionProps) {
  const { addItem, cart, decreaseQuantity, increaseQuantity } = useCart();
  const cartItem = cart.items.find(function findCartItem(item) {
    return item.productId === cartProduct.id;
  });

  function handleAddToCart() {
    void addItem(cartProduct);
  }

  function handleDecrease() {
    void decreaseQuantity(cartProduct.id);
  }

  function handleIncrease() {
    void increaseQuantity(cartProduct.id);
  }

  if (!cartItem) {
    return (
      <button
        aria-label={`Add ${name} to cart`}
        className={`inline-flex items-center gap-2 bg-foreground font-button text-background cursor-pointer ${size === 'large' ? 'px-6 py-3 text-sm' : 'px-4 py-2 text-xs'}`}
        onClick={handleAddToCart}
        type="button"
      >
        Add to cart
        <ShoppingCart aria-hidden="true" className="size-4 stroke-2" />
      </button>
    );
  }

  return (
    <div aria-label={`${name} quantity`} className="inline-flex items-center bg-foreground text-background">
      <button aria-label={`Decrease ${name} quantity`} className={`flex items-center justify-center cursor-pointer ${size === 'large' ? 'size-11' : 'size-8'}`} onClick={handleDecrease} type="button">
        <Minus aria-hidden="true" className={size === 'large' ? 'size-4 stroke-2' : 'size-3.5 stroke-2'} />
      </button>
      <span className={`text-center font-button ${size === 'large' ? 'min-w-8 text-sm' : 'min-w-6 text-xs'}`}>{cartItem.quantity}</span>
      <button aria-label={`Increase ${name} quantity`} className={`flex items-center justify-center cursor-pointer ${size === 'large' ? 'size-11' : 'size-8'}`} onClick={handleIncrease} type="button">
        <Plus aria-hidden="true" className={size === 'large' ? 'size-4 stroke-2' : 'size-3.5 stroke-2'} />
      </button>
    </div>
  );
}
