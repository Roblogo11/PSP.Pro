'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Calendar, ArrowRight, Loader2 } from 'lucide-react'

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate verification (in production, you'd verify the session with Stripe)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange mx-auto mb-4 animate-spin" />
          <p className="text-slate-400">Confirming your booking...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-md w-full glass-card p-8 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Booking Failed</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <Link href="/booking" className="btn-primary inline-flex items-center gap-2">
            <span>Try Again</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="glass-card p-8 md:p-12 text-center mb-6">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
            <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
            Booking Confirmed! 🎉
          </h1>
          <p className="text-lg text-slate-300 mb-8">
            Your training session has been successfully booked and paid for.
          </p>

          {/* What's Next */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 text-left">
            <h2 className="text-lg font-bold text-white mb-4">What happens next?</h2>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-orange font-bold text-xs">1</span>
                </span>
                <span>
                  <strong className="text-white">Confirmation Email:</strong> Check your inbox for a detailed booking confirmation with all session information.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-orange font-bold text-xs">2</span>
                </span>
                <span>
                  <strong className="text-white">Calendar Sync:</strong> Add the session to your calendar to get reminders before your training.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-orange font-bold text-xs">3</span>
                </span>
                <span>
                  <strong className="text-white">Show Up Ready:</strong> Arrive 10 minutes early with your training gear and a positive attitude!
                </span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/locker"
              className="btn-primary inline-flex items-center justify-center gap-2"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/booking"
              className="btn-ghost inline-flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Another Session</span>
            </Link>
          </div>

          {/* Session ID */}
          {sessionId && (
            <p className="text-xs text-slate-500 mt-6">
              Confirmation ID: <span className="font-mono">{sessionId.slice(0, 20)}...</span>
            </p>
          )}
        </div>

        {/* Support Card */}
        <div className="glass-card p-6 text-center">
          <p className="text-sm text-slate-400">
            Need to make changes or have questions?{' '}
            <Link href="/contact" className="text-orange hover:text-orange-400 font-semibold">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
