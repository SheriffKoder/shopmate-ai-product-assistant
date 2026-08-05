/**
 * @file features/ai-assistant/navigation/lib/build-assistant-aware-href.ts
 * Builds internal navigation hrefs that preserve assistant-owned URL state.
 */

const ASSISTANT_URL_STATE_PARAMS = ['chatId'] as const;

type AssistantUrlStateParam = (typeof ASSISTANT_URL_STATE_PARAMS)[number];

/**
 * Copy assistant-owned params into a target href.
 *
 * @param href - Internal target href, with or without query params.
 * @param currentSearchParams - Current page search params.
 * @returns Target href with assistant URL state preserved.
 */
export function buildAssistantAwareHref(
  href: string,
  currentSearchParams: URLSearchParams,
) {
  const targetUrl = new URL(href, 'https://shopmate.local');

  ASSISTANT_URL_STATE_PARAMS.forEach(function preserveAssistantParam(param: AssistantUrlStateParam) {
    const currentValue = currentSearchParams.get(param);

    if (currentValue && !targetUrl.searchParams.has(param)) {
      targetUrl.searchParams.set(param, currentValue);
    }
  });

  return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
}
