/**
 * Checkout Page UI
 *
 * Purpose: Renders the localized server-first checkout shell.
 * Used in: views/checkout/index.tsx
 * Used for: Keeps cart-dependent checkout details in a focused client island.
 */

import { CheckoutCartPanel } from '@/features/cart/ui/checkout-cart-panel';
import type { AppLocale } from '@/shared/i18n/config';
import type { AppDictionary } from '@/shared/i18n/model/dictionary';

type CheckoutPageProps = {
  dictionary: AppDictionary;
  locale: AppLocale;
};

/**
 * Renders the checkout page frame and cart island.
 *
 * @param props - Localized dictionary copy and active locale.
 * @returns Server-rendered checkout shell.
 */
export function CheckoutPage(props: CheckoutPageProps) {
  const { dictionary, locale } = props;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold text-gray-950">{dictionary.checkout.title}</h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground">
          {dictionary.checkout.description}
        </p>
      </section>
      <CheckoutCartPanel copy={dictionary.checkout} locale={locale} />
    </main>
  );
}
