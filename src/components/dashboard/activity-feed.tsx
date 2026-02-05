'use client'

import { motion } from 'framer-motion'
import {
  CheckCircle,
  TrendingUp,
  Award,
  Calendar,
  Target,
  Zap,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Activity {
  id: string
  type: 'drill_completed' | 'velocity_recorded' | 'session_completed' | 'achievement' | 'goal_set'
  title: string
  description?: string
  timestamp: Date
  icon?: React.ElementType
  color?: string
}

interface ActivityFeedProps {
  activities?: Activity[]
  maxItems?: number
}

const defaultActivities: Activity[] = [
  {
    id: '1',
    type: 'drill_completed',
    title: 'Completed Long Toss Progression',
    description: 'Great work on arm strength!',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    icon: CheckCircle,
    color: '#10B981',
  },
  {
    id: '2',
    type: 'velocity_recorded',
    title: 'New Velocity Recorded',
    description: '78 MPH - New personal best!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    icon: Zap,
    color: '#FF4B2B',
  },
  {
    id: '3',
    type: 'session_completed',
    title: 'Training Session Completed',
    description: 'Mechanics & Power Training',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    icon: Calendar,
    color: '#3B82F6',
  },
  {
    id: '4',
    type: 'achievement',
    title: 'Achievement Unlocked!',
    description: '10 Drills Completed - Bronze Medal',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    icon: Award,
    color: '#F59E0B',
  },
  {
    id: '5',
    type: 'goal_set',
    title: 'New Goal Set',
    description: 'Target: 80 MPH by end of month',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    icon: Target,
    color: '#8B5CF6',
  },
]

export function ActivityFeed({ activities = defaultActivities, maxItems = 5 }: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems)

  return (
    <div className="space-y-4">
      {displayActivities.map((activity, index) => {
        const Icon = activity.icon || CheckCircle

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
          >
            {/* Icon */}
            <div
              className="p-2 rounded-lg flex-shrink-0"
              style={{
                backgroundColor: `${activity.color}20`,
                borderWidth: '1px',
                borderColor: `${activity.color}40`,
              }}
            >
              <Icon
                className="w-5 h-5"
                style={{ color: activity.color }}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white mb-1 group-hover:text-gradient-orange transition-all">
                {activity.title}
              </h4>
              {activity.description && (
                <p className="text-xs text-slate-400 mb-2">
                  {activity.description}
                </p>
              )}
              <p className="text-xs text-slate-500">
                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
              </p>
            </div>
          </motion.div>
        )
      })}

      {displayActivities.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-400">No recent activity</p>
          <p className="text-sm text-slate-500 mt-1">
            Complete drills and record velocities to see your activity here
          </p>
        </div>
      )}
    </div>
  )
}
