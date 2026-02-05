export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-primary">
      {/* Hero Section Skeleton */}
      <div className="relative py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-8 w-24 bg-secondary/10 rounded-full animate-pulse" />
          </div>
          <div className="space-y-4 mb-6">
            <div className="h-12 w-2/3 mx-auto bg-secondary/15 rounded-lg animate-pulse" />
          </div>
          <div className="h-5 w-96 mx-auto bg-dark-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Blog Grid Skeleton */}
      <div className="py-16 border-t border-secondary/10">
        <div className="max-w-7xl mx-auto px-6">
          {/* Featured Post Skeleton */}
          <div className="mb-16">
            <div className="grid lg:grid-cols-2 gap-8 p-6 bg-dark-100 rounded-2xl border border-secondary/10">
              <div className="aspect-video bg-dark-200 rounded-xl animate-pulse" />
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-secondary/10 rounded-full animate-pulse" />
                  <div className="h-6 w-24 bg-dark-300 rounded-full animate-pulse" />
                </div>
                <div className="h-8 w-full bg-dark-200 rounded-lg animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-dark-300 rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-dark-300 rounded animate-pulse" />
                  <div className="h-4 w-4/6 bg-dark-300 rounded animate-pulse" />
                </div>
                <div className="h-10 w-32 bg-secondary/20 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <article
                key={i}
                className="bg-dark-100 rounded-xl border border-secondary/10 overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-dark-200" />
                <div className="p-6 space-y-4">
                  <div className="flex gap-2">
                    <div className="h-5 w-16 bg-secondary/10 rounded-full" />
                    <div className="h-5 w-20 bg-dark-300 rounded-full" />
                  </div>
                  <div className="h-6 w-full bg-dark-200 rounded" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-dark-300 rounded" />
                    <div className="h-4 w-4/5 bg-dark-300 rounded" />
                  </div>
                  <div className="h-8 w-24 bg-secondary/10 rounded-lg" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
