export default function ShockKitLoading() {
  return (
    <div className="min-h-screen bg-primary">
      {/* Hero Section Skeleton */}
      <div className="relative py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-8 w-40 bg-accent/10 rounded-full animate-pulse" />
          </div>
          <div className="space-y-4 mb-6">
            <div className="h-12 w-3/4 mx-auto bg-secondary/15 rounded-lg animate-pulse" />
            <div className="h-12 w-1/2 mx-auto bg-secondary/10 rounded-lg animate-pulse" />
          </div>
          <div className="space-y-2 mb-8">
            <div className="h-5 w-full max-w-lg mx-auto bg-dark-200 rounded animate-pulse" />
            <div className="h-5 w-3/4 max-w-lg mx-auto bg-dark-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Pricing Cards Skeleton */}
      <div className="py-20 border-t border-secondary/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`p-8 rounded-2xl border animate-pulse ${
                  i === 2
                    ? 'bg-gradient-to-b from-secondary/10 to-transparent border-secondary/30'
                    : 'bg-dark-100 border-secondary/10'
                }`}
              >
                {/* Badge */}
                {i === 2 && (
                  <div className="h-6 w-24 bg-secondary/20 rounded-full mx-auto mb-4" />
                )}

                {/* Plan name */}
                <div className="h-8 w-32 bg-dark-200 rounded mb-2" />

                {/* Price */}
                <div className="flex items-end gap-1 mb-6">
                  <div className="h-12 w-24 bg-secondary/20 rounded" />
                  <div className="h-4 w-12 bg-dark-300 rounded mb-2" />
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-secondary/20" />
                      <div className="h-4 flex-1 bg-dark-300 rounded" />
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="h-12 w-full bg-secondary/20 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
