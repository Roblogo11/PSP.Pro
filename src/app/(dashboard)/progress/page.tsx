'use client'

import { TrendingUp, TrendingDown, Target, Zap, Activity, Award } from 'lucide-react'
import { VelocityProgressChart } from '@/components/dashboard/velocity-progress-chart'

export default function ProgressPage() {
  // Mock progress data
  const stats = [
    {
      label: 'Peak Velocity',
      value: '72 mph',
      change: +5.2,
      trend: 'up',
      icon: Zap,
    },
    {
      label: 'Avg Velocity',
      value: '68 mph',
      change: +3.8,
      trend: 'up',
      icon: Activity,
    },
    {
      label: 'Sessions Completed',
      value: '24',
      change: +12,
      trend: 'up',
      icon: Target,
    },
    {
      label: 'Achievements',
      value: '8',
      change: +2,
      trend: 'up',
      icon: Award,
    },
  ]

  const goals = [
    {
      id: 1,
      title: 'Hit 75 mph Peak Velocity',
      current: 72,
      target: 75,
      progress: 96,
      deadline: '2 weeks',
    },
    {
      id: 2,
      title: 'Complete 30 Sessions',
      current: 24,
      target: 30,
      progress: 80,
      deadline: '1 month',
    },
    {
      id: 3,
      title: 'Master 3 New Drills',
      current: 2,
      target: 3,
      progress: 67,
      deadline: '3 weeks',
    },
  ]

  const milestones = [
    {
      id: 1,
      title: 'First 70+ mph Throw',
      date: 'Jan 15, 2026',
      value: '71 mph',
      achieved: true,
    },
    {
      id: 2,
      title: '20 Session Streak',
      date: 'Jan 28, 2026',
      value: '20 sessions',
      achieved: true,
    },
    {
      id: 3,
      title: 'Velocity Increase: +5mph',
      date: 'Feb 1, 2026',
      value: '+5.2 mph',
      achieved: true,
    },
    {
      id: 4,
      title: 'Hit 75 mph Target',
      date: 'Feb 19, 2026',
      value: '75 mph',
      achieved: false,
    },
  ]

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
        {stats.map((stat) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown
          return (
            <div
              key={stat.label}
              className="command-panel hover:border-orange/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-orange/20 rounded-xl flex items-center justify-center group-hover:bg-orange/30 transition-colors">
                  <Icon className="w-6 h-6 text-orange" />
                </div>
                <div
                  className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                    stat.trend === 'up'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  <TrendIcon className="w-4 h-4" />
                  <span className="text-sm font-bold">
                    {stat.change > 0 ? '+' : ''}
                    {stat.change}%
                  </span>
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
        <VelocityProgressChart />
      </div>

      {/* Goals Section */}
      <div className="command-panel mb-6">
        <h2 className="text-2xl font-bold text-white mb-6">Active Goals</h2>
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="p-4 bg-cyan-900/20 rounded-xl">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-white">{goal.title}</h3>
                  <p className="text-sm text-cyan-700 dark:text-white">
                    {goal.current} / {goal.target} · {goal.deadline}
                  </p>
                </div>
                <span className="text-2xl font-bold text-orange">{goal.progress}%</span>
              </div>
              <div className="w-full bg-cyan-800/30/50 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-velocity transition-all duration-500"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
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
    </div>
  )
}
