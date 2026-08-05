/**
 * @file features/ai-assistant/navigation/ui/assistant-aware-link.tsx
 * Link wrapper that preserves assistant-owned URL state during app navigation.
 */

'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { ComponentProps } from 'react';
import { buildAssistantAwareHref } from '@/features/ai-assistant/navigation/lib/build-assistant-aware-href';

type AssistantAwareLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
};

/**
 * Render a Next.js link that keeps assistant session query params.
 *
 * @param props - Link props with an internal string href.
 * @returns Link with `chatId` preserved when present.
 */
export function AssistantAwareLink(props: AssistantAwareLinkProps) {
  const { href, ...linkProps } = props;
  const searchParams = useSearchParams();
  const assistantAwareHref = buildAssistantAwareHref(
    href,
    new URLSearchParams(searchParams.toString()),
  );

  return <Link href={assistantAwareHref} {...linkProps} />;
}
