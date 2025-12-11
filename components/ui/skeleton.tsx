import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-neutral-100",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-neutral-100 via-neutral-50 to-neutral-100" />
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-200/60 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <div className="w-full">
          {/* Header */}
          <div className="border-b border-neutral-200/60">
            <div className="flex h-14 px-6 items-center gap-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          {/* Rows */}
          <div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex h-16 px-6 items-center gap-6 border-b border-neutral-200/60",
                  i % 2 === 1 && "bg-neutral-50/30"
                )}
              >
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-28" />
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
    <div className="rounded-xl border border-neutral-200/60 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-2 items-end flex flex-col">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
}

function OutageLoadingSkeleton() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex flex-col gap-4">
        {/* Page Title */}
        <Skeleton className="h-8 sm:h-10 w-80 sm:w-96" />

        {/* Subtitle */}
        <Skeleton className="h-5 w-64" />

        {/* Search and Download Controls - Mobile */}
        <div className="flex items-center justify-between py-4 block sm:hidden">
          <Skeleton className="h-11 w-40" />
          <Skeleton className="h-10 w-10 ml-2" />
        </div>

        {/* Mobile Cards */}
        <div className="flex flex-col gap-4 block sm:hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:block">
          {/* Search and Download Controls - Desktop */}
          <div className="flex items-center justify-between py-4">
            <Skeleton className="h-11 w-72" />
            <Skeleton className="h-10 w-20 ml-2" />
          </div>

          {/* Table */}
          <TableSkeleton />
        </div>
      </div>
    </main>
  )
}

export { Skeleton, TableSkeleton, CardSkeleton, OutageLoadingSkeleton }
