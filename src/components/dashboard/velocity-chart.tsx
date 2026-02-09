'use client'

import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { TrendingUp } from 'lucide-react'

interface VelocityDataPoint {
  date: string
  velocity: number
}

interface RawVelocityData {
  date: Date
  value: number
}

interface VelocityChartProps {
  velocityData?: RawVelocityData[]
  title?: string
}

// Sample data for demo - used only if no real data provided
const defaultData: VelocityDataPoint[] = [
  { date: 'Jan 15', velocity: 62 },
  { date: 'Jan 22', velocity: 64 },
  { date: 'Jan 29', velocity: 63 },
  { date: 'Feb 5', velocity: 66 },
  { date: 'Feb 12', velocity: 67 },
  { date: 'Feb 19', velocity: 69 },
  { date: 'Feb 26', velocity: 71 },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3">
        <p className="text-sm text-cyan-700 dark:text-white mb-1">{payload[0].payload.date}</p>
        <p className="text-lg font-bold text-gradient-orange">
          {payload[0].value} mph
        </p>
      </div>
    )
  }
  return null
}

export function VelocityChart({
  velocityData,
  title = 'Velocity Progress',
}: VelocityChartProps) {
  // Transform real data to chart format
  const data: VelocityDataPoint[] = velocityData && velocityData.length > 0
    ? velocityData.map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        velocity: d.value,
      }))
    : defaultData

  const latestVelocity = data[data.length - 1]?.velocity || 0
  const firstVelocity = data[0]?.velocity || 0
  const improvement = latestVelocity - firstVelocity
  const improvementPercent = firstVelocity > 0 ? ((improvement / firstVelocity) * 100).toFixed(1) : '0.0'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="command-panel col-span-full lg:col-span-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
          <p className="text-sm text-cyan-700 dark:text-white">
            {velocityData && velocityData.length > 0 ? `Last ${velocityData.length} sessions` : 'Sample data'}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-sm font-semibold text-green-400">
            +{improvementPercent}%
          </span>
        </div>
      </div>

      {/* Current Velocity Display */}
      <div className="mb-6">
        <div className="text-5xl font-bold text-gradient-velocity mb-2">
          {latestVelocity}
          <span className="text-2xl text-cyan-700 dark:text-white ml-2">mph</span>
        </div>
        <p className="text-sm text-cyan-700 dark:text-white">
          +{improvement} mph from your first session
        </p>
      </div>

      {/* Chart */}
      <div className="h-[300px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF4B2B" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#FF4B2B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="#4A5568"
              style={{ fontSize: '12px' }}
              tickLine={false}
            />
            <YAxis
              stroke="#4A5568"
              style={{ fontSize: '12px' }}
              tickLine={false}
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Area
              type="monotone"
              dataKey="velocity"
              stroke="#FF4B2B"
              strokeWidth={3}
              fill="url(#velocityGradient)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
