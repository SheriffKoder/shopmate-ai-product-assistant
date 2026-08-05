/**
 * Checkout Success Route
 *
 * Purpose: Thin App Router entry for localized checkout success.
 * Used in: Next.js routing at /[locale]/checkout/success
 * Used for: Delegates server-first success composition to the checkout success view.
 */

import { ShadowCheckoutSuccessView } from '@/views/checkout-success';
import { assertShadowLocale } from '@/shared/i18n/lib/assert-locale';

type ShadowCheckoutSuccessPageProps = {
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
export default async function ShadowCheckoutSuccessPage(props: ShadowCheckoutSuccessPageProps) {
  const { locale: rawLocale } = await props.params;
  const locale = assertShadowLocale(rawLocale);

  return <ShadowCheckoutSuccessView locale={locale} />;
}
