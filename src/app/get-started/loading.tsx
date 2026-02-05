export default function GetStartedLoading() {
  return (
    <div className="min-h-screen bg-primary">
      {/* Hero Section Skeleton */}
      <div className="relative py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-8 w-36 bg-secondary/10 rounded-full animate-pulse" />
          </div>
          <div className="space-y-4 mb-6">
            <div className="h-12 w-3/4 mx-auto bg-secondary/15 rounded-lg animate-pulse" />
            <div className="h-12 w-1/2 mx-auto bg-secondary/10 rounded-lg animate-pulse" />
          </div>
          <div className="h-5 w-96 mx-auto bg-dark-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Service Selection Grid Skeleton */}
      <div className="py-16 border-t border-secondary/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="h-8 w-64 mx-auto bg-secondary/10 rounded-lg animate-pulse mb-4" />
            <div className="h-4 w-80 mx-auto bg-dark-200 rounded animate-pulse" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="p-6 bg-dark-100 rounded-xl border border-secondary/10 animate-pulse cursor-pointer hover:border-secondary/30 transition-colors"
              >
                <div className="w-12 h-12 bg-secondary/10 rounded-lg mb-4" />
                <div className="h-6 w-3/4 bg-dark-200 rounded mb-2" />
                <div className="h-4 w-full bg-dark-300 rounded mb-1" />
                <div className="h-4 w-2/3 bg-dark-300 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Skeleton */}
      <div className="py-16 border-t border-secondary/10">
        <div className="max-w-2xl mx-auto px-6">
          <div className="p-8 bg-dark-100 rounded-2xl border border-secondary/10">
            <div className="h-8 w-48 bg-secondary/10 rounded-lg mb-8 animate-pulse" />

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="h-4 w-20 bg-dark-200 rounded mb-2 animate-pulse" />
                  <div className="h-12 w-full bg-dark-200 rounded-lg animate-pulse" />
                </div>
                <div>
                  <div className="h-4 w-16 bg-dark-200 rounded mb-2 animate-pulse" />
                  <div className="h-12 w-full bg-dark-200 rounded-lg animate-pulse" />
                </div>
              </div>
              <div>
                <div className="h-4 w-24 bg-dark-200 rounded mb-2 animate-pulse" />
                <div className="h-12 w-full bg-dark-200 rounded-lg animate-pulse" />
              </div>
              <div>
                <div className="h-4 w-32 bg-dark-200 rounded mb-2 animate-pulse" />
                <div className="h-32 w-full bg-dark-200 rounded-lg animate-pulse" />
              </div>
              <div className="h-12 w-full bg-secondary/20 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
