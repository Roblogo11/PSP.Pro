'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, CheckCircle, AlertTriangle, Eye, EyeOff, ShieldCheck } from 'lucide-react'

export default function InvitePage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()

  const [validating, setValidating] = useState(true)
  const [valid, setValid] = useState(false)
  const [invalidReason, setInvalidReason] = useState('')
  const [coachName, setCoachName] = useState('')
  const [sport, setSport] = useState<string | null>(null)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [age, setAge] = useState('')
  const [childName, setChildName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const underThirteen = parseInt(age) > 0 && parseInt(age) < 13

  useEffect(() => {
    async function validateToken() {
      try {
        const res = await fetch(`/api/admin/invite/${token}`)
        const data = await res.json()
        if (data.valid) {
          setValid(true)
          setCoachName(data.coachName)
          setSport(data.sport)
        } else {
          setInvalidReason(data.error || 'Invalid link')
        }
      } catch {
        setInvalidReason('Unable to validate link')
      } finally {
        setValidating(false)
      }
    }
    validateToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email || !password) { setError('All fields required'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (underThirteen && !childName.trim()) { setError("Please enter your child's name"); return }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/invite/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invite_token: token,
          full_name: fullName,
          email,
          password,
          ...(age ? { age: parseInt(age) } : {}),
          ...(underThirteen ? { child_name: childName } : {}),
        }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to create account')

      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy to-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!valid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Invite Link Invalid</h1>
          <p className="text-white/60 mb-6">{invalidReason}</p>
          <Link href="/" className="text-orange hover:text-orange-400 transition-colors font-semibold">
            Go to PSP.Pro Home
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Account Created!</h1>
          <p className="text-white/60 mb-2">Welcome to PSP.Pro, {fullName.split(' ')[0]}!</p>
          <p className="text-white/40 text-sm">Redirecting you to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange/30">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Join PSP.Pro</h1>
          <p className="text-white/60">
            <span className="text-orange font-semibold">{coachName}</span> invited you to train with PSP.Pro
          </p>
          {sport && (
            <p className="text-white/40 text-sm mt-1 capitalize">Sport: {sport}</p>
          )}
        </div>

        {/* Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Athlete Age (optional but enables parent account for under-13) */}
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-1.5">Athlete Age</label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="16"
                min="5"
                max="100"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-orange focus:outline-none transition-colors"
              />
            </div>

            {/* Parent account banner for under-13 */}
            {underThirteen && (
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-purple-300 leading-relaxed">
                    For under-13 athletes, this account is for the parent/guardian. You&apos;ll manage your child&apos;s dashboard.
                  </p>
                </div>
              </div>
            )}

            {/* Child's name (only for parent accounts) */}
            {underThirteen && (
              <div>
                <label className="block text-sm font-semibold text-purple-300 mb-1.5">Child&apos;s Name *</label>
                <input
                  type="text"
                  value={childName}
                  onChange={e => setChildName(e.target.value)}
                  placeholder="Child's full name"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-xl text-white placeholder-purple-400/40 focus:border-purple-400 focus:outline-none transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-white/70 mb-1.5">
                {underThirteen ? 'Parent/Guardian Name' : 'Full Name'}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder={underThirteen ? 'Parent/Guardian name' : 'Jane Smith'}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-orange focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/70 mb-1.5">
                {underThirteen ? 'Parent/Guardian Email' : 'Email Address'}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jane@example.com"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-orange focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/70 mb-1.5">Create Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                  className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-orange focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-orange to-amber-500 text-white font-bold rounded-xl hover:from-orange/90 hover:to-amber-500/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange/30"
            >
              {submitting ? 'Creating Account...' : 'Create My Account'}
            </button>

            <p className="text-center text-xs text-white/30">
              Already have an account?{' '}
              <Link href="/login" className="text-orange hover:text-orange-400 transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-white/20 mt-4">
          PSP.Pro · Proper Sports Performance · Virginia Beach, VA
        </p>
      </div>
    </div>
  )
}
