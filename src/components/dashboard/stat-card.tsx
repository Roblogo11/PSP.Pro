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
      className={`command-panel group hover:border-orange/30 hover:shadow-glow-orange transition-all duration-300 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="stat-label mb-2">{title}</p>
          <h3 className="stat-value mb-1">{value}</h3>
          {subtitle && (
            <p className="text-sm text-cyan-700 dark:text-white">{subtitle}</p>
          )}
        </div>

        <div className="w-12 h-12 bg-orange/20 rounded-xl flex items-center justify-center group-hover:bg-orange/30 transition-colors">
          <Icon className="w-6 h-6 text-orange" />
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
