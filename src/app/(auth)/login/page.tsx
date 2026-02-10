'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const urlError = searchParams.get('error')
    if (urlError === 'confirmation_failed') {
      setError('Email confirmation failed. Please try again or contact support.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const supabase = createClient()
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      if (data.user) {
        // Fetch role via server API route (bypasses RLS — no timing issues)
        const res = await fetch('/api/auth/profile-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: data.user.id }),
        })

        const profileData = await res.json()

        if (!res.ok || !profileData.role) {
          console.error('Error fetching profile role:', profileData.error)
          throw new Error('Failed to load user profile. Please try again.')
        }

        // Full page navigation ensures middleware syncs auth cookies
        // (router.push can race with cookie sync on Safari/Apple devices)
        if (['admin', 'coach', 'master_admin'].includes(profileData.role)) {
          window.location.href = '/admin'
        } else {
          window.location.href = '/locker'
        }
        return
      }
    } catch (err: any) {
      console.error('Login error:', err)
      // Provide user-friendly messages for common Supabase auth errors
      let message = err.message || 'Failed to sign in. Please try again.'
      if (message.includes('Email not confirmed')) {
        message = 'Your email has not been confirmed yet. Please check your inbox for a confirmation link, or contact support.'
      } else if (message.includes('Invalid login credentials')) {
        message = 'Incorrect email or password. Please try again.'
      }
      setError(message)
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="glass-card p-8 md:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
            Welcome Back
          </h1>
          <p>
            Sign in to access your PSP.Pro
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-700" />
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full pl-12 pr-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-white placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-orange/50 transition-all"
                placeholder="athlete@example.com"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-700" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                className="w-full pl-12 pr-12 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-white placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-orange/50 transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-700 hover:text-orange transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex items-center justify-end">
            <Link
              href="/forgot-password"
              className="text-sm hover:text-orange transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-8">
          <div className="divider-glow" />
        </div>

        {/* Sign Up Link */}
        <div className="text-center space-y-3">
          <p>
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-orange hover:text-orange-400 font-semibold transition-colors"
            >
              Sign up
            </Link>
          </p>
          <p className="text-sm">
            New to PSP?{' '}
            <Link
              href="/get-started"
              className="text-cyan hover:text-cyan-400 font-semibold transition-colors"
            >
              Join the Team
            </Link>
          </p>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="mt-6 text-center text-sm">
        <p>
          Need help?{' '}
          <Link href="/contact" className="hover:text-orange transition-colors">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  )
}
