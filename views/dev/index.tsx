/**
 * Dev View
 *
 * Purpose: Server-first composition surface for development tooling.
 * Used in: app/dev/page.tsx
 * Used for: Holds placeholders for future seed, auth, and revalidation actions.
 */

import { DEFAULT_LOCALE } from '@/shared/i18n/config';
import { getDictionary } from '@/shared/i18n/lib/get-dictionary';
import { getDevActionResult } from '@/views/dev/lib/get-dev-action-result';
import { DevPage } from '@/views/dev/ui/dev-page';

type DevViewProps = {
  searchParams: {
    message?: string;
    status?: string;
  };
};

/**
 * Renders the development tooling page.
 *
 * @param props - Search params carrying the latest action result.
 * @returns A server-rendered development tooling page.
 */
export function DevView(props: DevViewProps) {
  const { searchParams } = props;
  const dictionary = getDictionary(DEFAULT_LOCALE);
  const actionResult = getDevActionResult(searchParams);

  return <DevPage actionResult={actionResult} dictionary={dictionary} />;
}
