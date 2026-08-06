/**
 * Checkout Success Cart Panel
 *
 * Purpose: Reads the local cart store for mock checkout success receipt items.
 * Used in: views/checkout-success/ui/checkout-success-page.tsx
 * Used for: Keeps browser-only cart hydration inside the cart feature on success.
 */

'use client';

import { Button } from '@/components/ui/button';
import { AssistantAwareLink } from '@/features/ai-assistant/navigation';
import { useCart } from '@/features/cart/hooks/use-cart';
import type { AppLocale } from '@/shared/i18n/config';
import type { AppDictionary } from '@/shared/i18n/model/dictionary';
import type { CheckoutSuccessOrder } from '@/views/checkout-success';

type CheckoutSuccessCartPanelProps = {
  copy: AppDictionary['checkoutSuccess'];
  locale: AppLocale;
  order: CheckoutSuccessOrder;
};

/**
 * Renders a mock success receipt using hydrated local cart items.
 *
 * @param props - Localized copy, active locale, and mock order data.
 * @returns Client-rendered checkout success receipt.
 */
export function CheckoutSuccessCartPanel(props: CheckoutSuccessCartPanelProps) {
  const { copy, locale, order } = props;
  const { cart, isHydrated } = useCart();

  if (!isHydrated) {
    return (
      <section className="border border-foreground/20 bg-white p-6" aria-live="polite">
        <div className="h-4 w-36 rounded bg-gray-200" />
        <div className="mt-6 space-y-3">
          <div className="h-14 rounded bg-gray-100" />
          <div className="h-14 rounded bg-gray-100" />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{copy.loading}</p>
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="border border-foreground/20 bg-white">
        <div className="border-b border-foreground/70 bg-foreground px-5 py-4 text-background">
          <h2 className="text-lg font-semibold">{copy.receipt}</h2>
        </div>
        {cart.items.length > 0 ? (
          <ul className="divide-y">
            {cart.items.map(function renderSuccessItem(item) {
              const lineTotal = item.product.price * item.quantity;

              return (
                <li className="flex gap-4 px-5 py-4" key={item.productId}>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-gray-950">{item.product.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {copy.quantityLabel}: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-950">${lineTotal.toFixed(2)}</p>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="px-5 py-8">
            <h3 className="text-base font-semibold text-gray-950">{copy.emptyTitle}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.emptyDescription}</p>
          </div>
        )}
      </div>
      <aside className="h-fit border border-foreground/20 bg-white p-5">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-muted-foreground">{copy.orderNumber}</dt>
            <dd className="mt-1 font-semibold text-gray-950">{order.orderNumber}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{copy.customer}</dt>
            <dd className="mt-1 font-semibold text-gray-950">{order.customerName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{copy.paymentMethod}</dt>
            <dd className="mt-1 font-semibold text-gray-950">{order.paymentMethod}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{copy.deliveryEstimate}</dt>
            <dd className="mt-1 font-semibold text-gray-950">{order.deliveryEstimate}</dd>
          </div>
          <div className="border-t border-foreground/70 pt-4">
            <dt className="text-muted-foreground">{copy.totalPaid}</dt>
            <dd className="mt-1 text-xl font-semibold text-gray-950">${cart.totalPrice.toFixed(2)}</dd>
          </div>
        </dl>
        <Button asChild className="mt-6 w-full bg-primary text-foreground hover:bg-primary/90">
          <AssistantAwareLink href={`/${locale}/products`}>{copy.continueShopping}</AssistantAwareLink>
        </Button>
      </aside>
    </section>
  );
}
