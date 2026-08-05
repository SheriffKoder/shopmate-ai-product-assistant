/**
 * Checkout View
 *
 * Purpose: Server-first composition surface for the localized checkout route.
 * Used in: app/[locale]/checkout/page.tsx
 * Used for: Loads checkout copy and renders the cart-driven checkout shell.
 */

import type { ShadowLocale } from '@/shared/i18n/config';
import { getShadowDictionary } from '@/shared/i18n/lib/get-dictionary';
import { ShadowCheckoutPage } from '@/views/checkout/ui/checkout-page';

type ShadowCheckoutViewProps = {
  locale: ShadowLocale;
};

/**
 * Renders the localized checkout view.
 *
 * @param props - Active locale for checkout rendering.
 * @returns A server-rendered checkout page with a cart client island.
 */
export async function ShadowCheckoutView(props: ShadowCheckoutViewProps) {
  const { locale } = props;
  const dictionary = getShadowDictionary(locale);

  return <ShadowCheckoutPage dictionary={dictionary} locale={locale} />;
}
