/**
 * Checkout Success Page UI
 *
 * Purpose: Renders the localized server-first checkout success shell.
 * Used in: views/checkout-success/index.tsx
 * Used for: Displays mock user/order data and delegates cart receipt items to the cart feature.
 */

import { CheckoutSuccessCartPanel } from '@/features/cart/ui/checkout-success-cart-panel';
import type { AppLocale } from '@/shared/i18n/config';
import type { AppDictionary } from '@/shared/i18n/model/dictionary';
import type { CheckoutSuccessOrder } from '@/views/checkout-success';

type CheckoutSuccessPageProps = {
  dictionary: AppDictionary;
  locale: AppLocale;
  order: CheckoutSuccessOrder;
};

/**
 * Renders the checkout success page frame and receipt island.
 *
 * @param props - Localized dictionary copy, active locale, and mock order data.
 * @returns Server-rendered checkout success shell.
 */
export function CheckoutSuccessPage(props: CheckoutSuccessPageProps) {
  const { dictionary, locale, order } = props;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {dictionary.checkoutSuccess.eyebrow}
        </p>
        <h1 className="text-3xl font-semibold text-gray-950">{dictionary.checkoutSuccess.title}</h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground">
          {dictionary.checkoutSuccess.description}
        </p>
      </section>
      <CheckoutSuccessCartPanel copy={dictionary.checkoutSuccess} locale={locale} order={order} />
    </main>
  );
}
