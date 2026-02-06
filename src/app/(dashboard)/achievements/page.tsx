'use client'

import { useState, useEffect } from 'react'
import { AchievementBadge } from '@/components/ui/achievement-badge'
import {
  Zap,
  Target,
  Trophy,
  Flame,
  TrendingUp,
  Award,
  Star,
  Clock,
  Calendar
} from 'lucide-react'

interface Achievement {
  id: string
  icon: any
  title: string
  description: string
  progress: number
  maxProgress: number
  color: 'orange' | 'cyan' | 'green' | 'purple'
  unlocked?: boolean
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'velocity-milestone',
      icon: Zap,
      title: 'Velocity Milestone',
      description: 'Gain +5 MPH on your fastball',
      progress: 3,
      maxProgress: 5,
      color: 'orange',
    },
    {
      id: 'streak-master',
      icon: Flame,
      title: 'Streak Master',
      description: 'Complete 7 days in a row',
      progress: 5,
      maxProgress: 7,
      color: 'cyan',
    },
    {
      id: 'drill-complete',
      icon: Target,
      title: 'Drill Collector',
      description: 'Complete 50 training drills',
      progress: 42,
      maxProgress: 50,
      color: 'green',
    },
    {
      id: 'perfect-form',
      icon: Award,
      title: 'Perfect Form',
      description: 'Achieve perfect mechanics rating',
      progress: 0,
      maxProgress: 1,
      color: 'purple',
    },
    {
      id: 'speed-demon',
      icon: TrendingUp,
      title: 'Speed Demon',
      description: 'Reach 80 MPH velocity',
      progress: 72,
      maxProgress: 80,
      color: 'orange',
    },
    {
      id: 'dedicated',
      icon: Clock,
      title: 'Dedicated Athlete',
      description: 'Log 100 hours of training',
      progress: 67,
      maxProgress: 100,
      color: 'cyan',
    },
    {
      id: 'champion',
      icon: Trophy,
      title: 'Champion',
      description: 'Win your league championship',
      progress: 0,
      maxProgress: 1,
      color: 'green',
      unlocked: false,
    },
    {
      id: 'all-star',
      icon: Star,
      title: 'All-Star',
      description: 'Make the all-star team',
      progress: 1,
      maxProgress: 1,
      color: 'purple',
      unlocked: true,
    },
    {
      id: 'consistent',
      icon: Calendar,
      title: 'Consistent Performer',
      description: 'Train 4 times per week for a month',
      progress: 12,
      maxProgress: 16,
      color: 'orange',
    },
  ])

  const unlockedCount = achievements.filter(a =>
    a.unlocked || a.progress >= a.maxProgress
  ).length

  const totalPoints = achievements.reduce((sum, a) =>
    sum + (a.unlocked || a.progress >= a.maxProgress ? a.maxProgress * 10 : 0), 0
  )

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">
          Your <span className="text-gradient-orange">Achievements</span>
        </h1>
        <p className="text-lg text-cyan-700 dark:text-white">
          Track your progress and unlock rewards
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="command-panel p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-orange/10 rounded-xl">
              <Trophy className="w-8 h-8 text-orange" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white mb-1">
                {unlockedCount}/{achievements.length}
              </p>
              <p className="text-sm text-cyan-700 dark:text-white">Achievements Unlocked</p>
            </div>
          </div>
        </div>

        <div className="command-panel p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-cyan/10 rounded-xl">
              <Star className="w-8 h-8 text-cyan" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white mb-1">{totalPoints}</p>
              <p className="text-sm text-cyan-700 dark:text-white">Total Points Earned</p>
            </div>
          </div>
        </div>

        <div className="command-panel p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-400/10 rounded-xl">
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white mb-1">
                {Math.round((unlockedCount / achievements.length) * 100)}%
              </p>
              <p className="text-sm text-cyan-700 dark:text-white">Completion Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            icon={achievement.icon}
            title={achievement.title}
            description={achievement.description}
            progress={achievement.progress}
            maxProgress={achievement.maxProgress}
            color={achievement.color}
            unlocked={achievement.unlocked}
          />
        ))}
      </div>

      {/* Motivation Section */}
      {unlockedCount < achievements.length && (
        <div className="mt-12 command-panel p-8 text-center border-cyan/20">
          <Zap className="w-12 h-12 text-cyan mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Keep Pushing!</h3>
          <p className="text-cyan-700 dark:text-white max-w-2xl mx-auto">
            You're making great progress! Complete drills, maintain your training streak, and
            improve your velocity to unlock more achievements.
          </p>
        </div>
      )}
    </div>
  )
}
