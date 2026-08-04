/**
 * Document Skeleton Component
 * 
 * Purpose: Loading skeleton for artifact preview
 * Used in: DocumentPreview component
 * Why: Shows loading state while artifact is being created/fetched
 */

'use client';

import { Maximize2 } from 'lucide-react';

interface DocumentSkeletonProps {
  artifactKind: 'text' | 'code' | 'sheet' | 'chart';
}

/**
 * Document Skeleton Component
 * 
 * Shows loading skeleton while artifact is being created or fetched
 */
export function DocumentSkeleton({ artifactKind }: DocumentSkeletonProps) {
  return (
    <div className="w-full">
      {/* Header skeleton */}
      <div className="flex h-[57px] flex-row items-center justify-between gap-2 rounded-t-2xl border border-b-0 p-4 dark:border-zinc-700 dark:bg-muted">
        <div className="flex flex-row items-center gap-3">
          <div className="text-muted-foreground">
            <div className="size-4 animate-pulse rounded-md bg-muted-foreground/20" />
          </div>
          <div className="h-4 w-24 animate-pulse rounded-lg bg-muted-foreground/20" />
        </div>
        <div>
          <Maximize2 size={16} className="text-muted-foreground" />
        </div>
      </div>
      
      {/* Content skeleton */}
      {artifactKind === 'text' ? (
        <div className="overflow-y-scroll rounded-b-2xl border border-t-0 bg-muted p-8 pt-4 dark:border-zinc-700">
          <div className="space-y-4">
            <div className="h-4 w-full animate-pulse rounded bg-muted-foreground/20" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted-foreground/20" />
            <div className="h-4 w-full animate-pulse rounded bg-muted-foreground/20" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-muted-foreground/20" />
          </div>
        </div>
      ) : (
        <div className="overflow-y-scroll rounded-b-2xl border border-t-0 bg-muted dark:border-zinc-700">
          <div className="h-[257px] w-full animate-pulse bg-muted-foreground/20" />
        </div>
      )}
    </div>
  );
}
