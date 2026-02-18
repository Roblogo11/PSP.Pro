'use client'

import { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import { Medal, Trophy, CheckCircle2, AlertCircle, Filter, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { SPORT_METRICS, type MetricDef } from '@/lib/hooks/use-athlete-metrics'

const SPORT_TABS = [
  { key: 'softball', label: 'Softball' },
  { key: 'basketball', label: 'Basketball' },
  { key: 'soccer', label: 'Soccer' },
  { key: 'athleticism', label: 'Athleticism' },
]

// Top metrics to rank for each sport
const LEADERBOARD_METRICS: Record<string, string[]> = {
  softball: ['exit_velocity', 'overhand_throw_velocity', 'bat_speed', 'pitching_velocity', 'home_to_first'],
  basketball: ['three_point_pct', 'vertical_jump', 'free_throw_pct', 'lane_agility', 'court_sprint'],
  soccer: ['sprint_speed', 'shot_power', 'passing_accuracy', 'dribble_success', 'vo2_max'],
  athleticism: ['forty_yard_dash', 'vertical_jump', 'broad_jump', 'pro_agility', 'ten_yard_split'],
}

interface LeaderboardEntry {
  athleteId: string
  athleteName: string
  avatarUrl: string | null
  region: string | null
  value: number
  verified: boolean
  date: string
}

function getMetricValue(entry: any, metricDef: MetricDef): number | null {
  if (metricDef.dbColumn && entry[metricDef.dbColumn] != null) {
    return Number(entry[metricDef.dbColumn])
  }
  if (metricDef.jsonKey && entry.custom_metrics?.metrics?.[metricDef.key] != null) {
    return Number(entry.custom_metrics.metrics[metricDef.key])
  }
  return null
}

export default function LeaderboardsPage() {
  const { profile, loading: profileLoading } = useUserRole()
  const [sportTab, setSportTab] = useState('softball')
  const [selectedMetric, setSelectedMetric] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [regionFilter, setRegionFilter] = useState<string>('all')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Set default metric when sport changes
  useEffect(() => {
    const metrics = LEADERBOARD_METRICS[sportTab] || []
    setSelectedMetric(metrics[0] || '')
  }, [sportTab])

  // Fetch leaderboard data
  useEffect(() => {
    if (!selectedMetric) return

    async function fetchLeaderboard() {
      setLoading(true)
      try {
        const supabase = createClient()
        const metricDef = SPORT_METRICS[sportTab]?.find(m => m.key === selectedMetric)
        if (!metricDef) return

        // Get all opted-in profiles
        let profilesQuery = supabase
          .from('profiles')
          .select('id, full_name, avatar_url, region')
          .eq('leaderboard_opt_in', true)
          .eq('role', 'athlete')

        if (regionFilter !== 'all') {
          profilesQuery = profilesQuery.eq('region', regionFilter)
        }

        const { data: profiles } = await profilesQuery

        if (!profiles || profiles.length === 0) {
          setLeaderboard([])
          setLoading(false)
          return
        }

        const profileMap = new Map(profiles.map(p => [p.id, p]))
        const athleteIds = profiles.map(p => p.id)

        // Get all metric entries for these athletes
        const { data: metricsData } = await supabase
          .from('athlete_performance_metrics')
          .select('*')
          .in('athlete_id', athleteIds)
          .order('test_date', { ascending: false })

        // Find best value per athlete for this metric
        const bestPerAthlete: Record<string, { value: number; verified: boolean; date: string }> = {}

        for (const entry of (metricsData || [])) {
          const val = getMetricValue(entry, metricDef)
          if (val === null) continue

          const isVerified = entry.custom_metrics?.verified ?? true
          if (verifiedOnly && !isVerified) continue

          const athleteId = entry.athlete_id
          const existing = bestPerAthlete[athleteId]

          if (!existing) {
            bestPerAthlete[athleteId] = { value: val, verified: isVerified, date: entry.test_date }
          } else if (metricDef.lowerIsBetter ? val < existing.value : val > existing.value) {
            bestPerAthlete[athleteId] = { value: val, verified: isVerified, date: entry.test_date }
          }
        }

        // Build leaderboard
        const entries: LeaderboardEntry[] = Object.entries(bestPerAthlete)
          .map(([athleteId, data]) => {
            const prof = profileMap.get(athleteId)
            if (!prof) return null
            return {
              athleteId,
              athleteName: prof.full_name || 'Unknown',
              avatarUrl: prof.avatar_url,
              region: prof.region,
              value: data.value,
              verified: data.verified,
              date: data.date,
            }
          })
          .filter(Boolean) as LeaderboardEntry[]

        // Sort
        entries.sort((a, b) => metricDef.lowerIsBetter ? a.value - b.value : b.value - a.value)

        setLeaderboard(entries.slice(0, 25))
      } catch (error) {
        console.error('Error loading leaderboard:', error)
        setLeaderboard([])
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [sportTab, selectedMetric, verifiedOnly, regionFilter])

  // Fetch available regions
  useEffect(() => {
    async function fetchRegions() {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('region')
        .eq('leaderboard_opt_in', true)
        .not('region', 'is', null)

      if (data) {
        const unique = [...new Set(data.map(d => d.region).filter(Boolean))] as string[]
        setRegions(unique.sort())
      }
    }
    fetchRegions()
  }, [])

  const currentMetricDef = SPORT_METRICS[sportTab]?.find(m => m.key === selectedMetric)
  const availableMetrics = (LEADERBOARD_METRICS[sportTab] || [])
    .map(key => SPORT_METRICS[sportTab]?.find(m => m.key === key))
    .filter(Boolean) as MetricDef[]

  if (profileLoading) {
    return (
      <div className="min-h-screen px-3 py-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cyan-700 dark:text-white">Loading leaderboards...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-3 py-4 md:p-8 pb-24 lg:pb-8 relative">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-2">
          Regional <span className="text-gradient-orange">Leaderboards</span>
        </h1>
        <p className="text-cyan-700 dark:text-white text-lg">
          See how you stack up against other PSP athletes
        </p>
      </div>

      {/* Opt-in Banner */}
      {profile && !(profile as any).leaderboard_opt_in && (
        <div className="mb-6 p-4 rounded-xl bg-orange/10 border border-orange/20 flex items-center gap-4">
          <Medal className="w-8 h-8 text-orange flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-slate-900 dark:text-white">Want to appear on the leaderboard?</p>
            <p className="text-sm text-cyan-700 dark:text-white">
              Opt in from your{' '}
              <a href="/settings" className="text-orange hover:text-orange-400 font-semibold">
                Settings
              </a>{' '}
              page to showcase your best metrics.
            </p>
          </div>
        </div>
      )}

      {/* Sport Tab Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {SPORT_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSportTab(tab.key)}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
              sportTab === tab.key
                ? 'bg-orange text-white shadow-glow-orange'
                : 'bg-cyan-900/30 text-cyan-700 dark:text-white hover:bg-cyan-900 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Metric Selector */}
        <div className="relative">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-cyan-900/30 border border-cyan-200/40 text-slate-900 dark:text-white font-medium text-sm focus:border-orange focus:outline-none cursor-pointer"
          >
            {availableMetrics.map(m => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-700 pointer-events-none" />
        </div>

        {/* Region Filter */}
        {regions.length > 0 && (
          <div className="relative">
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-cyan-900/30 border border-cyan-200/40 text-slate-900 dark:text-white font-medium text-sm focus:border-orange focus:outline-none cursor-pointer"
            >
              <option value="all">All Regions</option>
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-700 pointer-events-none" />
          </div>
        )}

        {/* Verified Only Toggle */}
        <button
          onClick={() => setVerifiedOnly(!verifiedOnly)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
            verifiedOnly
              ? 'bg-green-500/20 border border-green-500/40 text-green-400'
              : 'bg-cyan-900/30 border border-cyan-200/40 text-cyan-700 dark:text-white hover:border-green-500/40'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Verified Only
        </button>
      </div>

      {/* Leaderboard */}
      <div className="command-panel">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-orange border-t-transparent rounded-full animate-spin" />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 text-cyan-700/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Leaderboard Data Yet</h3>
            <p className="text-cyan-700 dark:text-white max-w-md mx-auto">
              Athletes need to opt in to leaderboards and have recorded metrics to appear here.
              Coaches can log metrics from the athlete detail or bookings page.
            </p>
          </div>
        ) : (
          <>
            {/* ── Mobile card list (< md) ── */}
            <div className="md:hidden divide-y divide-cyan-200/20">
              {leaderboard.map((entry, index) => {
                const isMe = entry.athleteId === profile?.id
                const rankColors = ['text-yellow-400', 'text-gray-300', 'text-orange-600']
                const medalColor = rankColors[index] || 'text-slate-400'

                return (
                  <div
                    key={entry.athleteId}
                    className={`flex items-center gap-3 px-4 py-3 ${isMe ? 'bg-orange/10' : ''}`}
                  >
                    {/* Rank */}
                    <div className={`w-8 text-center font-bold text-base flex-shrink-0 ${medalColor}`}>
                      {index < 3 ? <Medal className="w-5 h-5 mx-auto" /> : index + 1}
                    </div>

                    {/* Avatar */}
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-orange/30 bg-gradient-to-br from-cyan to-orange flex-shrink-0">
                      {entry.avatarUrl ? (
                        <Image src={entry.avatarUrl} alt={entry.athleteName} fill sizes="36px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                          {entry.athleteName.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Name + region */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${isMe ? 'text-orange' : 'text-slate-900 dark:text-white'}`}>
                        {entry.athleteName}{isMe && <span className="text-xs ml-1 text-orange">(You)</span>}
                      </p>
                      <p className="text-xs text-cyan-700 dark:text-white/50 truncate">
                        {entry.region || 'No region'} · {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    {/* Value + badge */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-base text-gradient-orange">
                        {entry.value}<span className="text-xs font-normal ml-0.5">{currentMetricDef?.unit || ''}</span>
                      </p>
                      {entry.verified ? (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-green-400">
                          <CheckCircle2 className="w-2.5 h-2.5" /> PSP Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-gray-400">
                          <AlertCircle className="w-2.5 h-2.5" /> Self-Rep.
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── Desktop table (≥ md) ── */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyan-200/40">
                    <th className="text-left py-3 px-4 text-xs font-bold text-cyan-700 dark:text-white uppercase tracking-wider">Rank</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-cyan-700 dark:text-white uppercase tracking-wider">Athlete</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-cyan-700 dark:text-white uppercase tracking-wider">Region</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-cyan-700 dark:text-white uppercase tracking-wider">
                      {currentMetricDef?.label || 'Value'}
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-bold text-cyan-700 dark:text-white uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => {
                    const isMe = entry.athleteId === profile?.id
                    const rankColors = ['text-yellow-400', 'text-gray-300', 'text-orange-600']

                    return (
                      <tr
                        key={entry.athleteId}
                        className={`border-b border-cyan-200/20 transition-colors ${isMe ? 'bg-orange/10' : 'hover:bg-white/5'}`}
                      >
                        <td className="py-4 px-4">
                          <div className={`text-lg font-bold ${rankColors[index] || 'text-slate-900 dark:text-white'}`}>
                            {index < 3 ? (
                              <div className="flex items-center gap-1">
                                <Medal className="w-5 h-5" />{index + 1}
                              </div>
                            ) : index + 1}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-orange/30 bg-gradient-to-br from-cyan to-orange flex-shrink-0">
                              {entry.avatarUrl ? (
                                <Image src={entry.avatarUrl} alt={entry.athleteName} fill sizes="40px" className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                  {entry.athleteName.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className={`font-semibold ${isMe ? 'text-orange' : 'text-slate-900 dark:text-white'}`}>
                                {entry.athleteName}
                                {isMe && <span className="text-xs ml-2 text-orange">(You)</span>}
                              </p>
                              <p className="text-xs text-cyan-700 dark:text-white/60">
                                {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-cyan-700 dark:text-white">{entry.region || '—'}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-lg font-bold text-gradient-orange">
                            {entry.value} {currentMetricDef?.unit || ''}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {entry.verified ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400 bg-gray-500/10 px-2 py-1 rounded-full">
                              <AlertCircle className="w-3 h-3" /> Self-Reported
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
