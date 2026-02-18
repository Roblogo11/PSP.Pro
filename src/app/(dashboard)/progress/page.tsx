'use client'

import { useState, useMemo, useEffect } from 'react'
import { TrendingUp, Target, Zap, Activity, Award, Trophy, CheckCircle2, AlertCircle } from 'lucide-react'
import { VelocityProgressChart, MultiMetricChart } from '@/components/dashboard/velocity-progress-chart'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { useUserStats } from '@/lib/hooks/use-user-stats'
import { useUserSessions } from '@/lib/hooks/use-user-sessions'
import { useAthleteMetrics, SPORT_METRICS, DEFAULT_CHART_METRICS } from '@/lib/hooks/use-athlete-metrics'

const SPORT_TABS = [
  { key: 'softball', label: 'Softball' },
  { key: 'basketball', label: 'Basketball' },
  { key: 'soccer', label: 'Soccer' },
  { key: 'athleticism', label: 'Athleticism' },
]

const CHART_COLORS = ['#00B4D8', '#FF4B2B', '#22C55E', '#F59E0B', '#A855F7']

export default function ProgressPage() {
  const { profile, isImpersonating, impersonatedUserId, loading: profileLoading } = useUserRole()
  const effectiveUserId = impersonatedUserId || profile?.id
  const { stats, loading: statsLoading } = useUserStats(effectiveUserId)
  const { sessions, loading: sessionsLoading } = useUserSessions(effectiveUserId)
  const { entries, loading: metricsLoading, getMetricTimeSeries, getPersonalRecords } = useAthleteMetrics(effectiveUserId)

  const [sportTab, setSportTab] = useState('softball')

  const loading = profileLoading || statsLoading || sessionsLoading || metricsLoading

  // Detect athlete sport from their metric data
  const detectedSport = useMemo(() => {
    const sportCounts: Record<string, number> = {}
    for (const entry of entries) {
      if (entry.sport) {
        sportCounts[entry.sport] = (sportCounts[entry.sport] || 0) + 1
      }
    }
    const sorted = Object.entries(sportCounts).sort((a, b) => b[1] - a[1])
    return sorted[0]?.[0] || null
  }, [entries])

  // Auto-select sport tab based on detected sport or profile athlete_type
  useEffect(() => {
    const sport = detectedSport || (profile as any)?.athlete_type
    if (sport && SPORT_METRICS[sport]) {
      setSportTab(sport)
    }
  }, [detectedSport, profile])

  if (loading) {
    return (
      <div className="min-h-screen px-3 py-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cyan-700 dark:text-white">Loading your progress...</p>
        </div>
      </div>
    )
  }

  // Calculate real stats
  const peakVelocity = stats?.recentVelocities?.length
    ? Math.max(...stats.recentVelocities.map(v => v.value))
    : null
  const avgVelocity = stats?.avgVelocity ?? null
  const completedSessions = stats?.totalSessions ?? 0
  const completedDrills = stats?.totalDrills ?? 0

  const progressStats = [
    { label: 'Peak Velocity', value: peakVelocity ? `${peakVelocity} mph` : '--', icon: Zap },
    { label: 'Avg Velocity', value: avgVelocity ? `${avgVelocity} mph` : '--', icon: Activity },
    { label: 'Sessions Completed', value: `${completedSessions}`, icon: Target },
    { label: 'Drills Completed', value: `${completedDrills}`, icon: Award },
  ]

  // Build multi-metric chart data
  const defaultMetricKeys = DEFAULT_CHART_METRICS[sportTab] || []
  const sportMetrics = SPORT_METRICS[sportTab] || []

  const chartData = useMemo(() => {
    // Collect all dates that have any of the default metrics
    const dateMap: Record<string, Record<string, number>> = {}

    for (const metricKey of defaultMetricKeys) {
      const series = getMetricTimeSeries(metricKey, sportTab)
      for (const point of series) {
        if (!dateMap[point.date]) dateMap[point.date] = {}
        dateMap[point.date][metricKey] = point.value
      }
    }

    return Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, values]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ...values,
      }))
  }, [sportTab, defaultMetricKeys, getMetricTimeSeries])

  const chartMetricLines = defaultMetricKeys.map((key, i) => {
    const def = sportMetrics.find(m => m.key === key)
    return {
      key,
      label: def?.label || key,
      color: CHART_COLORS[i % CHART_COLORS.length],
      unit: def?.unit || '',
    }
  })

  // Personal records for the selected sport
  const personalRecords = getPersonalRecords(sportTab)

  // Build milestones from session data + metric data
  const completedSessionsList = sessions
    .filter(s => s.status === 'completed')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const milestones: Array<{ id: number; title: string; date: string; value: string; achieved: boolean }> = []

  if (completedSessionsList.length > 0) {
    const first = completedSessionsList[0]
    milestones.push({
      id: 1,
      title: 'First Training Session',
      date: new Date(first.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      value: first.type,
      achieved: true,
    })
  }

  if (peakVelocity) {
    milestones.push({ id: 2, title: `Peak Velocity: ${peakVelocity} mph`, date: 'Personal Best', value: `${peakVelocity} mph`, achieved: true })
  }

  // Metric-based milestones
  for (const pr of personalRecords.slice(0, 3)) {
    milestones.push({
      id: 300 + personalRecords.indexOf(pr),
      title: `${pr.label}: ${pr.value} ${pr.unit}`,
      date: new Date(pr.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      value: pr.verified ? 'PSP Verified' : 'Self-Reported',
      achieved: true,
    })
  }

  const sessionThresholds = [5, 10, 25, 50, 100]
  for (const threshold of sessionThresholds) {
    milestones.push({
      id: 10 + threshold,
      title: `${threshold} Sessions Completed`,
      date: completedSessions >= threshold ? 'Achieved' : `${threshold - completedSessions} more to go`,
      value: `${Math.min(completedSessions, threshold)}/${threshold}`,
      achieved: completedSessions >= threshold,
    })
    if (completedSessions < threshold) break
  }

  const drillThresholds = [10, 25, 50]
  for (const threshold of drillThresholds) {
    milestones.push({
      id: 100 + threshold,
      title: `${threshold} Drills Completed`,
      date: completedDrills >= threshold ? 'Achieved' : `${threshold - completedDrills} more to go`,
      value: `${Math.min(completedDrills, threshold)}/${threshold}`,
      achieved: completedDrills >= threshold,
    })
    if (completedDrills < threshold) break
  }

  if (stats?.currentStreak && stats.currentStreak >= 3) {
    milestones.push({
      id: 200,
      title: `${stats.currentStreak}-Day Training Streak`,
      date: 'Current Streak',
      value: `${stats.currentStreak} days`,
      achieved: true,
    })
  }

  milestones.sort((a, b) => (b.achieved ? 1 : 0) - (a.achieved ? 1 : 0))

  return (
    <div className="min-h-screen px-3 py-4 md:p-8 pb-24 lg:pb-8 relative">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-2">
          Your <span className="text-gradient-orange">Progress</span>
        </h1>
        <p className="text-cyan-700 dark:text-white text-lg">
          Track your athletic development and achievements
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {progressStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="command-panel hover:border-orange/30 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-orange/20 rounded-xl flex items-center justify-center group-hover:bg-orange/30 transition-colors">
                  <Icon className="w-6 h-6 text-orange" />
                </div>
              </div>
              <p className="text-sm text-cyan-700 dark:text-white mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
            </div>
          )
        })}
      </div>

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

      {/* Multi-Metric Performance Chart */}
      <div className="mb-6">
        <MultiMetricChart
          data={chartData}
          metrics={chartMetricLines}
          title={`${SPORT_TABS.find(t => t.key === sportTab)?.label} Performance`}
          subtitle={`Tracking ${chartMetricLines.map(m => m.label).join(', ')}`}
        />
      </div>

      {/* Personal Records */}
      {personalRecords.length > 0 && (
        <div className="mb-6">
          <div className="command-panel">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-6 h-6 text-orange" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Personal Records</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personalRecords.map((pr) => (
                <div key={pr.metricKey} className="p-4 rounded-xl bg-cyan-50/50 border border-cyan-200/40 hover:border-orange/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-cyan-700 dark:text-white">{pr.label}</p>
                    {pr.verified ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 bg-gray-500/10 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3" /> Self-Reported
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gradient-orange">{pr.value} {pr.unit}</p>
                  <p className="text-xs text-cyan-700 dark:text-white mt-1">
                    {new Date(pr.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Velocity Chart (Legacy — from sessions.peak_velocity) */}
      {stats?.recentVelocities && stats.recentVelocities.length > 0 && (
        <div className="mb-6">
          <VelocityProgressChart
            data={stats.recentVelocities.map((v) => ({
              date: v.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              velocity: v.value,
              goal: 75,
            }))}
            currentVelocity={peakVelocity ?? undefined}
            goalVelocity={75}
          />
        </div>
      )}

      {/* Milestones */}
      {milestones.length > 0 && (
        <div className="command-panel">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Milestones</h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange via-orange/50 to-transparent" />
            <div className="space-y-6">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="relative flex items-start gap-6 pl-12">
                  <div
                    className={`absolute left-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      milestone.achieved
                        ? 'bg-orange border-orange shadow-glow-orange'
                        : 'bg-cyan-900 border-cyan-600/50'
                    }`}
                  >
                    {milestone.achieved && <Award className="w-4 h-4 text-white" />}
                  </div>
                  <div className={`flex-1 ${milestone.achieved ? '' : 'opacity-50'}`}>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{milestone.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-cyan-700 dark:text-white">
                      <span>{milestone.date}</span>
                      <span className="text-orange font-semibold">{milestone.value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {milestones.length === 0 && (
        <div className="command-panel text-center py-12">
          <Award className="w-12 h-12 text-cyan-700 dark:text-white mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Milestones Yet</h3>
          <p className="text-cyan-700 dark:text-white">Complete sessions and drills to start earning milestones!</p>
        </div>
      )}
    </div>
  )
}
