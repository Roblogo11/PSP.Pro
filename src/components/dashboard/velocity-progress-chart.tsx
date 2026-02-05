'use client'

import { LineChart, TrendingUp, Calendar } from 'lucide-react'

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

// Mock data for demonstration
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
  const maxValue = Math.max(...data.map(d => Math.max(d.velocity, d.goal || 0))) + 5
  const minValue = Math.min(...data.map(d => d.velocity)) - 5
  const range = maxValue - minValue

  const improvement = data.length > 0 ? currentVelocity - data[0].velocity : 0
  const percentToGoal = goalVelocity > 0 ? Math.round((currentVelocity / goalVelocity) * 100) : 100

  const getYPosition = (value: number) => {
    return ((maxValue - value) / range) * 100
  }

  return (
    <div className={`command-panel ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-cyan" />
            Velocity Progress
          </h3>
          <p className="text-sm text-slate-400">Track your throwing velocity over time</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-2xl font-bold text-green-400">+{improvement} MPH</span>
          </div>
          <p className="text-xs text-slate-400">Total Improvement</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs text-slate-400 mb-1">Current</p>
          <p className="text-2xl font-bold text-cyan">{currentVelocity} MPH</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs text-slate-400 mb-1">Goal</p>
          <p className="text-2xl font-bold text-orange">{goalVelocity} MPH</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs text-slate-400 mb-1">Progress</p>
          <p className="text-2xl font-bold text-white">{percentToGoal}%</p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64 mb-4">
        {/* Grid Lines */}
        <div className="absolute inset-0">
          {[0, 25, 50, 75, 100].map(percent => (
            <div
              key={percent}
              className="absolute w-full border-t border-white/5"
              style={{ top: `${percent}%` }}
            >
              <span className="absolute -left-10 -translate-y-1/2 text-xs text-slate-500">
                {Math.round(maxValue - (range * percent) / 100)}
              </span>
            </div>
          ))}
        </div>

        {/* Goal Line */}
        {goalVelocity && (
          <div
            className="absolute w-full border-t-2 border-dashed border-orange/50"
            style={{ top: `${getYPosition(goalVelocity)}%` }}
          >
            <span className="absolute right-0 -translate-y-1/2 px-2 py-1 bg-orange/20 text-orange text-xs font-semibold rounded">
              Goal: {goalVelocity} MPH
            </span>
          </div>
        )}

        {/* Line Chart */}
        <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
          {/* Velocity Line */}
          <polyline
            points={data
              .map((point, i) => {
                const x = (i / (data.length - 1)) * 100
                const y = getYPosition(point.velocity)
                return `${x}%,${y}%`
              })
              .join(' ')}
            fill="none"
            stroke="url(#velocityGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {data.map((point, i) => {
            const x = (i / (data.length - 1)) * 100
            const y = getYPosition(point.velocity)
            return (
              <g key={i}>
                <circle
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="4"
                  fill="#00B4D8"
                  stroke="#0088AB"
                  strokeWidth="2"
                  className="hover:r-6 transition-all cursor-pointer"
                />
              </g>
            )
          })}

          {/* Gradient */}
          <defs>
            <linearGradient id="velocityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00B4D8" />
              <stop offset="50%" stopColor="#33D9FF" />
              <stop offset="100%" stopColor="#FF4B2B" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* X-Axis Labels */}
      <div className="flex justify-between text-xs text-slate-400 px-2">
        {data.map((point, i) => {
          if (i % 2 === 0 || i === data.length - 1) {
            return <span key={i}>{point.date}</span>
          }
          return null
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-gradient-to-r from-cyan to-orange rounded" />
          <span className="text-slate-400">Velocity</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 border-t-2 border-dashed border-orange" />
          <span className="text-slate-400">Goal</span>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>Last updated: Today</span>
        </div>
        <button className="text-cyan hover:text-cyan-400 font-semibold">View All Sessions</button>
      </div>
    </div>
  )
}
