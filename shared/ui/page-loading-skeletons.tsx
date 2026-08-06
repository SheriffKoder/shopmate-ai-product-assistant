/**
 * Page Loading Skeletons
 *
 * Purpose: Provides compact responsive loading placeholders for server-first pages.
 * Used in: App Router loading.tsx files.
 * Used for: Matching the first one or two visible sections without rendering a long page preview.
 */

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse bg-foreground/10 ${className}`} />;
}

function SkeletonSectionTitle() {
  return <SkeletonBlock className="h-8 w-48 sm:h-10 sm:w-64" />;
}

function SkeletonProductCards() {
  return (
    <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map(function renderCard(card) {
        return (
          <div className="space-y-4" key={card}>
            <SkeletonBlock className="aspect-[4/3] w-full" />
            <SkeletonBlock className="h-5 w-3/4" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-1/2" />
          </div>
        );
      })}
    </div>
  );
}

/** Renders the first two home sections: categories and featured products. */
export function HomePageLoadingSkeleton() {
  return (
    <main className="mx-auto flex min-h-screen w-full flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading home page">
      <section className="space-y-3">
        <SkeletonSectionTitle />
        <div className="flex gap-2 overflow-hidden">
          {[0, 1, 2, 3, 4, 5].map(function renderCategory(category) {
            return <SkeletonBlock className="h-10 w-24 shrink-0 sm:w-32" key={category} />;
          })}
        </div>
      </section>
      <section className="space-y-6">
        <SkeletonSectionTitle />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]">
          <SkeletonBlock className="aspect-square w-full md:aspect-[4/3]" />
          <div className="space-y-6">
            <div className="flex gap-3 overflow-hidden">
              {[0, 1, 2, 3].map(function renderThumb(thumb) {
                return <SkeletonBlock className="size-20 shrink-0 sm:size-28" key={thumb} />;
              })}
            </div>
            <SkeletonBlock className="h-8 w-3/4" />
            <SkeletonBlock className="h-20 w-full" />
            <SkeletonBlock className="h-12 w-32" />
          </div>
        </div>
      </section>
    </main>
  );
}

/** Renders a compact listing skeleton with a header and first product section. */
export function ProductListingLoadingSkeleton({ label }: { label: string }) {
  return (
    <main className="flex min-h-screen w-full flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8" aria-busy="true" aria-label={`Loading ${label}`}>
      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <SkeletonSectionTitle />
          <SkeletonBlock className="hidden h-5 w-72 md:block" />
        </div>
        <div className="flex gap-2 overflow-hidden">
          {[0, 1, 2, 3].map(function renderFilter(filter) {
            return <SkeletonBlock className="h-9 w-24 shrink-0" key={filter} />;
          })}
        </div>
      </section>
      <section className="space-y-6">
        <SkeletonSectionTitle />
        <SkeletonProductCards />
      </section>
    </main>
  );
}

/** Renders the first two sections of a product detail page. */
export function ProductDetailLoadingSkeleton() {
  return (
    <main className="flex min-h-screen w-full flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading product">
      <SkeletonBlock className="h-5 w-36" />
      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <SkeletonBlock className="aspect-square w-full" />
          <div className="grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map(function renderThumb(thumb) {
              return <SkeletonBlock className="aspect-square w-full" key={thumb} />;
            })}
          </div>
        </div>
        <div className="space-y-6">
          <SkeletonBlock className="h-10 w-3/4" />
          <SkeletonBlock className="h-28 w-full" />
          <SkeletonBlock className="h-36 w-full" />
          <SkeletonBlock className="h-12 w-36" />
        </div>
      </section>
      <section className="space-y-6">
        <SkeletonSectionTitle />
        <SkeletonProductCards />
      </section>
    </main>
  );
}
