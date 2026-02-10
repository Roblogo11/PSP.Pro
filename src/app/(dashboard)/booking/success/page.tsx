'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Calendar, ArrowRight, Loader2 } from 'lucide-react'

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found. Please try booking again.')
      setLoading(false)
      return
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/stripe/verify?session_id=${encodeURIComponent(sessionId)}`)
        const data = await res.json()

        if (!res.ok || !data.verified) {
          setError(data.error || 'Could not verify payment. Please contact support.')
        }
      } catch (err) {
        console.error('Payment verification failed:', err)
        setError('Could not verify payment. Please contact support if you were charged.')
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen px-3 py-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange mx-auto mb-4 animate-spin" />
          <p className="text-cyan-800 dark:text-white">Confirming your booking...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen px-3 py-4 md:p-8 flex items-center justify-center">
        <div className="max-w-md w-full glass-card p-8 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Booking Failed</h1>
          <p className="text-cyan-800 dark:text-white mb-6">{error}</p>
          <Link href="/booking" className="btn-primary inline-flex items-center gap-2">
            <span>Try Again</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-3 py-4 md:p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="glass-card p-8 md:p-12 text-center mb-6">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
            <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white mb-3">
            Booking Confirmed! 🎉
          </h1>
          <p className="text-lg text-cyan-700 dark:text-white mb-8">
            Your training session has been successfully booked and paid for.
          </p>

          {/* What's Next */}
          <div className="bg-cyan-50/50 border border-cyan-200/40 rounded-xl p-6 mb-8 text-left">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">What happens next?</h2>
            <ul className="space-y-3 text-sm text-cyan-700 dark:text-white">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-orange font-bold text-xs">1</span>
                </span>
                <span>
                  <strong className="text-slate-900 dark:text-white">Confirmation Email:</strong> Check your inbox for a detailed booking confirmation with all session information.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-orange font-bold text-xs">2</span>
                </span>
                <span>
                  <strong className="text-slate-900 dark:text-white">Calendar Sync:</strong> Add the session to your calendar to get reminders before your training.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-orange font-bold text-xs">3</span>
                </span>
                <span>
                  <strong className="text-slate-900 dark:text-white">Show Up Ready:</strong> Arrive 10 minutes early with your training gear and a positive attitude!
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
            <p className="text-xs text-cyan-800 dark:text-white mt-6">
              Confirmation ID: <span className="font-mono">{sessionId.slice(0, 20)}...</span>
            </p>
          )}
        </div>

        {/* Support Card */}
        <div className="glass-card p-6 text-center">
          <p className="text-sm text-cyan-800 dark:text-white">
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
