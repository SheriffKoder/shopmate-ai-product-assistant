/**
 * Checkout Success View
 *
 * Purpose: Server-first composition surface for the localized checkout success route.
 * Used in: app/[locale]/checkout/success/page.tsx
 * Used for: Loads success copy and mock order data before rendering the cart receipt island.
 */

import type { ShadowLocale } from '@/shared/i18n/config';
import { getShadowDictionary } from '@/shared/i18n/lib/get-dictionary';
import { ShadowCheckoutSuccessPage } from '@/views/checkout-success/ui/checkout-success-page';

type ShadowCheckoutSuccessViewProps = {
  locale: ShadowLocale;
};

const MOCK_SUCCESS_ORDER = {
  customerName: 'John Doe',
  deliveryEstimate: '3-5 business days',
  orderNumber: 'SM-2026-0007',
  paymentMethod: 'Visa ending in 4242',
};

/**
 * Renders the localized checkout success view.
 *
 * @param props - Active locale for success rendering.
 * @returns A server-rendered success page with a cart receipt island.
 */
export async function ShadowCheckoutSuccessView(props: ShadowCheckoutSuccessViewProps) {
  const { locale } = props;
  const dictionary = getShadowDictionary(locale);

  return (
    <ShadowCheckoutSuccessPage
      dictionary={dictionary}
      locale={locale}
      order={MOCK_SUCCESS_ORDER}
    />
  );
}

export type ShadowCheckoutSuccessOrder = typeof MOCK_SUCCESS_ORDER;
