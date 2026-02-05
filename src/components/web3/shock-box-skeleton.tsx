export function ShockBoxSkeleton() {
  return (
    <div className="relative py-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Section Header Skeleton */}
        <div className="text-center mb-8">
          <div className="inline-block h-8 w-40 bg-secondary/10 rounded-full mb-4 animate-pulse" />
          <div className="h-8 w-64 mx-auto bg-dark-200 rounded-lg mb-2 animate-pulse" />
          <div className="h-4 w-80 mx-auto bg-dark-300 rounded animate-pulse" />
        </div>

        {/* Box Skeleton */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-secondary/20">
          {/* Video Area Skeleton */}
          <div className="aspect-video bg-dark-200 animate-pulse">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-dark-300 animate-pulse" />
            </div>
          </div>

          {/* Action Bar Skeleton */}
          <div className="p-6 border-t border-secondary/10 bg-dark-200/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="h-5 w-48 bg-dark-300 rounded animate-pulse" />
                <div className="h-4 w-64 bg-dark-300/50 rounded animate-pulse" />
              </div>
              <div className="h-12 w-48 bg-secondary/20 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
