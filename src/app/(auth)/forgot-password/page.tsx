'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) throw resetError

      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full blur-[150px]" style={{ background: 'radial-gradient(circle, rgba(0, 180, 216, 0.15) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Back to Login */}
        <Link href="/login" className="inline-flex items-center gap-2  hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>

        <div className="glass-card p-8">
          {!sent ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan/10 rounded-full mb-4">
                  <Mail className="w-8 h-8 text-cyan" />
                </div>
                <h1 className="text-3xl font-display font-bold text-white mb-2">
                  Forgot Password?
                </h1>
                <p className="">
                  No worries! Enter your email and we'll send you reset instructions.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold  mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="athlete@example.com"
                    required
                    className="w-full px-4 py-3 bg-cyan-900/30 border border-cyan-700/50 rounded-xl text-white placeholder-cyan-600 focus:border-cyan focus:outline-none transition-colors"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-sm ">
                  Remember your password?{' '}
                  <Link href="/login" className="text-cyan hover:text-cyan-400 font-semibold">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-400/10 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h1 className="text-3xl font-display font-bold text-white mb-2">
                  Check Your Email
                </h1>
                <p className=" mb-6">
                  We've sent password reset instructions to:
                </p>
                <p className="text-white font-semibold mb-8">
                  {email}
                </p>
                <div className="p-4 bg-cyan/10 border border-cyan/20 rounded-xl mb-6">
                  <p className="text-sm  leading-relaxed">
                    Click the link in the email to reset your password. If you don't see it, check your spam folder.
                  </p>
                </div>

                <button
                  onClick={() => setSent(false)}
                  className="btn-ghost w-full mb-4"
                >
                  Resend Email
                </button>

                <Link href="/login" className="block">
                  <button className="btn-ghost w-full border-cyan/30">
                    Back to Login
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Support */}
        <div className="mt-6 text-center">
          <p className="text-sm ">
            Need help?{' '}
            <Link href="/contact" className="text-cyan hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
