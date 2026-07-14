import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm bg-neutral-800/60",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-primary-500/10 to-transparent" />
    </div>
  )
}

function ManifestSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-sm board-panel overflow-hidden">
          <div className="flex h-12 px-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-3.5 w-3.5" />
              <Skeleton className="h-3.5 w-40" />
            </div>
            <Skeleton className="h-5 w-8" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function OutageLoadingSkeleton() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-9 lg:py-12 relative">
      <div className="flex flex-col gap-6">
        {/* Mobile Layout — mirrors MobileStatusBar */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between gap-2 py-2.5">
            <Skeleton className="h-11 w-40 rounded-sm" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-11 w-11 rounded-sm" />
              <Skeleton className="h-11 w-11 rounded-sm" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pb-2">
            <div className="flex items-center gap-px">
              <Skeleton className="h-8 w-24 rounded-sm" />
              <Skeleton className="h-8 w-20 rounded-sm" />
            </div>
            <Skeleton className="h-8 w-16 rounded-sm" />
          </div>

          <div className="mt-3 mb-4">
            <Skeleton className="h-10 w-full rounded-sm" />
          </div>

          <ManifestSkeleton />
        </div>

        {/* Desktop Layout — mirrors the status board header */}
        <div className="hidden sm:block">
          {/* Signal strip */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-7">
            <Skeleton className="h-3 w-44" />
            <Skeleton className="h-6 w-40" />
          </div>

          {/* Marquee */}
          <Skeleton className="h-12 w-80" />
          <Skeleton className="h-4 w-[28rem] mt-3" />

          {/* Status console */}
          <div className="mt-7 board-panel rounded-sm grid grid-cols-3 divide-x divide-neutral-800">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-5 py-4">
                <Skeleton className="h-2.5 w-20 mb-3" />
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>

          {/* Search */}
          <Skeleton className="h-11 w-full mt-7 mb-5 rounded-sm" />

          <ManifestSkeleton />
        </div>
      </div>
    </main>
  )
}
