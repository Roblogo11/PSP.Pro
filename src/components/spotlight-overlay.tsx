'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface SpotlightOverlayProps {
  targetRect: DOMRect | null
  padding?: number
  show: boolean
  onBackdropClick?: () => void
}

export function SpotlightOverlay({
  targetRect,
  padding = 10,
  show,
  onBackdropClick,
}: SpotlightOverlayProps) {
  // Rect with padding
  const r = targetRect
    ? {
        x: targetRect.x - padding,
        y: targetRect.y - padding,
        w: targetRect.width + padding * 2,
        h: targetRect.height + padding * 2,
        rx: 14, // rounded corners
      }
    : null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="spotlight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[115] pointer-events-none"
          style={{ isolation: 'isolate' }}
        >
          {/* SVG overlay — dark mask with cutout */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ display: 'block' }}
          >
            <defs>
              <mask id="spotlight-mask">
                {/* White = visible (dark), black = transparent (the cutout) */}
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {r && (
                  <rect
                    x={r.x}
                    y={r.y}
                    width={r.w}
                    height={r.h}
                    rx={r.rx}
                    fill="black"
                  />
                )}
              </mask>
            </defs>

            {/* Dark overlay with hole */}
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="rgba(0,0,0,0.72)"
              mask="url(#spotlight-mask)"
            />
          </svg>

          {/* Backdrop — pointer-events-none so highlighted element (z-116) stays clickable */}
          <div
            className="absolute inset-0 pointer-events-none"
            onClick={onBackdropClick}
          />

          {/* Glow ring around target */}
          {r && (
            <motion.div
              key={`glow-${r.x}-${r.y}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="absolute pointer-events-none"
              style={{
                left: r.x - 3,
                top: r.y - 3,
                width: r.w + 6,
                height: r.h + 6,
                borderRadius: r.rx + 3,
                boxShadow: '0 0 0 2px rgba(251,146,60,0.9), 0 0 20px 4px rgba(251,146,60,0.4), 0 0 40px 8px rgba(251,146,60,0.15)',
                border: '2px solid rgba(251,146,60,0.8)',
              }}
            />
          )}

          {/* Pulse ring */}
          {r && (
            <motion.div
              key={`pulse-${r.x}-${r.y}`}
              initial={{ opacity: 0.6, scale: 1 }}
              animate={{ opacity: 0, scale: 1.08 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
              className="absolute pointer-events-none"
              style={{
                left: r.x - 3,
                top: r.y - 3,
                width: r.w + 6,
                height: r.h + 6,
                borderRadius: r.rx + 3,
                border: '2px solid rgba(251,146,60,0.6)',
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
