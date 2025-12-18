import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-neutral-800/50",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-neutral-800/50 via-neutral-700/30 to-neutral-800/50" />
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="rounded-xl glass overflow-hidden">
      <div className="overflow-x-auto">
        <div className="w-full">
          {/* Header */}
          <div className="border-b border-neutral-800/50">
            <div className="flex h-12 px-4 items-center gap-6">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          {/* Rows */}
          <div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex h-16 px-4 items-center gap-6 border-b border-neutral-800/30"
                style={{
                  animationDelay: `${i * 100}ms`,
                  animationFillMode: 'both'
                }}
              >
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="rounded-xl glass p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-14 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="space-y-2 flex flex-col items-end">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="pt-3 border-t border-neutral-800">
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  )
}

function OutageLoadingSkeleton() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
      <div className="flex flex-col gap-6">
        {/* Live Badge */}
        <Skeleton className="h-7 w-28 rounded-full" />

        {/* Title */}
        <div className="space-y-3">
          <Skeleton className="h-10 sm:h-12 w-72 sm:w-96" />
          <Skeleton className="h-5 w-56" />
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap gap-4 mt-4">
          <Skeleton className="h-20 w-36 rounded-xl" />
          <Skeleton className="h-20 w-36 rounded-xl" />
          <Skeleton className="h-20 w-36 rounded-xl" />
        </div>

        {/* Mobile Layout */}
        <div className="sm:hidden">
          {/* Search Controls */}
          <div className="flex items-center gap-3 mt-4 mb-6">
            <Skeleton className="h-11 flex-1 max-w-md" />
            <Skeleton className="h-11 w-11" />
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:block">
          {/* Search Controls */}
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="h-11 w-80" />
            <Skeleton className="h-11 w-28" />
          </div>

          {/* Table */}
          <TableSkeleton />
        </div>
      </div>
    </main>
  )
}

export { Skeleton, TableSkeleton, CardSkeleton, OutageLoadingSkeleton }
