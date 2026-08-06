/**
 * Checkout View
 *
 * Purpose: Server-first composition surface for the localized checkout route.
 * Used in: app/[locale]/checkout/page.tsx
 * Used for: Loads checkout copy and renders the cart-driven checkout shell.
 */

import type { AppLocale } from '@/shared/i18n/config';
import { getDictionary } from '@/shared/i18n/lib/get-dictionary';
import { CheckoutPage } from '@/views/checkout/ui/checkout-page';

type CheckoutViewProps = {
  locale: AppLocale;
};

/**
 * Renders the localized checkout view.
 *
 * @param props - Active locale for checkout rendering.
 * @returns A server-rendered checkout page with a cart client island.
 */
export async function CheckoutView(props: CheckoutViewProps) {
  const { locale } = props;
  const dictionary = getDictionary(locale);

  return <CheckoutPage dictionary={dictionary} locale={locale} />;
}
