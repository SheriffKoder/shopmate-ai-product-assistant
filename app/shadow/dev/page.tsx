/**
 * Shadow Dev Route
 *
 * Purpose: Thin App Router entry for shadow development operations.
 * Used in: Next.js routing at /shadow/dev
 * Used for: Hosts future seed, auth, and revalidation controls for shadow data.
 */

import { ShadowDevView } from '@/shadow/views/dev';

type ShadowDevPageProps = {
  searchParams: Promise<{
    message?: string;
    status?: string;
  }>;
};

export const dynamic = 'force-dynamic';

/**
 * Renders the shadow development page.
 *
 * @returns The server-first shadow development view placeholder.
 */
export default async function ShadowDevPage(props: ShadowDevPageProps) {
  const searchParams = await props.searchParams;

  return <ShadowDevView searchParams={searchParams} />;
}
