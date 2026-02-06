'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/contexts/theme-context'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center h-10 w-20 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange/50 focus:ring-offset-2 focus:ring-offset-slate-900 dark:focus:ring-offset-slate-900"
      style={{
        background: theme === 'dark'
          ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
          : 'linear-gradient(135deg, #fff5f0 0%, #ffe8dc 100%)',
        boxShadow: theme === 'dark'
          ? '0 2px 8px rgba(251, 146, 60, 0.15), inset 0 1px 3px rgba(0, 0, 0, 0.2)'
          : '0 2px 8px rgba(251, 146, 60, 0.2), inset 0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Toggle Circle */}
      <span
        className="inline-flex items-center justify-center h-8 w-8 rounded-full transition-all duration-300 transform"
        style={{
          background: theme === 'dark'
            ? 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)'
            : 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
          boxShadow: theme === 'dark'
            ? '0 2px 8px rgba(251, 146, 60, 0.4), 0 0 20px rgba(251, 146, 60, 0.2)'
            : '0 2px 8px rgba(251, 146, 60, 0.4), 0 0 20px rgba(251, 146, 60, 0.15)',
          transform: theme === 'dark' ? 'translateX(2.5rem)' : 'translateX(0.25rem)',
        }}
      >
        {theme === 'dark' ? (
          <Moon className="w-4 h-4 text-white" />
        ) : (
          <Sun className="w-4 h-4 text-white" />
        )}
      </span>

      {/* Background Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <Sun
          className={`w-4 h-4 transition-opacity duration-300 ${
            theme === 'light' ? 'opacity-0' : 'opacity-30'
          }`}
          style={{ color: theme === 'dark' ? '#64748b' : '#fb923c' }}
        />
        <Moon
          className={`w-4 h-4 transition-opacity duration-300 ${
            theme === 'dark' ? 'opacity-0' : 'opacity-30'
          }`}
          style={{ color: theme === 'light' ? '#94a3b8' : '#fb923c' }}
        />
      </div>
    </button>
  )
}
