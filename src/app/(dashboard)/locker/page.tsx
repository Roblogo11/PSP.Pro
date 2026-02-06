'use client'

import Link from 'next/link'
import { Activity, Dumbbell, Target, Flame } from 'lucide-react'
import { VelocityChart } from '@/components/dashboard/velocity-chart'
import { NextSessionCard } from '@/components/dashboard/next-session-card'
import { StatCard } from '@/components/dashboard/stat-card'
import { ProgressRing } from '@/components/dashboard/progress-ring'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { AchievementBadges } from '@/components/dashboard/achievement-badges'

// Mock data - Replace with real Supabase queries
const upcomingSession = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now

export default function AthleteLockerPage() {
  return (
    <div className="min-h-screen p-4 md:p-8 pb-24 lg:pb-8 relative">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
          Welcome back, <span className="text-gradient-orange">Athlete</span>
        </h1>
        <p className="text-slate-400 text-lg">
          Let's make today count. Here's your performance overview.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6">
        {/* Quick Stats - Top Row */}
        <StatCard
          title="Total Sessions"
          value="24"
          subtitle="This season"
          icon={Activity}
          trend={{ value: 12, positive: true }}
          className="lg:col-span-1"
        />
        <StatCard
          title="Avg Velocity"
          value="68 mph"
          subtitle="Last 7 sessions"
          icon={Target}
          trend={{ value: 5.2, positive: true }}
          className="lg:col-span-1"
        />
        <StatCard
          title="Drills Completed"
          value="156"
          subtitle="All time"
          icon={Dumbbell}
          className="lg:col-span-1"
        />
        <StatCard
          title="Current Streak"
          value="7 days"
          subtitle="Keep it going!"
          icon={Flame}
          className="lg:col-span-2"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 mb-6">
        {/* Velocity Chart - Takes 3 columns on desktop */}
        <VelocityChart />

        {/* Next Session Card - Takes 2 columns on desktop */}
        <NextSessionCard sessionDate={upcomingSession} />
      </div>

      {/* Progress & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Progress Rings */}
        <div className="command-panel">
          <h2 className="text-xl font-bold text-white mb-6">
            Your Progress
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <ProgressRing
              progress={72}
              label="Drills Complete"
              value="18/25"
              size={110}
            />
            <ProgressRing
              progress={85}
              label="Goal Progress"
              value="68 MPH"
              size={110}
              color="#10B981"
            />
          </div>
        </div>

        {/* Activity Feed */}
        <div className="command-panel lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              Recent Activity
            </h2>
            <Link href="/sessions">
              <button className="text-sm text-slate-400 hover:text-orange transition-colors">
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

      {/* Assigned Drills Section */}
      <div className="command-panel">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Assigned Drills
            </h2>
            <p className="text-sm text-slate-400">
              Complete these before your next session
            </p>
          </div>
          <Link href="/drills">
            <button className="btn-ghost">View All</button>
          </Link>
        </div>

        {/* Drill Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              id: 1,
              title: 'Rotational Power',
              duration: '12 min',
              tag: 'Mechanics',
              thumbnail: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop',
            },
            {
              id: 2,
              title: 'Sprint Mechanics',
              duration: '8 min',
              tag: 'Speed',
              thumbnail: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&auto=format&fit=crop',
            },
            {
              id: 3,
              title: 'Recovery Protocol',
              duration: '15 min',
              tag: 'Recovery',
              thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop',
            },
          ].map((drill, index) => (
            <div
              key={drill.id}
              className="glass-card-hover group cursor-pointer overflow-hidden"
            >
              {/* Thumbnail */}
              <div className="relative h-48 bg-slate-800 overflow-hidden">
                <img
                  src={drill.thumbnail}
                  alt={drill.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-transparent" />
                <div className="absolute top-3 right-3 px-3 py-1 bg-orange/90 backdrop-blur-sm rounded-full text-xs font-semibold text-white">
                  {drill.tag}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange transition-colors">
                  {drill.title}
                </h3>
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>{drill.duration}</span>
                  <button className="text-orange hover:text-orange-400 font-medium">
                    Start →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
