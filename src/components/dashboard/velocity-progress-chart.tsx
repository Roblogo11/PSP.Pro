'use client'

import { useMemo } from 'react'
import { TrendingUp, Calendar } from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from 'recharts'

interface ChartDataPoint {
  date: string
  [key: string]: number | string | boolean | undefined
}

interface MetricLine {
  key: string
  label: string
  color: string
  unit: string
}

interface MultiMetricChartProps {
  data: ChartDataPoint[]
  metrics: MetricLine[]
  goalValue?: number
  goalLabel?: string
  title?: string
  subtitle?: string
  className?: string
}

// Legacy single-metric interface for backward compatibility
interface VelocityData {
  date: string
  velocity: number
  goal?: number
}

interface VelocityProgressChartProps {
  data?: VelocityData[]
  currentVelocity?: number
  goalVelocity?: number
  className?: string
}

const CHART_COLORS = ['#00B4D8', '#FF4B2B', '#22C55E', '#F59E0B', '#A855F7']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-white/10 rounded-lg p-3 shadow-lg">
        <p className="text-white text-sm font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-white/70">{entry.name}:</span>
            <span className="font-semibold" style={{ color: entry.color }}>{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function MultiMetricChart({
  data,
  metrics,
  goalValue,
  goalLabel,
  title = 'Performance Trends',
  subtitle = 'Track your metrics over time',
  className = '',
}: MultiMetricChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`command-panel ${className}`}>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-cyan-700 dark:text-white text-sm mb-6">{subtitle}</p>
        <div className="flex items-center justify-center h-48 text-cyan-700 dark:text-white">
          No data recorded yet. Metrics will appear here after your coach logs them.
        </div>
      </div>
    )
  }

  return (
    <div className={`command-panel ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan" />
            {title}
          </h3>
          <p className="text-sm text-cyan-700 dark:text-white">{subtitle}</p>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {goalValue && (
              <ReferenceLine
                y={goalValue}
                stroke="#FF4B2B"
                strokeDasharray="6 4"
                label={{ value: goalLabel || `Goal: ${goalValue}`, fill: '#FF4B2B', fontSize: 11, position: 'right' }}
              />
            )}
            {metrics.map((metric, i) => (
              <Line
                key={metric.key}
                type="monotone"
                dataKey={metric.key}
                name={metric.label}
                stroke={metric.color || CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={2.5}
                dot={{ fill: metric.color || CHART_COLORS[i % CHART_COLORS.length], r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-cyan-200/40 flex items-center justify-between text-xs text-cyan-800 dark:text-white">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{data.length} data points</span>
        </div>
      </div>
    </div>
  )
}

// Legacy VelocityProgressChart — wraps MultiMetricChart for backward compat
const DEFAULT_DATA: VelocityData[] = [
  { date: 'Week 1', velocity: 68, goal: 75 },
  { date: 'Week 2', velocity: 69, goal: 75 },
  { date: 'Week 3', velocity: 71, goal: 75 },
  { date: 'Week 4', velocity: 70, goal: 75 },
  { date: 'Week 5', velocity: 72, goal: 75 },
  { date: 'Week 6', velocity: 73, goal: 75 },
  { date: 'Week 7', velocity: 74, goal: 75 },
  { date: 'Week 8', velocity: 75, goal: 75 },
]

export function VelocityProgressChart({
  data = DEFAULT_DATA,
  currentVelocity = 75,
  goalVelocity = 75,
  className = '',
}: VelocityProgressChartProps) {
  const chartData = useMemo(() =>
    data.map(d => ({ date: d.date, velocity: d.velocity })),
    [data]
  )

  const improvement = data.length > 0 ? currentVelocity - data[0].velocity : 0

  return (
    <div className={`command-panel ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan" />
            Velocity Progress
          </h3>
          <p className="text-sm text-cyan-700 dark:text-white">Track your throwing velocity over time</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-2xl font-bold text-green-400">+{improvement} MPH</span>
          </div>
          <p className="text-xs text-cyan-700 dark:text-white">Total Improvement</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-cyan-50/50 border border-cyan-200/40">
          <p className="text-xs text-cyan-700 dark:text-white mb-1">Current</p>
          <p className="text-2xl font-bold text-cyan">{currentVelocity} MPH</p>
        </div>
        <div className="p-4 rounded-xl bg-cyan-50/50 border border-cyan-200/40">
          <p className="text-xs text-cyan-700 dark:text-white mb-1">Goal</p>
          <p className="text-2xl font-bold text-orange">{goalVelocity} MPH</p>
        </div>
        <div className="p-4 rounded-xl bg-cyan-50/50 border border-cyan-200/40">
          <p className="text-xs text-cyan-700 dark:text-white mb-1">Progress</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {goalVelocity > 0 ? Math.round((currentVelocity / goalVelocity) * 100) : 100}%
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={goalVelocity}
              stroke="#FF4B2B"
              strokeDasharray="6 4"
              label={{ value: `Goal: ${goalVelocity} MPH`, fill: '#FF4B2B', fontSize: 11, position: 'right' }}
            />
            <Line
              type="monotone"
              dataKey="velocity"
              name="Velocity (MPH)"
              stroke="url(#velocityGrad)"
              strokeWidth={3}
              dot={{ fill: '#00B4D8', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <defs>
              <linearGradient id="velocityGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00B4D8" />
                <stop offset="100%" stopColor="#FF4B2B" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-gradient-to-r from-cyan to-orange rounded" />
          <span className="text-cyan-700 dark:text-white">Velocity</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 border-t-2 border-dashed border-orange" />
          <span className="text-cyan-700 dark:text-white">Goal</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-cyan-200/40 flex items-center text-xs text-cyan-800 dark:text-white">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{data.length} sessions tracked</span>
        </div>
      </div>
    </div>
  )
}
