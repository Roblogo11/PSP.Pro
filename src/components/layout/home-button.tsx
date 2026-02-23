'use client'

import Link from 'next/link'
import { Home } from 'lucide-react'

/**
 * Small fixed home button — top-right of every dashboard page.
 * Links back to the public marketing home page (/).
 * Uses currentColor so it adapts automatically to light/dark theme via Tailwind.
 */
export function HomeButton() {
  return (
    <Link
      href="/"
      aria-label="Go to home page"
      className="fixed top-3 right-3 z-[105] flex items-center justify-center w-9 h-9 rounded-xl
        bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm
        border border-slate-200 dark:border-white/10
        text-slate-500 dark:text-slate-400
        hover:text-orange hover:dark:text-orange hover:border-orange/40
        shadow-sm hover:shadow-md hover:shadow-orange/10
        transition-all duration-200 active:scale-95"
    >
      <Home className="w-4 h-4" />
    </Link>
  )
}
