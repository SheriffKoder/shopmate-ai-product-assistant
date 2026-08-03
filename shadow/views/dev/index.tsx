/**
 * Shadow Dev View
 *
 * Purpose: Server-first composition surface for shadow development tooling.
 * Used in: app/shadow/dev/page.tsx
 * Used for: Holds placeholders for future seed, auth, and revalidation actions.
 */

import { SHADOW_DEFAULT_LOCALE } from '@/shadow/shared/i18n/config';
import { getShadowDictionary } from '@/shadow/shared/i18n/lib/get-dictionary';

/**
 * Renders the shadow development placeholder.
 *
 * @returns A server-rendered development tooling placeholder.
 */
export function ShadowDevView() {
  const dictionary = getShadowDictionary(SHADOW_DEFAULT_LOCALE);

  return (
    <main className="min-h-screen p-6">
      <p className="text-sm font-medium uppercase text-muted-foreground">{dictionary.dev.eyebrow}</p>
      <h1 className="mt-2 text-3xl font-semibold">{dictionary.dev.title}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{dictionary.dev.description}</p>
    </main>
  );
}
