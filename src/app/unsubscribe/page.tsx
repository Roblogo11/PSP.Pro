'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react'
import { Suspense } from 'react'

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const token = searchParams.get('token') || ''

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!email || !token) {
      setStatus('invalid')
      setMessage('This unsubscribe link is invalid or incomplete.')
      return
    }

    async function unsubscribe() {
      try {
        const res = await fetch(
          `/api/newsletter?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`,
          { method: 'DELETE' }
        )
        if (res.ok) {
          setStatus('success')
          setMessage(`${email} has been unsubscribed from PSP.Pro emails.`)
        } else {
          const data = await res.json()
          setStatus('error')
          setMessage(data.error || 'Failed to unsubscribe. Please try again or contact support@propersports.pro.')
        }
      } catch {
        setStatus('error')
        setMessage('Network error. Please try again or contact support@propersports.pro.')
      }
    }

    unsubscribe()
  }, [email, token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <div className="mb-6">
          {status === 'loading' && (
            <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto" />
          )}
          {status === 'success' && (
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
          )}
          {(status === 'error' || status === 'invalid') && (
            <XCircle className="w-16 h-16 text-red-400 mx-auto" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          {status === 'loading' && 'Unsubscribing...'}
          {status === 'success' && 'Unsubscribed'}
          {status === 'error' && 'Something went wrong'}
          {status === 'invalid' && 'Invalid Link'}
        </h1>

        <p className="text-white/70 text-sm mb-6 leading-relaxed">{message}</p>

        {status === 'success' && (
          <p className="text-white/50 text-xs mb-6">
            You will no longer receive marketing emails from PSP.Pro.
            Transactional emails (booking confirmations) may still be sent.
          </p>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors"
          >
            Return to PSP.Pro
          </Link>
          {status === 'error' && (
            <a
              href="mailto:support@propersports.pro"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white/70 rounded-xl text-sm hover:bg-white/10 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Contact Support
            </a>
          )}
        </div>

        <p className="text-white/30 text-xs mt-6">
          © {new Date().getFullYear()} Proper Sports Performance · Virginia Beach, VA
        </p>
      </div>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  )
}
