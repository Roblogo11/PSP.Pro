'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Activity, Dumbbell, Target, Flame } from 'lucide-react'
import { VelocityChart } from '@/components/dashboard/velocity-chart'
import { NextSessionCard } from '@/components/dashboard/next-session-card'
import { StatCard } from '@/components/dashboard/stat-card'
import { ProgressRing } from '@/components/dashboard/progress-ring'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { AchievementBadges } from '@/components/dashboard/achievement-badges'
import { ReviewGameStats } from '@/components/dashboard/review-game-stats'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { useUserStats } from '@/lib/hooks/use-user-stats'
import { createClient } from '@/lib/supabase/client'

interface AssignedDrill {
  id: string
  title: string
  duration_seconds: number
  category: string | null
  thumbnail_url: string | null
  video_url: string
}

export default function AthleteLockerPage() {
  const router = useRouter()
  const { profile, loading: profileLoading } = useUserRole()
  const { stats, loading: statsLoading } = useUserStats(profile?.id)
  const [assignedDrills, setAssignedDrills] = useState<AssignedDrill[]>([])

  // Fetch assigned drills from Supabase
  useEffect(() => {
    if (!profile?.id) return

    async function fetchAssignedDrills() {
      const supabase = createClient()
      const { data } = await supabase
        .from('assigned_drills')
        .select(`
          drill:drill_id (id, title, duration_seconds, category, thumbnail_url, video_url)
        `)
        .eq('user_id', profile!.id)
        .order('created_at', { ascending: false })
        .limit(6)

      if (data) {
        const drills = data
          .map((d: any) => d.drill)
          .filter(Boolean) as AssignedDrill[]
        setAssignedDrills(drills)
      }
    }

    fetchAssignedDrills()
  }, [profile?.id])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!profileLoading && !profile) {
      router.push('/login')
    }
  }, [profileLoading, profile, router])

  // Loading state
  if (profileLoading || statsLoading || !profile) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cyan-700 dark:text-white">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const firstName = profile.full_name?.split(' ')[0] || 'Athlete'

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24 lg:pb-8 relative">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-2">
          Welcome back, <span className="text-gradient-orange">{firstName}</span>
        </h1>
        <p className="text-cyan-700 dark:text-white text-lg">
          Let&apos;s make today count. Here&apos;s your performance overview.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6">
        {/* Quick Stats - Top Row - NOW WITH REAL DATA */}
        <StatCard
          title="Total Sessions"
          value={stats?.totalSessions.toString() || '0'}
          subtitle="This season"
          icon={Activity}
          className="lg:col-span-1"
        />
        <StatCard
          title="Avg Velocity"
          value={stats?.avgVelocity ? `${stats.avgVelocity} mph` : 'No data'}
          subtitle="Last 10 sessions"
          icon={Target}
          className="lg:col-span-1"
        />
        <StatCard
          title="Drills Completed"
          value={stats?.totalDrills.toString() || '0'}
          subtitle="All time"
          icon={Dumbbell}
          className="lg:col-span-1"
        />
        <StatCard
          title="Current Streak"
          value={stats?.currentStreak ? `${stats.currentStreak} day${stats.currentStreak !== 1 ? 's' : ''}` : '0 days'}
          subtitle={stats?.currentStreak ? 'Keep it going!' : 'Start your streak!'}
          icon={Flame}
          className="lg:col-span-2"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 mb-6">
        {/* Velocity Chart - Takes 3 columns on desktop - NOW WITH REAL DATA */}
        <VelocityChart velocityData={stats?.recentVelocities || []} />

        {/* Next Session Card - Takes 2 columns on desktop - NOW WITH REAL DATA */}
        {stats?.nextSession ? (
          <NextSessionCard sessionDate={stats.nextSession} />
        ) : (
          <div className="command-panel col-span-full lg:col-span-2 flex flex-col items-center justify-center py-12">
            <p className="text-cyan-700 dark:text-white mb-4">No upcoming sessions</p>
            <Link href="/booking">
              <button className="btn-primary">Book a Session</button>
            </Link>
          </div>
        )}
      </div>

      {/* Progress & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Progress Rings */}
        <div className="command-panel">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Your Progress
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <ProgressRing
              progress={stats?.totalDrills ? Math.min(Math.round((stats.totalDrills / Math.max(stats.totalDrills + 5, 10)) * 100), 100) : 0}
              label="Drills Complete"
              value={`${stats?.totalDrills ?? 0}`}
              size={110}
            />
            <ProgressRing
              progress={stats?.avgVelocity ? Math.min(Math.round((stats.avgVelocity / 80) * 100), 100) : 0}
              label="Avg Velocity"
              value={stats?.avgVelocity ? `${stats.avgVelocity} MPH` : '--'}
              size={110}
              color="#10B981"
            />
          </div>
        </div>

        {/* Activity Feed */}
        <div className="command-panel lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Recent Activity
            </h2>
            <Link href="/sessions">
              <button className="text-sm text-cyan-700 dark:text-white hover:text-orange transition-colors">
                View All
              </button>
            </Link>
          </div>
          <ActivityFeed maxItems={4} />
        </div>
      </div>

      {/* Achievement Badges Section */}
      <div className="command-panel mb-6">
        <AchievementBadges />
      </div>

      {/* Review Game Stats */}
      <div className="mb-6">
        <ReviewGameStats />
      </div>

      {/* Assigned Drills Section */}
      <div className="command-panel">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              Assigned Drills
            </h2>
            <p className="text-sm text-cyan-700 dark:text-white">
              Complete these before your next session
            </p>
          </div>
          <Link href="/drills">
            <button className="btn-ghost">View All</button>
          </Link>
        </div>

        {/* Drill Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignedDrills.length > 0 ? (
            assignedDrills.map((drill) => (
              <Link key={drill.id} href={`/drills/${drill.id}`}>
                <div className="glass-card-hover group cursor-pointer overflow-hidden">
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-cyan-900 overflow-hidden">
                    {drill.thumbnail_url ? (
                      <img
                        src={drill.thumbnail_url}
                        alt={drill.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-900 to-orange/20">
                        <Dumbbell className="w-12 h-12 text-orange/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-transparent" />
                    {drill.category && (
                      <div className="absolute top-3 right-3 px-3 py-1 bg-orange/90 backdrop-blur-sm rounded-full text-xs font-semibold text-white">
                        {drill.category}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-orange transition-colors">
                      {drill.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-cyan-700 dark:text-white">
                      <span>{Math.round(drill.duration_seconds / 60)} min</span>
                      <span className="text-orange hover:text-orange-400 font-medium">
                        Start →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <Dumbbell className="w-10 h-10 text-cyan-700 dark:text-white mx-auto mb-3" />
              <p className="text-cyan-700 dark:text-white mb-2">No assigned drills yet</p>
              <Link href="/drills">
                <button className="btn-ghost text-sm">Browse Drill Bank</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
