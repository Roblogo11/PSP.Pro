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
  const [age, setAge] = useState<string>('')
  const [showParentFields, setShowParentFields] = useState(false)
  const [selectedSports, setSelectedSports] = useState<string[]>(['softball'])

  const handleAgeChange = (value: string) => {
    setAge(value)
    const ageNum = parseInt(value, 10)
    setShowParentFields(ageNum > 0 && ageNum < 18)
  }

  const handleSportToggle = (sport: string) => {
    setSelectedSports(prev => {
      if (prev.includes(sport)) {
        // Don't allow deselecting if it's the last one
        if (prev.length === 1) return prev
        return prev.filter(s => s !== sport)
      } else {
        return [...prev, sport]
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const age = formData.get('age') as string
    const parentGuardianName = formData.get('parentGuardianName') as string
    const parentGuardianEmail = formData.get('parentGuardianEmail') as string
    const parentGuardianPhone = formData.get('parentGuardianPhone') as string

    try {
      const supabase = createClient()

      // 1. Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            sports: selectedSports,
            athlete_type: selectedSports[0], // Primary sport for backwards compatibility
            age: parseInt(age, 10),
          },
        },
      })

      if (signUpError) throw signUpError

      if (!authData.user) {
        throw new Error('Signup failed - no user data returned')
      }

      // 2. Wait for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 500))

      // 3. Create/update profile with additional fields
      // Note: If trigger exists, this will update. If not, it will insert.
      const profileData: any = {
        id: authData.user.id,
        full_name: fullName,
        sports: selectedSports,
        athlete_type: selectedSports[0], // Primary sport for backwards compatibility
        age: parseInt(age, 10),
        role: 'athlete',
        updated_at: new Date().toISOString(),
      }

      // Add parent/guardian info if athlete is under 18
      if (parseInt(age, 10) < 18) {
        if (parentGuardianName) profileData.parent_guardian_name = parentGuardianName
        if (parentGuardianEmail) profileData.parent_guardian_email = parentGuardianEmail
        if (parentGuardianPhone) profileData.parent_guardian_phone = parentGuardianPhone
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id'
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        throw new Error(`Failed to create profile: ${profileError.message}`)
      }

      // 4. Verify profile was created successfully
      const { data: profile, error: profileFetchError } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', authData.user.id)
        .single()

      if (profileFetchError || !profile) {
        console.error('Profile verification error:', profileFetchError)
        throw new Error('Account created but profile verification failed. Please contact support.')
      }

      // 5. Success! Refresh server state then navigate to FAQ
      // New members land on FAQ first — they need to purchase a membership to access the dashboard
      router.refresh()
      router.push('/faq')
      return
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.message || 'Failed to create account. Please try again.')
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
          <p className="">
            Create your PSP.Pro account
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
            <label htmlFor="fullName" className="block text-sm font-medium  mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 " />
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                autoComplete="name"
                className="w-full pl-12 pr-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-white placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-orange/50 transition-all"
                placeholder="John Smith"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium  mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 " />
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
            <label htmlFor="password" className="block text-sm font-medium  mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 " />
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                minLength={8}
                className="w-full pl-12 pr-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-white placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-orange/50 transition-all"
                placeholder="••••••••"
              />
            </div>
            <p className="mt-1 text-xs ">Minimum 8 characters</p>
          </div>

          {/* Sports Selection (Multi-Select) */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Sports <span className="text-xs text-cyan-700 dark:text-white">(Select all that apply)</span>
            </label>
            <div className="space-y-3">
              {[
                { value: 'softball', label: 'Softball', emoji: '🥎' },
                { value: 'basketball', label: 'Basketball', emoji: '🏀' },
                { value: 'soccer', label: 'Soccer', emoji: '⚽' },
              ].map((sport) => (
                <label
                  key={sport.value}
                  className={`
                    flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all
                    ${selectedSports.includes(sport.value)
                      ? 'bg-orange/20 border-2 border-orange/50'
                      : 'bg-cyan-50/50 border border-cyan-200/40 hover:border-orange/30'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={selectedSports.includes(sport.value)}
                    onChange={() => handleSportToggle(sport.value)}
                    className="w-5 h-5 rounded border-cyan-200/40 text-orange focus:ring-cyan/50"
                  />
                  <span className="text-2xl">{sport.emoji}</span>
                  <span className="font-medium text-cyan-800 dark:text-white">{sport.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Age */}
          <div>
            <label htmlFor="age" className="block text-sm font-medium  mb-2">
              Age
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 " />
              <input
                id="age"
                name="age"
                type="number"
                required
                min="5"
                max="100"
                value={age}
                onChange={(e) => handleAgeChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-white placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-orange/50 transition-all"
                placeholder="16"
              />
            </div>
          </div>

          {/* Parent/Guardian Information (only if under 18) */}
          {showParentFields && (
            <div className="space-y-4 p-4 rounded-xl bg-orange/5 border border-orange/20">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-orange" />
                <h3 className="text-sm font-semibold text-orange">Parent/Guardian Information</h3>
              </div>

              {/* Parent/Guardian Name */}
              <div>
                <label htmlFor="parentGuardianName" className="block text-sm font-medium  mb-2">
                  Parent/Guardian Name *
                </label>
                <input
                  id="parentGuardianName"
                  name="parentGuardianName"
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-white placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-orange/50 transition-all"
                  placeholder="Jane Smith"
                />
              </div>

              {/* Parent/Guardian Email */}
              <div>
                <label htmlFor="parentGuardianEmail" className="block text-sm font-medium  mb-2">
                  Parent/Guardian Email *
                </label>
                <input
                  id="parentGuardianEmail"
                  name="parentGuardianEmail"
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-white placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-orange/50 transition-all"
                  placeholder="parent@example.com"
                />
              </div>

              {/* Parent/Guardian Phone */}
              <div>
                <label htmlFor="parentGuardianPhone" className="block text-sm font-medium  mb-2">
                  Parent/Guardian Phone *
                </label>
                <input
                  id="parentGuardianPhone"
                  name="parentGuardianPhone"
                  type="tel"
                  required
                  className="w-full px-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-white placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-orange/50 transition-all"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          )}

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="mt-1 w-4 h-4 rounded border-cyan-200/40 bg-cyan-50/50 text-orange focus:ring-cyan/50"
            />
            <label htmlFor="terms" className="text-sm ">
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
        <div className="text-center space-y-3">
          <p>
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-orange hover:text-orange-400 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
          <p className="text-sm">
            Haven&apos;t talked to a coach yet?{' '}
            <Link
              href="/get-started"
              className="text-cyan hover:text-cyan-400 font-semibold transition-colors"
            >
              Join the Team first
            </Link>
          </p>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="mt-6 text-center text-sm ">
        <p>
          Questions?{' '}
          <Link href="/contact" className=" hover:text-orange transition-colors">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  )
}
