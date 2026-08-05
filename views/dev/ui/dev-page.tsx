/**
 * Dev Page UI
 *
 * Purpose: Renders development-only controls for catalog setup.
 * Used in: views/dev/index.tsx
 * Used for: Runs auth, seed, and revalidation server actions without public page data coupling.
 */

import type { AppDictionary } from '@/shared/i18n/model/dictionary';
import type { DevActionResult } from '@/views/dev/lib/get-dev-action-result';
import { authenticateDevUser } from '@/views/dev/server/authenticate-dev-user';
import { revalidatePublicPagesAction } from '@/views/dev/server/revalidate-public-pages';
import { seedCatalog } from '@/views/dev/server/seed-catalog';

type DevPageProps = {
  actionResult: DevActionResult | null;
  dictionary: AppDictionary;
};

/**
 * Renders the complete development tooling page.
 *
 * @param props - Localized dictionary copy and latest action result.
 * @returns A server-rendered dev control surface.
 */
export function DevPage(props: DevPageProps) {
  const { actionResult, dictionary } = props;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{dictionary.dev.eyebrow}</p>
        <h1 className="text-3xl font-semibold text-gray-950">{dictionary.dev.title}</h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground">{dictionary.dev.description}</p>
      </section>

      {actionResult ? (
        <section
          aria-live="polite"
          className={
            actionResult.status === 'success'
              ? 'rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800'
              : 'rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800'
          }
        >
          {actionResult.message}
        </section>
      ) : null}

      <section aria-label={dictionary.dev.actionsLabel} className="grid gap-4 md:grid-cols-3">
        <form action={authenticateDevUser} className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-950">{dictionary.dev.authTitle}</h2>
          <p className="mt-2 min-h-16 text-sm leading-6 text-muted-foreground">{dictionary.dev.authDescription}</p>
          <button className="mt-5 w-full rounded-md bg-gray-950 px-4 py-2 text-sm font-medium text-white" type="submit">
            {dictionary.dev.authAction}
          </button>
        </form>

        <form action={seedCatalog} className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-950">{dictionary.dev.seedTitle}</h2>
          <p className="mt-2 min-h-16 text-sm leading-6 text-muted-foreground">{dictionary.dev.seedDescription}</p>
          <button className="mt-5 w-full rounded-md bg-gray-950 px-4 py-2 text-sm font-medium text-white" type="submit">
            {dictionary.dev.seedAction}
          </button>
        </form>

        <form action={revalidatePublicPagesAction} className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-950">{dictionary.dev.revalidateTitle}</h2>
          <p className="mt-2 min-h-16 text-sm leading-6 text-muted-foreground">{dictionary.dev.revalidateDescription}</p>
          <button className="mt-5 w-full rounded-md bg-gray-950 px-4 py-2 text-sm font-medium text-white" type="submit">
            {dictionary.dev.revalidateAction}
          </button>
        </form>
      </section>
    </main>
  );
}
