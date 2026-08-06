/**
 * Dev Route
 *
 * Purpose: Thin App Router entry for development operations.
 * Used in: Next.js routing at /dev
 * Used for: Hosts future seed, auth, and revalidation controls for catalog data.
 */

import { DevView } from '@/views/dev';
import type { Metadata } from 'next';

export const metadata: Metadata = { robots: { index: false, follow: false } };

type DevPageProps = {
  searchParams: Promise<{
    message?: string;
    status?: string;
  }>;
};

export const dynamic = 'force-dynamic';

/**
 * Renders the development page.
 *
 * @returns The server-first development view placeholder.
 */
export default async function DevPage(props: DevPageProps) {
  const searchParams = await props.searchParams;

  return <DevView searchParams={searchParams} />;
}
