'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAssistantAwareRouter } from '@/features/ai-assistant/navigation';
import { getLocaleFromPathname } from '@/shared/i18n/lib/get-locale-from-pathname';
import type { CartDropdownItem } from './cart-dropdown.types';

interface CartDropdownSummaryProps {
  items: CartDropdownItem[];
  onClose: () => void;
}

export function CartDropdownSummary({ items, onClose }: CartDropdownSummaryProps) {
  const router = useAssistantAwareRouter();
  const locale = getLocaleFromPathname(usePathname());
  if (items.length === 0) return null;

  const totalPrice = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  function goToCheckout() {
    router.push(`/${locale}/checkout`);
    onClose();
  }

  function goToCart() {
    router.push(`/${locale}/products`);
    onClose();
  }

  return (
    <div className="border-t border-white/10 px-4 py-3 space-y-3 bg-white">
      <div className="flex justify-between items-center">
        <span className="text-black font-semibold text-lg">Total:</span>
        <span className="text-black font-bold text-xl">${totalPrice.toFixed(2)}</span>
      </div>
      <Button className="cursor-pointer w-full bg-gradient-to-r from-primary to-secondary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors" onClick={goToCheckout}>
        Checkout
      </Button>
      <Button variant="outline" className="cursor-pointer w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2 px-4 rounded-lg transition-colors" onClick={goToCart}>
        Keep Shopping
      </Button>
    </div>
  );
}
