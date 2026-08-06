/** Route-level home loading fallback. */

import { HomePageLoadingSkeleton } from '@/shared/ui/page-loading-skeletons';

/**
 * Renders the home route loading fallback.
 *
 * @returns A minimal loading region for the home page.
 */
export default function HomeLoading() {
  return <HomePageLoadingSkeleton />;
}
