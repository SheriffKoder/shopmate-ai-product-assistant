/**
 * Checkout Success View
 *
 * Purpose: Server-first composition surface for the localized checkout success route.
 * Used in: app/[locale]/checkout/success/page.tsx
 * Used for: Loads success copy and mock order data before rendering the cart receipt island.
 */

import type { AppLocale } from '@/shared/i18n/config';
import { getDictionary } from '@/shared/i18n/lib/get-dictionary';
import { CheckoutSuccessPage } from '@/views/checkout-success/ui/checkout-success-page';

type CheckoutSuccessViewProps = {
  locale: AppLocale;
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
export async function CheckoutSuccessView(props: CheckoutSuccessViewProps) {
  const { locale } = props;
  const dictionary = getDictionary(locale);

  return (
    <CheckoutSuccessPage
      dictionary={dictionary}
      locale={locale}
      order={MOCK_SUCCESS_ORDER}
    />
  );
}

export type CheckoutSuccessOrder = typeof MOCK_SUCCESS_ORDER;
