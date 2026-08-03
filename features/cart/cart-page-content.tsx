/**
 * Cart Page Content Component
 * 
 * Purpose: Client component that displays cart items using CartItemCard
 * Used in: app/cart/page.tsx
 * Why: Separates client-side logic from server component page
 */

'use client';

import { useShop } from '@/features/shop/providers/shop-context';
import { CartItemCard } from '@/features/shop-assistant/tools/cart-info/cart-item-card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function CartPageContent() {
  const { cart, dispatchCartAction } = useShop();
  const router = useRouter();

  // Calculate total price
  const totalPrice = cart.items.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity);
  }, 0);

  return (
    <div className="w-full min-h-screen flex flex-col gap-6 p-4 pt-6">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
        </div>

        {/* Cart Content */}
        {cart.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              Start adding items to your cart to see them here
            </p>
            <Link href="/products">
              <Button className="cursor-pointer bg-gradient-to-r from-primary to-secondary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items List */}
            <div className="bg-[#191919]/20 dark:bg-gray-800/50 backdrop-blur-xl rounded-lg border border-white/20 dark:border-gray-700 overflow-hidden">
              {cart.items.map((item) => (
                <CartItemCard
                  key={item.productId}
                  id={item.productId}
                  title={item.product.name}
                  description={item.product.shortDescription}
                  badge={item.quantity > 1 ? `Qty: ${item.quantity}` : undefined}
                  price={item.product.price}
                  quantity={item.quantity}
                  image={item.product.image_url || undefined}
                  productId={item.productId}
                  dispatchCartAction={dispatchCartAction}
                />
              ))}
            </div>

            {/* Summary Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              {/* Subtotal */}
              <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                <span className="text-lg">Subtotal</span>
                <span className="text-lg font-semibold">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>

              {/* Separator */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-gray-900 dark:text-white">Total</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>

              {/* Checkout Button */}
              <Button
                className="cursor-pointer w-full bg-gradient-to-r from-primary to-secondary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors mt-4"
                onClick={() => {
                  router.push('/checkout');
                }}
              >
                Proceed to Checkout
              </Button>

              {/* Continue Shopping Link */}
              <Link href="/products" className="block text-center">
                <button className="cursor-pointer text-primary hover:text-primary/80 font-medium transition-colors">
                  Continue Shopping
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
