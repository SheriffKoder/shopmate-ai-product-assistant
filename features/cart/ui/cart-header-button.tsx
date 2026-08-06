/**
 * Cart Header Button
 *
 * Purpose: Connects the cart store to the header cart dropdown.
 * Used in: widgets/app-header/ui/app-header.tsx
 * Used for: Keeps cart mapping and mutation callbacks inside the cart feature.
 */

'use client';

import { ShoppingCart } from 'lucide-react';

import { useCart } from '@/features/cart/hooks/use-cart';
import CartHeaderDropdown from '@/features/cart/ui/cart-header-dropdown';

/**
 * Renders the connected cart dropdown button for the app header.
 *
 * @returns Header cart island with current cart data and actions.
 */
export function CartHeaderButton() {
  const { cart, removeItem, decreaseQuantity, increaseQuantity } = useCart();
  const cartItems = cart.items.map((item) => ({
    id: item.productId,
    title: item.product.name,
    description: item.product.shortDescription,
    badge: item.quantity > 1 ? `Qty: ${item.quantity}` : undefined,
    price: item.product.price,
    quantity: item.quantity,
    productId: item.productId,
    image: item.product.image_url || undefined,
  }));

  return (
    <CartHeaderDropdown
      icon={ShoppingCart}
      label="Cart"
      items={cartItems}
      badgeCount={cart.totalItems}
      className=""
      inactiveClassName="bg-foreground text-background"
      activeClassName="bg-primary text-foreground"
      headerTitle="Shopping Cart"
      tooltip="Shopping Cart"
      removeItem={removeItem}
      decreaseQuantity={decreaseQuantity}
      increaseQuantity={increaseQuantity}
    />
  );
}
