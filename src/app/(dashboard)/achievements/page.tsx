'use client'

import { AchievementBadge } from '@/components/ui/achievement-badge'
import {
  Zap,
  Target,
  Trophy,
  Flame,
  TrendingUp,
  Star,
  Clock,
  Calendar,
  ClipboardCheck,
} from 'lucide-react'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { useUserStats } from '@/lib/hooks/use-user-stats'
import { useUserSessions } from '@/lib/hooks/use-user-sessions'

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
  const { profile, loading: profileLoading } = useUserRole()
  const { stats, loading: statsLoading } = useUserStats(profile?.id)
  const { sessions, loading: sessionsLoading } = useUserSessions(profile?.id)

  const loading = profileLoading || statsLoading || sessionsLoading

  if (loading) {
    return (
      <div className="min-h-screen px-3 py-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cyan-700 dark:text-white">Loading achievements...</p>
        </div>
      </div>
    )
  }

  // Calculate real values
  const completedSessions = stats?.totalSessions ?? 0
  const completedDrills = stats?.totalDrills ?? 0
  const completedQuizzes = stats?.totalQuizzes ?? 0
  const currentStreak = stats?.currentStreak ?? 0
  const peakVelocity = stats?.recentVelocities?.length
    ? Math.max(...stats.recentVelocities.map(v => v.value))
    : 0

  // Build achievements from real data
  const achievements: Achievement[] = [
    {
      id: 'first-session',
      icon: Calendar,
      title: 'First Session',
      description: 'Complete your first training session',
      progress: Math.min(completedSessions, 1),
      maxProgress: 1,
      color: 'orange',
      unlocked: completedSessions >= 1,
    },
    {
      id: 'drill-starter',
      icon: Target,
      title: 'Drill Starter',
      description: 'Complete 10 training drills',
      progress: Math.min(completedDrills, 10),
      maxProgress: 10,
      color: 'green',
    },
    {
      id: 'drill-collector',
      icon: Target,
      title: 'Drill Collector',
      description: 'Complete 50 training drills',
      progress: Math.min(completedDrills, 50),
      maxProgress: 50,
      color: 'green',
    },
    {
      id: 'streak-3',
      icon: Flame,
      title: 'On Fire',
      description: 'Maintain a 3-day training streak',
      progress: Math.min(currentStreak, 3),
      maxProgress: 3,
      color: 'cyan',
    },
    {
      id: 'streak-7',
      icon: Flame,
      title: 'Streak Master',
      description: 'Maintain a 7-day training streak',
      progress: Math.min(currentStreak, 7),
      maxProgress: 7,
      color: 'cyan',
    },
    {
      id: 'sessions-5',
      icon: Clock,
      title: 'Getting Started',
      description: 'Complete 5 training sessions',
      progress: Math.min(completedSessions, 5),
      maxProgress: 5,
      color: 'purple',
    },
    {
      id: 'sessions-25',
      icon: Clock,
      title: 'Dedicated Athlete',
      description: 'Complete 25 training sessions',
      progress: Math.min(completedSessions, 25),
      maxProgress: 25,
      color: 'purple',
    },
    {
      id: 'velocity-60',
      icon: Zap,
      title: 'Velocity: 60 mph',
      description: 'Reach 60 MPH peak velocity',
      progress: Math.min(peakVelocity, 60),
      maxProgress: 60,
      color: 'orange',
      unlocked: peakVelocity >= 60,
    },
    {
      id: 'velocity-70',
      icon: Zap,
      title: 'Velocity: 70 mph',
      description: 'Reach 70 MPH peak velocity',
      progress: Math.min(peakVelocity, 70),
      maxProgress: 70,
      color: 'orange',
      unlocked: peakVelocity >= 70,
    },
    // Pop Quiz badges
    {
      id: 'quiz-beginner',
      icon: ClipboardCheck,
      title: 'Quiz Beginner',
      description: 'Complete your first pop quiz',
      progress: Math.min(completedQuizzes, 1),
      maxProgress: 1,
      color: 'green',
      unlocked: completedQuizzes >= 1,
    },
    {
      id: 'quiz-bronze',
      icon: ClipboardCheck,
      title: 'Quiz Bronze',
      description: 'Complete 5 pop quizzes',
      progress: Math.min(completedQuizzes, 5),
      maxProgress: 5,
      color: 'orange',
      unlocked: completedQuizzes >= 5,
    },
    {
      id: 'quiz-silver',
      icon: ClipboardCheck,
      title: 'Quiz Silver',
      description: 'Complete 10 pop quizzes',
      progress: Math.min(completedQuizzes, 10),
      maxProgress: 10,
      color: 'cyan',
      unlocked: completedQuizzes >= 10,
    },
    {
      id: 'quiz-gold',
      icon: ClipboardCheck,
      title: 'Quiz Gold',
      description: 'Complete 20 pop quizzes',
      progress: Math.min(completedQuizzes, 20),
      maxProgress: 20,
      color: 'orange',
      unlocked: completedQuizzes >= 20,
    },
  ]

  const unlockedCount = achievements.filter(a =>
    a.unlocked || a.progress >= a.maxProgress
  ).length

  const totalPoints = achievements.reduce((sum, a) =>
    sum + (a.unlocked || a.progress >= a.maxProgress ? a.maxProgress * 10 : 0), 0
  )

  return (
    <div className="min-h-screen px-3 py-4 md:p-8 pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-3">
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
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
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
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{totalPoints}</p>
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
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                {achievements.length > 0 ? Math.round((unlockedCount / achievements.length) * 100) : 0}%
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
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Keep Pushing!</h3>
          <p className="text-cyan-700 dark:text-white max-w-2xl mx-auto">
            You're making great progress! Complete drills, ace pop quizzes, maintain your training streak, and
            improve your velocity to unlock more achievements.
          </p>
        </div>
      )}
    </div>
  )
}
