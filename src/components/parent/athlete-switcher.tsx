'use client'

import { useState } from 'react'
import { ChevronDown, Check, Users } from 'lucide-react'
import type { ChildProfile } from '@/lib/hooks/use-active-child'

interface Props {
  /** Named `athletes`, not `children` — React reserves `children` for nested JSX. */
  athletes: ChildProfile[]
  activeChild: ChildProfile | null
  onSwitch: (childId: string) => Promise<boolean> | void
  /** Hidden entirely for single-athlete accounts. */
  show: boolean
}

/**
 * Compact athlete switcher for parent/guardian accounts with more than one child.
 *
 * Placed at the top of any page showing athlete-specific data, so a parent can
 * see WHICH child's numbers they're looking at — previously the only switcher
 * was buried in Settings and didn't affect progress data at all.
 */
export function AthleteSwitcher({ athletes, activeChild, onSwitch, show }: Props) {
  const [open, setOpen] = useState(false)
  const [switching, setSwitching] = useState(false)

  if (!show || athletes.length < 2) return null

  const handlePick = async (id: string) => {
    if (id === activeChild?.id) { setOpen(false); return }
    setSwitching(true)
    await onSwitch(id)
    setSwitching(false)
    setOpen(false)
  }

  return (
    <div className="relative mb-6">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={switching}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full sm:w-auto flex items-center justify-between gap-3 min-h-[48px] px-4 py-2.5 rounded-2xl glass-card border border-cyan-200/40 dark:border-white/10 disabled:opacity-60"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-xl bg-orange/20 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-orange" />
          </span>
          <span className="flex flex-col items-start min-w-0">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-none">
              Viewing
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {activeChild?.child_name || 'Select athlete'}
            </span>
          </span>
        </span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <ul
            role="listbox"
            className="absolute z-50 mt-2 w-full sm:w-72 rounded-2xl bg-white dark:bg-slate-900 border border-cyan-200/40 dark:border-white/10 shadow-xl overflow-hidden"
          >
            {athletes.map(child => {
              const isActive = child.id === activeChild?.id
              return (
                <li key={child.id} role="option" aria-selected={isActive}>
                  <button
                    onClick={() => handlePick(child.id)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 min-h-[48px] text-left transition-colors ${
                      isActive ? 'bg-orange/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <span className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {child.child_name}
                      </span>
                      {child.child_age != null && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Age {child.child_age}
                        </span>
                      )}
                    </span>
                    {isActive && <Check className="w-4 h-4 text-orange shrink-0" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
