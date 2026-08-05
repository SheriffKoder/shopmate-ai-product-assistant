/**
 * @file features/ai-assistant/navigation/hooks/use-assistant-aware-router.ts
 * Hook that preserves assistant URL state for imperative app navigation.
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { buildAssistantAwareHref } from '@/features/ai-assistant/navigation/lib/build-assistant-aware-href';

type AssistantAwareRouterOptions = {
  preserveAssistantUrlState?: boolean;
  scroll?: boolean;
};

/**
 * Resolve a target href based on the caller's preservation preference.
 */
function resolveAssistantAwareHref(
  href: string,
  searchParams: URLSearchParams,
  options?: AssistantAwareRouterOptions,
) {
  if (options?.preserveAssistantUrlState === false) {
    return href;
  }

  return buildAssistantAwareHref(href, searchParams);
}

/**
 * Strip assistant-only options before calling the Next.js router.
 */
function getRouterOptions(options?: AssistantAwareRouterOptions) {
  return { scroll: options?.scroll };
}

/**
 * Return router helpers that keep assistant-owned query params.
 *
 * @returns Push and replace functions that preserve `chatId`.
 */
export function useAssistantAwareRouter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const push = useCallback(function pushAssistantAwareHref(
    href: string,
    options?: AssistantAwareRouterOptions,
  ) {
    const nextHref = resolveAssistantAwareHref(
      href,
      new URLSearchParams(searchParams.toString()),
      options,
    );

    router.push(nextHref, getRouterOptions(options));
  }, [router, searchParams]);

  const replace = useCallback(function replaceAssistantAwareHref(
    href: string,
    options?: AssistantAwareRouterOptions,
  ) {
    const nextHref = resolveAssistantAwareHref(
      href,
      new URLSearchParams(searchParams.toString()),
      options,
    );

    router.replace(nextHref, getRouterOptions(options));
  }, [router, searchParams]);

  return useMemo(function getAssistantAwareRouter() {
    return { push, replace };
  }, [push, replace]);
}
