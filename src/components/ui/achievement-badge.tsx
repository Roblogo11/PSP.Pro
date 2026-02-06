'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

export interface AchievementBadgeProps {
  icon: LucideIcon
  title: string
  description: string
  progress: number
  maxProgress: number
  color: 'orange' | 'cyan' | 'green' | 'purple'
  unlocked?: boolean
}

const colorStyles = {
  orange: {
    bg: 'from-orange to-orange-600',
    glow: 'shadow-glow-orange',
    border: 'border-orange/50',
    text: 'text-orange',
    progressBg: 'bg-orange/20',
    progressBar: 'bg-orange',
  },
  cyan: {
    bg: 'from-cyan to-cyan-600',
    glow: 'shadow-glow-cyan',
    border: 'border-cyan/50',
    text: 'text-cyan',
    progressBg: 'bg-cyan/20',
    progressBar: 'bg-cyan',
  },
  green: {
    bg: 'from-green-400 to-green-600',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.5)]',
    border: 'border-green-400/50',
    text: 'text-green-400',
    progressBg: 'bg-green-400/20',
    progressBar: 'bg-green-400',
  },
  purple: {
    bg: 'from-purple-400 to-purple-600',
    glow: 'shadow-[0_0_20px_rgba(139,92,246,0.5)]',
    border: 'border-purple-400/50',
    text: 'text-purple-400',
    progressBg: 'bg-purple-400/20',
    progressBar: 'bg-purple-400',
  },
}

export function AchievementBadge({
  icon: Icon,
  title,
  description,
  progress,
  maxProgress,
  color,
  unlocked = false,
}: AchievementBadgeProps) {
  const styles = colorStyles[color]
  const progressPercent = Math.min((progress / maxProgress) * 100, 100)
  const isComplete = progress >= maxProgress

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`glass-card p-6 relative overflow-hidden ${
        isComplete || unlocked ? `border-2 ${styles.border} ${styles.glow}` : ''
      }`}
    >
      {/* Badge Icon */}
      <div className="relative mb-4">
        <div
          className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
            isComplete || unlocked
              ? `bg-gradient-to-br ${styles.bg} ${styles.glow}`
              : 'bg-slate-800/50'
          }`}
        >
          <Icon
            className={`w-10 h-10 ${
              isComplete || unlocked ? 'text-white' : 'text-slate-600'
            }`}
          />
        </div>

        {/* Unlock Animation */}
        {(isComplete || unlocked) && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            className="absolute -top-1 -right-1 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 text-white"
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
          </motion.div>
        )}
      </div>

      {/* Title */}
      <h3
        className={`text-lg font-bold text-center mb-2 ${
          isComplete || unlocked ? styles.text : 'text-slate-400'
        }`}
      >
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-400 text-center mb-4">{description}</p>

      {/* Progress Bar */}
      {!unlocked && (
        <div>
          <div className={`w-full h-2 ${styles.progressBg} rounded-full overflow-hidden mb-2`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full ${styles.progressBar} rounded-full`}
            />
          </div>
          <p className="text-xs text-center text-slate-400">
            {progress} / {maxProgress}
          </p>
        </div>
      )}

      {/* Locked Overlay */}
      {!isComplete && !unlocked && progress === 0 && (
        <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px] flex items-center justify-center">
          <div className="text-center">
            <svg
              className="w-8 h-8 text-slate-600 mx-auto mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <p className="text-xs text-slate-600 font-semibold">Locked</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
