export default function WebsiteHelpLoading() {
  return (
    <div className="min-h-screen bg-primary">
      {/* Hero Section Skeleton */}
      <div className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <div className="h-6 w-36 bg-cyan-500/10 rounded-full animate-pulse" />
              <div className="space-y-3">
                <div className="h-10 w-full bg-secondary/15 rounded-lg animate-pulse" />
                <div className="h-10 w-4/5 bg-secondary/10 rounded-lg animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-dark-200 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-dark-200 rounded animate-pulse" />
              </div>
              <div className="flex gap-4 pt-4">
                <div className="h-12 w-40 bg-secondary/20 rounded-lg animate-pulse" />
                <div className="h-12 w-40 bg-dark-200 rounded-lg animate-pulse" />
              </div>
            </div>

            {/* Illustration Skeleton */}
            <div className="aspect-square bg-dark-200 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>

      {/* Services Grid Skeleton */}
      <div className="py-20 border-t border-secondary/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="h-8 w-72 mx-auto bg-secondary/10 rounded-lg animate-pulse mb-4" />
            <div className="h-4 w-96 mx-auto bg-dark-200 rounded animate-pulse" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-8 bg-dark-100 rounded-xl border border-secondary/10 animate-pulse"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-secondary/10 rounded-xl flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-6 w-48 bg-dark-200 rounded mb-3" />
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-dark-300 rounded" />
                      <div className="h-4 w-5/6 bg-dark-300 rounded" />
                      <div className="h-4 w-4/6 bg-dark-300 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
