'use client'

import { useEffect, useMemo, useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import { splitToChunks } from '@/lib/text/split-paragraphs'

interface ChunkedContentProps {
  text: string
  /** Max number of tiles to show. Defaults to 9 (3x3 grid). */
  maxChunks?: number
  /** Tailwind className applied to the wrapper */
  className?: string
  /** Tailwind className applied to the paragraph content */
  paragraphClassName?: string
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
const HINT_STORAGE_KEY = 'psp-chunked-hint-seen'

/**
 * Breaks long descriptive text into a 3×3 grid of lettered tiles.
 * Each tile reveals its chunk's content in a panel below when tapped.
 * Auto-detects headings ("The Setup:", "Phase 1:") via splitToChunks.
 *
 * If the text is short enough that it produces only 1 chunk, we just
 * render it inline — no tiles needed.
 */
export function ChunkedContent({
  text,
  maxChunks = 9,
  className = '',
  paragraphClassName = '',
}: ChunkedContentProps) {
  const chunks = useMemo(() => splitToChunks(text, maxChunks), [text, maxChunks])
  const [activeIdx, setActiveIdx] = useState(0)
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      if (!localStorage.getItem(HINT_STORAGE_KEY)) setShowHint(true)
    } catch {}
  }, [])

  const dismissHint = () => {
    setShowHint(false)
    try { localStorage.setItem(HINT_STORAGE_KEY, '1') } catch {}
  }

  if (!text?.trim()) return null

  // Short text → no tiles, just render it
  if (chunks.length <= 1) {
    return (
      <div className={className}>
        <p className={paragraphClassName}>{chunks[0]?.text || text}</p>
      </div>
    )
  }

  const active = chunks[Math.min(activeIdx, chunks.length - 1)]

  return (
    <div className={className}>
      {/* First-time hint */}
      {showHint && (
        <div className="mb-3 flex items-start gap-2 p-2.5 rounded-lg bg-orange/10 border border-orange/30 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-orange flex-shrink-0 mt-0.5" />
          <p className="flex-1 text-slate-700 dark:text-white/80 leading-snug">
            <span className="font-bold text-orange">Tap a tile</span> to read each part. We broke it up so it&apos;s easier to take in.
          </p>
          <button
            type="button"
            onClick={dismissHint}
            className="text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white p-0.5"
            aria-label="Dismiss hint"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tile grid — 3 cols, wraps to as many rows as needed (max 3) */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {chunks.map((chunk, i) => {
          const isActive = i === activeIdx
          return (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={`relative aspect-[5/3] rounded-xl border text-left p-2 transition-all overflow-hidden group ${
                isActive
                  ? 'bg-orange/15 border-orange/60 ring-1 ring-orange/40 shadow-md shadow-orange/10'
                  : 'bg-cyan-50 dark:bg-white/5 border-cyan-200/40 dark:border-white/10 hover:border-orange/40 hover:bg-orange/5'
              }`}
              aria-pressed={isActive}
              aria-label={`Section ${LETTERS[i]}: ${chunk.heading}`}
            >
              <div className="flex flex-col h-full">
                <span className={`text-lg font-black leading-none ${isActive ? 'text-orange' : 'text-cyan-700 dark:text-cyan-300'}`}>
                  {LETTERS[i]}
                </span>
                <span className={`mt-auto text-[10px] font-semibold leading-tight line-clamp-2 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-white/60'}`}>
                  {chunk.heading}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Active chunk content (re-mounted on idx change so transition fires) */}
      <div
        key={activeIdx}
        style={{ animation: 'fadeIn 200ms ease-out' }}
      >
        <p className={paragraphClassName}>{active.text}</p>
        {chunks.length > 1 && (
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-white/40">
            <span>
              Section <span className="font-bold text-orange">{LETTERS[activeIdx]}</span> of {chunks.length}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveIdx(i => Math.max(0, i - 1))}
                disabled={activeIdx === 0}
                className="px-2 py-1 rounded text-xs font-semibold text-slate-600 dark:text-white/60 hover:text-orange disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous section"
              >
                ← Prev
              </button>
              <button
                type="button"
                onClick={() => setActiveIdx(i => Math.min(chunks.length - 1, i + 1))}
                disabled={activeIdx === chunks.length - 1}
                className="px-2 py-1 rounded text-xs font-semibold text-slate-600 dark:text-white/60 hover:text-orange disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next section"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
