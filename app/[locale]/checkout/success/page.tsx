/**
 * Checkout Success Route
 *
 * Purpose: Thin App Router entry for localized checkout success.
 * Used in: Next.js routing at /[locale]/checkout/success
 * Used for: Delegates server-first success composition to the checkout success view.
 */

import { CheckoutSuccessView } from '@/views/checkout-success';
import { assertAppLocale } from '@/shared/i18n/lib/assert-locale';

type CheckoutSuccessPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

/**
 * Renders the localized checkout success page.
 *
 * @param props - Locale route params from Next.js.
 * @returns The server-first success view with a local cart receipt island.
 */
export default async function CheckoutSuccessPage(props: CheckoutSuccessPageProps) {
  const { locale: rawLocale } = await props.params;
  const locale = assertAppLocale(rawLocale);

  return <CheckoutSuccessView locale={locale} />;
}
