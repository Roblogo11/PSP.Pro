'use client'

import { motion } from 'framer-motion'
import {
  Trophy,
  Target,
  Zap,
  Award,
  Medal,
  Star,
  Flame,
  Crown,
} from 'lucide-react'

interface Badge {
  id: string
  name: string
  description: string
  icon: React.ElementType
  earned: boolean
  progress?: number // 0-100
  color: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface AchievementBadgesProps {
  badges?: Badge[]
}

const defaultBadges: Badge[] = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Complete your first drill',
    icon: Target,
    earned: true,
    color: '#10B981',
    rarity: 'common',
  },
  {
    id: '2',
    name: 'Velocity Hunter',
    description: 'Record 10 velocity measurements',
    icon: Zap,
    earned: true,
    progress: 100,
    color: '#FF4B2B',
    rarity: 'rare',
  },
  {
    id: '3',
    name: 'Dedicated Athlete',
    description: 'Complete 25 drills',
    icon: Trophy,
    earned: false,
    progress: 72,
    color: '#F59E0B',
    rarity: 'epic',
  },
  {
    id: '4',
    name: 'Speed Demon',
    description: 'Reach 80 MPH velocity',
    icon: Flame,
    earned: false,
    progress: 85,
    color: '#EF4444',
    rarity: 'epic',
  },
  {
    id: '5',
    name: 'Century Club',
    description: 'Complete 100 drills',
    icon: Medal,
    earned: false,
    progress: 23,
    color: '#8B5CF6',
    rarity: 'legendary',
  },
  {
    id: '6',
    name: 'Elite Performance',
    description: 'Reach 90 MPH velocity',
    icon: Crown,
    earned: false,
    progress: 42,
    color: '#FFD700',
    rarity: 'legendary',
  },
]

const rarityStyles = {
  common: 'border-slate-600',
  rare: 'border-blue-500',
  epic: 'border-purple-500',
  legendary: 'border-orange-500 shadow-glow-orange',
}

export function AchievementBadges({ badges = defaultBadges }: AchievementBadgesProps) {
  const earnedCount = badges.filter((b) => b.earned).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-display font-bold text-white">
            Achievements
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {earnedCount} of {badges.length} earned
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gradient-orange">
            {Math.round((earnedCount / badges.length) * 100)}%
          </div>
          <p className="text-xs text-slate-400">Complete</p>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {badges.map((badge, index) => {
          const Icon = badge.icon

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                badge.earned
                  ? `${rarityStyles[badge.rarity]} bg-white/10 hover:bg-white/15`
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              } ${badge.earned ? 'cursor-pointer' : 'cursor-default'}`}
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center transition-all ${
                  badge.earned
                    ? 'bg-gradient-velocity shadow-glow-orange'
                    : 'bg-white/5'
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${
                    badge.earned ? 'text-white' : 'text-slate-600'
                  }`}
                />
              </div>

              {/* Name */}
              <h4
                className={`text-sm font-semibold text-center mb-1 ${
                  badge.earned ? 'text-white' : 'text-slate-500'
                }`}
              >
                {badge.name}
              </h4>

              {/* Description */}
              <p
                className={`text-xs text-center ${
                  badge.earned ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                {badge.description}
              </p>

              {/* Progress Bar (for unearned badges) */}
              {!badge.earned && badge.progress !== undefined && (
                <div className="mt-3">
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${badge.progress}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full bg-gradient-velocity rounded-full"
                    />
                  </div>
                  <p className="text-xs text-slate-500 text-center mt-1">
                    {badge.progress}%
                  </p>
                </div>
              )}

              {/* Earned Checkmark */}
              {badge.earned && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
