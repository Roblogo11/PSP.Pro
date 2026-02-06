'use client'

import { useState } from 'react'
import { HelpCircle } from 'lucide-react'

interface TooltipProps {
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function Tooltip({ content, position = 'top', className = '' }: TooltipProps) {
  const [show, setShow] = useState(false)

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="text-slate-400 hover:text-orange transition-colors"
        aria-label="Help"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {show && (
        <div
          className={`absolute z-50 ${positionClasses[position]} w-64 px-3 py-2 text-sm text-white bg-slate-800 border border-slate-700 rounded-lg shadow-xl pointer-events-none`}
        >
          <div className="relative">
            {content}
          </div>
        </div>
      )}
    </div>
  )
}

interface InfoBannerProps {
  title: string
  description: string
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'orange' | 'purple'
}

export function InfoBanner({ title, description, icon, color = 'blue' }: InfoBannerProps) {
  const colorClasses = {
    blue: 'bg-cyan/10 border-cyan/20 text-cyan',
    green: 'bg-green-500/10 border-green-500/20 text-green-400',
    orange: 'bg-orange/10 border-orange/20 text-orange',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  }

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
      <div className="flex items-start gap-3">
        {icon && <div className="mt-0.5">{icon}</div>}
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{title}</h4>
          <p className="text-sm text-slate-300">{description}</p>
        </div>
      </div>
    </div>
  )
}
