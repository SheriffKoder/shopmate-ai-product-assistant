/**
 * Checkout Route
 *
 * Purpose: Thin App Router entry for localized checkout.
 * Used in: Next.js routing at /[locale]/checkout
 * Used for: Delegates server-first checkout composition to the checkout view.
 */

import { ShadowCheckoutView } from '@/views/checkout';
import { assertShadowLocale } from '@/shared/i18n/lib/assert-locale';

type ShadowCheckoutPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

/**
 * Renders the localized checkout page.
 *
 * @param props - Locale route params from Next.js.
 * @returns The server-first checkout view with a client cart island.
 */
export default async function ShadowCheckoutPage(props: ShadowCheckoutPageProps) {
  const { locale: rawLocale } = await props.params;
  const locale = assertShadowLocale(rawLocale);

  return <ShadowCheckoutView locale={locale} />;
}
