'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, X } from 'lucide-react'

interface TrialState {
  status: 'active' | 'trialing' | 'cancelled' | 'past_due' | null
  daysLeft: number | null
  currentPeriodEnd: string | null
}

export function TrialBanner() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const [trial, setTrial] = useState<TrialState>({ status: null, daysLeft: null, currentPeriodEnd: null })
  const [dismissed, setDismissed] = useState(false)
  const [showWelcome, setShowWelcome] = useState(searchParams.get('trial') === 'welcome')

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('athlete_memberships')
        .select('status, current_period_end')
        .eq('athlete_id', user.id)
        .in('status', ['active', 'trialing'])
        .order('current_period_end', { ascending: false })
        .limit(1)
        .single()
      if (cancelled || !data) return

      let daysLeft: number | null = null
      if (data.current_period_end) {
        const ms = new Date(data.current_period_end).getTime() - Date.now()
        daysLeft = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
      }
      setTrial({ status: data.status, daysLeft, currentPeriodEnd: data.current_period_end })
    }
    load()
    return () => { cancelled = true }
  }, [supabase])

  if (dismissed) return null
  if (trial.status !== 'trialing') return null

  const days = trial.daysLeft ?? 60
  const isUrgent = days <= 7

  return (
    <div className={`relative mb-4 p-4 rounded-2xl border ${
      isUrgent
        ? 'border-orange/40 bg-orange/10 dark:bg-orange/15'
        : 'border-cyan-200/50 dark:border-cyan/30 bg-gradient-to-br from-cyan/10 via-orange/5 to-cyan/10'
    }`}>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isUrgent ? 'bg-orange/20 text-orange' : 'bg-cyan/20 text-cyan-700 dark:text-cyan-300'
        }`}>
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          {showWelcome ? (
            <>
              <p className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Welcome to PSP.Pro 🎉 You&apos;re on the Elite plan, on the house.
              </p>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-white/70 mt-0.5">
                You&apos;ve got the next 60 days to use every feature — drills, progress tracking, courses, video analysis — completely free. No card needed.
              </p>
              <button
                type="button"
                onClick={() => setShowWelcome(false)}
                className="mt-2 text-xs font-semibold text-orange hover:text-orange/80"
              >
                Got it →
              </button>
            </>
          ) : (
            <>
              <p className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                {isUrgent ? `${days} day${days === 1 ? '' : 's'} left on your Elite trial` : `You have ${days} days left on your Elite trial`}
              </p>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-white/70 mt-0.5">
                {isUrgent
                  ? 'Pick up Elite to keep your full dashboard, drills, progress, and courses. No long-term commitment.'
                  : 'Loving the full dashboard? You can convert anytime before your trial ends.'}
              </p>
              <Link
                href="/memberships"
                className="inline-block mt-2 text-xs font-semibold text-orange hover:text-orange/80"
              >
                Upgrade Elite →
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
