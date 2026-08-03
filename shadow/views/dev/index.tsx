/**
 * Shadow Dev View
 *
 * Purpose: Server-first composition surface for shadow development tooling.
 * Used in: app/shadow/dev/page.tsx
 * Used for: Holds placeholders for future seed, auth, and revalidation actions.
 */

import { SHADOW_DEFAULT_LOCALE } from '@/shadow/shared/i18n/config';
import { getShadowDictionary } from '@/shadow/shared/i18n/lib/get-dictionary';
import { getShadowDevActionResult } from '@/shadow/views/dev/lib/get-dev-action-result';
import { ShadowDevPage } from '@/shadow/views/dev/ui/dev-page';

type ShadowDevViewProps = {
  searchParams: {
    message?: string;
    status?: string;
  };
};

/**
 * Renders the shadow development tooling page.
 *
 * @param props - Search params carrying the latest action result.
 * @returns A server-rendered development tooling page.
 */
export function ShadowDevView(props: ShadowDevViewProps) {
  const { searchParams } = props;
  const dictionary = getShadowDictionary(SHADOW_DEFAULT_LOCALE);
  const actionResult = getShadowDevActionResult(searchParams);

  return <ShadowDevPage actionResult={actionResult} dictionary={dictionary} />;
}
