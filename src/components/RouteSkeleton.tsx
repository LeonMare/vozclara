/**
 * Brand-conform skeleton placeholder for route-level loading states.
 *
 * Replaces the previous bare gold-monogram loader. Renders a soft,
 * editorial structure — pill row, title, gold rule, a few body
 * lines — so the user sees the shape of the page before its data
 * arrives. The shimmer animation is muted (brand-tone navy wash, no
 * aggressive pulse) and respects prefers-reduced-motion via the
 * `.skeleton` class in index.css.
 *
 * Used in two places:
 *   • App.tsx <Suspense fallback> for lazy-loaded route chunks.
 *   • PackPage's "pack is null while loading from IDB" state.
 */
export function RouteSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14"
    >
      {/* Pill row — mimics mode/lang/genre chips */}
      <div className="flex items-center gap-2">
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-14 rounded-full" />
      </div>

      {/* Title */}
      <div className="skeleton mt-5 h-8 w-3/4 sm:h-10" />
      <div className="skeleton mt-3 h-8 w-2/3 sm:h-10" />

      {/* Gold rule — solid, not skeleton (the brand anchor stays visible) */}
      <div className="mt-5 h-px w-12 bg-gold" aria-hidden />

      {/* Body — a few body lines of varying width to look like prose */}
      <div className="mt-7 space-y-3">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-[95%]" />
        <div className="skeleton h-4 w-[88%]" />
        <div className="skeleton h-4 w-[92%]" />
        <div className="skeleton h-4 w-3/4" />
      </div>

      {/* Card row — mimics tab content blocks */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-card border-l-2 border-gold/30 bg-white/55 p-5">
      <div className="flex items-baseline gap-3">
        <div className="skeleton h-5 w-6" />
        <div className="skeleton h-5 w-2/3" />
      </div>
      <div className="mt-3 space-y-2 pl-9">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-[90%]" />
        <div className="skeleton h-3 w-3/4" />
      </div>
    </div>
  );
}
