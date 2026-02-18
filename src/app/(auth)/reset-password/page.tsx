'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [validToken, setValidToken] = useState(false)

  useEffect(() => {
    // Check if we have a valid session from the reset link
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        setValidToken(true)
      } else {
        setError('Invalid or expired reset link. Please request a new one.')
      }
    }

    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) throw updateError

      setSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full blur-[150px]" style={{ background: 'radial-gradient(circle, rgba(0, 180, 216, 0.15) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card p-8">
          {!success ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange/10 rounded-full mb-4">
                  <Lock className="w-8 h-8 text-orange" />
                </div>
                <h1 className="text-3xl font-display font-bold text-white mb-2">
                  Reset Password
                </h1>
                <p className="">
                  Choose a new password for your account
                </p>
              </div>

              {validToken ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* New Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold  mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                        className="w-full px-4 py-3 bg-cyan-900/30 border border-cyan-700/50 rounded-xl text-white placeholder-cyan-600 focus:border-orange focus:outline-none transition-colors pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2  hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-xs  mt-2">
                      Must be at least 8 characters
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold  mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                        className="w-full px-4 py-3 bg-cyan-900/30 border border-cyan-700/50 rounded-xl text-white placeholder-cyan-600 focus:border-orange focus:outline-none transition-colors pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2  hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div role="alert" className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              ) : (
                <div className="text-center">
                  <div role="alert" className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-6">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                  <Link href="/forgot-password">
                    <button className="btn-primary w-full">
                      Request New Reset Link
                    </button>
                  </Link>
                </div>
              )}

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
                  Password Reset!
                </h1>
                <p className=" mb-6">
                  Your password has been successfully reset.
                </p>
                <p className="text-sm  mb-6">
                  Redirecting to login...
                </p>
                <Link href="/login">
                  <button className="btn-primary w-full">
                    Continue to Login
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
