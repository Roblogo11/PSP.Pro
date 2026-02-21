'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    positive: boolean
  }
  className?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className = '',
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`command-panel !p-4 sm:!p-5 md:!p-6 group hover:border-orange/30 hover:shadow-glow-orange transition-all duration-300 ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="stat-label mb-1 sm:mb-2">{title}</p>
          <h3 className="stat-value mb-0.5 sm:mb-1">{value}</h3>
          {subtitle && (
            <p className="text-xs sm:text-sm text-cyan-700 dark:text-white truncate">{subtitle}</p>
          )}
        </div>

        <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-orange/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-orange/30 transition-colors">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-orange" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium ${
                trend.positive ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-cyan-700 dark:text-white">vs last week</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}
