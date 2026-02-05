'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development
    console.error('Page error:', error)
  }, [error])

  // Check if it's a Web3-related error
  const isWeb3Error =
    error.message?.toLowerCase().includes('wagmi') ||
    error.message?.toLowerCase().includes('wallet') ||
    error.message?.toLowerCase().includes('connector') ||
    error.message?.toLowerCase().includes('web3') ||
    error.message?.toLowerCase().includes('ethereum')

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-6">
      <div className="text-center max-w-lg mx-auto">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 border border-accent/20">
            <AlertTriangle className="w-10 h-10 text-accent" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-white mb-4">
          {isWeb3Error ? 'Wallet Connection Issue' : 'Something went wrong'}
        </h1>

        <p className="text-gray-400 mb-8 text-lg">
          {isWeb3Error
            ? "There was an issue connecting to your wallet. Don't worry — you can continue browsing our services without a wallet connection."
            : "We encountered an unexpected error. Please try again, or feel free to contact us if the issue persists."}
        </p>

        {/* Error Details (collapsible in production) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-8 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-400">
              Error details
            </summary>
            <pre className="mt-2 p-4 bg-dark-200 rounded-lg text-xs text-gray-400 overflow-x-auto">
              {error.message}
              {error.digest && `\n\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/90 text-white font-medium rounded-lg transition-all duration-200 shadow-glow-sm hover:shadow-glow-md min-h-[44px]"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-dark-200 hover:bg-dark-300 text-white font-medium rounded-lg transition-colors duration-200 border border-secondary/10 hover:border-secondary/20 min-h-[44px]"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-white font-medium rounded-lg transition-colors duration-200 min-h-[44px]"
          >
            <Mail className="w-5 h-5" />
            Contact Us
          </Link>
        </div>

        {/* Reassurance */}
        <p className="mt-12 text-sm text-gray-500">
          Our services are still available. You can explore our{' '}
          <Link href="/video" className="text-secondary hover:underline">
            video production
          </Link>
          ,{' '}
          <Link href="/website-help" className="text-secondary hover:underline">
            web development
          </Link>
          , and other creative services.
        </p>
      </div>
    </div>
  )
}
