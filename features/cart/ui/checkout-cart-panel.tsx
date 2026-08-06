/**
 * Checkout Cart Panel
 *
 * Purpose: Reads the local cart store for checkout line items and totals.
 * Used in: views/checkout/ui/checkout-page.tsx
 * Used for: Keeps local cart hydration and browser-only cart state inside the cart feature.
 */

'use client';

import { Button } from '@/components/ui/button';
import { AssistantAwareLink } from '@/features/ai-assistant/navigation';
import { useCart } from '@/features/cart/hooks/use-cart';
import type { AppLocale } from '@/shared/i18n/config';
import type { AppDictionary } from '@/shared/i18n/model/dictionary';

type CheckoutCartPanelProps = {
  copy: AppDictionary['checkout'];
  locale: AppLocale;
};

/**
 * Renders the checkout cart panel from the hydrated cart store.
 *
 * @param props - Localized checkout copy and active locale.
 * @returns Client-rendered checkout cart state.
 */
export function CheckoutCartPanel(props: CheckoutCartPanelProps) {
  const { copy, locale } = props;
  const { cart, isHydrated } = useCart();

  if (!isHydrated) {
    return (
      <section className="rounded-md border bg-white p-6 shadow-sm" aria-live="polite">
        <div className="h-4 w-32 rounded bg-gray-200" />
        <div className="mt-6 space-y-3">
          <div className="h-16 rounded bg-gray-100" />
          <div className="h-16 rounded bg-gray-100" />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{copy.loading}</p>
      </section>
    );
  }

  if (cart.items.length === 0) {
    return (
      <section className="rounded-md border bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-950">{copy.emptyTitle}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          {copy.emptyDescription}
        </p>
        <Button asChild className="mt-6">
          <AssistantAwareLink href={`/${locale}/products`}>{copy.continueShopping}</AssistantAwareLink>
        </Button>
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="border border-foreground/70 bg-white shadow-sm">
        <div className="border-b border-foreground/70 bg-foreground px-5 py-4 text-background">
          <h2 className="text-lg font-semibold">{copy.orderSummary}</h2>
        </div>
        <ul className="divide-y">
          {cart.items.map(function renderCheckoutItem(item) {
            const lineTotal = item.product.price * item.quantity;

            return (
              <li className="flex gap-4 px-5 py-4" key={item.productId}>
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100">
                  {item.product.image_url ? (
                    <img
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                      src={item.product.image_url}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">No image</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-950">{item.product.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {item.product.shortDescription}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {copy.quantityLabel}: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-950">${lineTotal.toFixed(2)}</p>
              </li>
            );
          })}
        </ul>
      </div>
      <aside className="h-fit border border-foreground/70 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-950">{copy.estimatedTotal}</h2>
        <div className="mt-5 space-y-3 text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>{copy.subtotal}</span>
            <span>${cart.totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between border-t pt-3 text-base font-semibold text-gray-950">
            <span>{copy.estimatedTotal}</span>
            <span>${cart.totalPrice.toFixed(2)}</span>
          </div>
        </div>
        <Button asChild className="mt-6 w-full">
          <AssistantAwareLink href={`/${locale}/checkout/success`}>{copy.actionLabel}</AssistantAwareLink>
        </Button>
      </aside>
    </section>
  );
}
