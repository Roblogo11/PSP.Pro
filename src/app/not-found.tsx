import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-8xl font-bold text-secondary">404</h1>
        <h2 className="text-3xl font-bold text-white">Page Not Found</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/"
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-secondary to-accent text-black font-semibold hover:scale-105 transition-transform"
          >
            Go Home
          </Link>
          <Link
            href="/contact"
            className="px-6 py-3 rounded-lg border border-secondary/30 text-secondary hover:bg-secondary/10 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
