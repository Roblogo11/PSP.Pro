'use client'

import { TrendingUp, TrendingDown, Target, Zap, Activity, Award } from 'lucide-react'
import { VelocityProgressChart } from '@/components/dashboard/velocity-progress-chart'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { useUserStats } from '@/lib/hooks/use-user-stats'
import { useUserSessions } from '@/lib/hooks/use-user-sessions'

export default function ProgressPage() {
  const { profile, loading: profileLoading } = useUserRole()
  const { stats, loading: statsLoading } = useUserStats(profile?.id)
  const { sessions, loading: sessionsLoading } = useUserSessions(profile?.id)

  const loading = profileLoading || statsLoading || sessionsLoading

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
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
    {
      label: 'Peak Velocity',
      value: peakVelocity ? `${peakVelocity} mph` : '--',
      icon: Zap,
    },
    {
      label: 'Avg Velocity',
      value: avgVelocity ? `${avgVelocity} mph` : '--',
      icon: Activity,
    },
    {
      label: 'Sessions Completed',
      value: `${completedSessions}`,
      icon: Target,
    },
    {
      label: 'Drills Completed',
      value: `${completedDrills}`,
      icon: Award,
    },
  ]

  // Calculate milestones from real session data
  const completedSessionsList = sessions
    .filter(s => s.status === 'completed')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const milestones: Array<{
    id: number
    title: string
    date: string
    value: string
    achieved: boolean
  }> = []

  // First session milestone
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

  // Peak velocity milestone
  if (peakVelocity) {
    milestones.push({
      id: 2,
      title: `Peak Velocity: ${peakVelocity} mph`,
      date: 'Personal Best',
      value: `${peakVelocity} mph`,
      achieved: true,
    })
  }

  // Session count milestones
  const sessionThresholds = [5, 10, 25, 50, 100]
  for (const threshold of sessionThresholds) {
    milestones.push({
      id: 10 + threshold,
      title: `${threshold} Sessions Completed`,
      date: completedSessions >= threshold ? 'Achieved' : `${threshold - completedSessions} more to go`,
      value: `${Math.min(completedSessions, threshold)}/${threshold}`,
      achieved: completedSessions >= threshold,
    })
    if (completedSessions < threshold) break // Only show next unachieved
  }

  // Drill milestones
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

  // Streak milestone
  if (stats?.currentStreak && stats.currentStreak >= 3) {
    milestones.push({
      id: 200,
      title: `${stats.currentStreak}-Day Training Streak`,
      date: 'Current Streak',
      value: `${stats.currentStreak} days`,
      achieved: true,
    })
  }

  // Sort: achieved first, then unachieved
  milestones.sort((a, b) => (b.achieved ? 1 : 0) - (a.achieved ? 1 : 0))

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24 lg:pb-8 relative">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
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
            <div
              key={stat.label}
              className="command-panel hover:border-orange/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-orange/20 rounded-xl flex items-center justify-center group-hover:bg-orange/30 transition-colors">
                  <Icon className="w-6 h-6 text-orange" />
                </div>
              </div>
              <p className="text-sm text-cyan-700 dark:text-white mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
            </div>
          )
        })}
      </div>

      {/* Velocity Chart */}
      <div className="mb-6">
        <VelocityProgressChart
          data={stats?.recentVelocities?.length ? stats.recentVelocities.map((v, i) => ({
            date: v.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            velocity: v.value,
            goal: 75,
          })) : undefined}
          currentVelocity={peakVelocity ?? undefined}
          goalVelocity={75}
        />
      </div>

      {/* Milestones */}
      {milestones.length > 0 && (
        <div className="command-panel">
          <h2 className="text-2xl font-bold text-white mb-6">Milestones</h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange via-orange/50 to-transparent" />

            {/* Milestone items */}
            <div className="space-y-6">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="relative flex items-start gap-6 pl-12">
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      milestone.achieved
                        ? 'bg-orange border-orange shadow-glow-orange'
                        : 'bg-cyan-900 border-cyan-600/50'
                    }`}
                  >
                    {milestone.achieved && <Award className="w-4 h-4 text-white" />}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 ${milestone.achieved ? '' : 'opacity-50'}`}>
                    <h3 className="text-lg font-bold text-white mb-1">{milestone.title}</h3>
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
          <h3 className="text-xl font-bold text-white mb-2">No Milestones Yet</h3>
          <p className="text-cyan-700 dark:text-white">Complete sessions and drills to start earning milestones!</p>
        </div>
      )}
    </div>
  )
}
