'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, Calendar, Phone, UserPlus, Loader2 } from 'lucide-react'

export default function CreateAthletePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
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
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const data = {
      email: formData.get('email') as string,
      full_name: formData.get('fullName') as string,
      password: formData.get('password') as string || 'Welcome123!', // Default password
      sports: selectedSports,
      age: parseInt(age, 10),
      parent_guardian_name: formData.get('parentGuardianName') as string,
      parent_guardian_email: formData.get('parentGuardianEmail') as string,
      parent_guardian_phone: formData.get('parentGuardianPhone') as string,
    }

    try {
      const response = await fetch('/api/admin/create-athlete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create athlete')
      }

      setSuccess(true)
      // Reset form
      ;(e.target as HTMLFormElement).reset()
      setAge('')
      setSelectedSports(['softball'])
      setShowParentFields(false)

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/admin/athletes')
      }, 2000)
    } catch (err: any) {
      console.error('Create athlete error:', err)
      setError(err.message || 'Failed to create athlete')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-3 py-4 md:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Create New Athlete</h1>
        <p className="text-cyan-700 dark:text-white">Add a new athlete to the system</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <p className="text-sm text-green-400 font-semibold">
            ✅ Athlete created successfully! Redirecting to athletes list...
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-card p-8">
        <div className="space-y-5">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-cyan-800 dark:text-white mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-700 dark:text-white" />
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="w-full pl-12 pr-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-slate-900 dark:text-white placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-orange/50 transition-all"
                placeholder="John Smith"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-cyan-800 dark:text-white mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-700 dark:text-white" />
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full pl-12 pr-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-slate-900 dark:text-white placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-orange/50 transition-all"
                placeholder="athlete@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-cyan-800 dark:text-white mb-2">
              Initial Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-700 dark:text-white" />
              <input
                id="password"
                name="password"
                type="text"
                className="w-full pl-12 pr-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-slate-900 dark:text-white placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-orange/50 transition-all"
                placeholder="Leave blank for default: Welcome123!"
              />
            </div>
            <p className="mt-1 text-xs text-cyan-700 dark:text-white">
              If left blank, default password will be: <strong>Welcome123!</strong>
            </p>
          </div>

          {/* Sports Selection (Multi-Select) */}
          <div>
            <label className="block text-sm font-medium text-cyan-800 dark:text-white mb-3">
              Sports * <span className="text-xs text-cyan-700 dark:text-white">(Select all that apply)</span>
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
            <label htmlFor="age" className="block text-sm font-medium text-cyan-800 dark:text-white mb-2">
              Age *
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-700 dark:text-white" />
              <input
                id="age"
                name="age"
                type="number"
                required
                min="5"
                max="100"
                value={age}
                onChange={(e) => handleAgeChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-slate-900 dark:text-white placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-orange/50 transition-all"
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
                <label htmlFor="parentGuardianName" className="block text-sm font-medium text-cyan-800 dark:text-white mb-2">
                  Parent/Guardian Name *
                </label>
                <input
                  id="parentGuardianName"
                  name="parentGuardianName"
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-slate-900 dark:text-white placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-orange/50 transition-all"
                  placeholder="Jane Smith"
                />
              </div>

              {/* Parent/Guardian Email */}
              <div>
                <label htmlFor="parentGuardianEmail" className="block text-sm font-medium text-cyan-800 dark:text-white mb-2">
                  Parent/Guardian Email *
                </label>
                <input
                  id="parentGuardianEmail"
                  name="parentGuardianEmail"
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-slate-900 dark:text-white placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-orange/50 transition-all"
                  placeholder="parent@example.com"
                />
              </div>

              {/* Parent/Guardian Phone */}
              <div>
                <label htmlFor="parentGuardianPhone" className="block text-sm font-medium text-cyan-800 dark:text-white mb-2">
                  Parent/Guardian Phone *
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-700 dark:text-white" />
                  <input
                    id="parentGuardianPhone"
                    name="parentGuardianPhone"
                    type="tel"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-slate-900 dark:text-white placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-orange/50 transition-all"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || success}
              className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating athlete...</span>
                </>
              ) : success ? (
                <>
                  <span>✅ Created!</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Create Athlete</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push('/admin/athletes')}
              className="px-6 py-3 rounded-xl bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-800 dark:text-white border border-cyan-600/30 hover:border-cyan-600/50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 rounded-xl bg-cyan/5 border border-cyan/20">
        <p className="text-sm text-cyan-700 dark:text-white">
          <strong>Note:</strong> Athletes will receive a confirmation email and can change their password after first login.
        </p>
      </div>
    </div>
  )
}
