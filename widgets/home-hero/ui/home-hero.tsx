/**
 * Home Hero Widget
 *
 * Purpose: Renders the server-first home page hero.
 * Used in: views/home/ui/home-page.tsx
 * Used for: Presents localized intro copy and a products navigation action.
 */

import { AssistantAwareLink } from '@/features/ai-assistant/navigation';
import type { AppLocale } from '@/shared/i18n/config';

type HomeHeroProps = {
  locale: AppLocale;
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
};

/**
 * Renders the localized home hero.
 *
 * @param props - Localized hero copy and active locale.
 * @returns A semantic hero section.
 */
export function HomeHero(props: HomeHeroProps) {
  const { locale, eyebrow, title, description, actionLabel } = props;

  return (
    <section className="rounded-lg border bg-white px-6 py-10 shadow-sm sm:px-8">
      <p className="text-sm font-medium uppercase text-muted-foreground">{eyebrow}</p>
      <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-normal text-gray-950 sm:text-4xl">{title}</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">{description}</p>
        </div>
        <AssistantAwareLink
          className="inline-flex h-11 items-center justify-center rounded-md bg-gray-950 px-5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          href={`/${locale}/products`}
        >
          {actionLabel}
        </AssistantAwareLink>
      </div>
    </section>
  );
}
