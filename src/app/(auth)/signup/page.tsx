'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, User, Calendar, Loader2, ArrowRight } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const athleteType = formData.get('athleteType') as string
    const age = formData.get('age') as string

    try {
      const supabase = createClient()

      // 1. Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (signUpError) throw signUpError

      // 2. Create profile (this should be handled by a trigger in production)
      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          full_name: fullName,
          athlete_type: athleteType,
          age: parseInt(age, 10),
        })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // Don't throw - the user is created, profile can be added later
        }

        // Redirect to dashboard
        router.push('/locker')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.')
    } finally {
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
            Start Your Journey
          </h1>
          <p className="text-slate-400">
            Create your Athletic OS account
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name Field */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                autoComplete="name"
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange/50 transition-all"
                placeholder="John Smith"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange/50 transition-all"
                placeholder="athlete@example.com"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                minLength={8}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange/50 transition-all"
                placeholder="••••••••"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">Minimum 8 characters</p>
          </div>

          {/* Athlete Type & Age Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Athlete Type */}
            <div>
              <label htmlFor="athleteType" className="block text-sm font-medium text-slate-300 mb-2">
                Sport
              </label>
              <select
                id="athleteType"
                name="athleteType"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange/50 transition-all"
              >
                <option value="baseball">Baseball</option>
                <option value="softball">Softball</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-slate-300 mb-2">
                Age
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="age"
                  name="age"
                  type="number"
                  required
                  min="5"
                  max="100"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange/50 transition-all"
                  placeholder="16"
                />
              </div>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-orange focus:ring-orange/50"
            />
            <label htmlFor="terms" className="text-sm text-slate-400">
              I agree to the{' '}
              <Link href="/terms" className="text-orange hover:text-orange-400">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-orange hover:text-orange-400">
                Privacy Policy
              </Link>
            </label>
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
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6">
          <div className="divider-glow" />
        </div>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-slate-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-orange hover:text-orange-400 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="mt-6 text-center text-sm text-slate-500">
        <p>
          Questions?{' '}
          <Link href="/contact" className="text-slate-400 hover:text-orange transition-colors">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  )
}
