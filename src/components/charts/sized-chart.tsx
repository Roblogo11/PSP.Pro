'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'

interface SizedChartProps {
  children: (width: number, height: number) => ReactNode
  className?: string
  /** Min width below which we treat the parent as unready */
  minWidth?: number
  /** Min height below which we treat the parent as unready */
  minHeight?: number
}

/**
 * Wraps recharts (or any chart) and only mounts it after the parent has
 * real measured dimensions. Avoids the `width(-1) height(-1)` warning
 * recharts emits when ResponsiveContainer measures pre-layout.
 */
export function SizedChart({
  children,
  className,
  minWidth = 10,
  minHeight = 10,
}: SizedChartProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const update = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width >= minWidth && rect.height >= minHeight) {
        setSize(prev => {
          if (prev && Math.abs(prev.w - rect.width) < 1 && Math.abs(prev.h - rect.height) < 1) {
            return prev
          }
          return { w: rect.width, h: rect.height }
        })
      }
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [minWidth, minHeight])

  return (
    <div ref={ref} className={className} style={{ width: '100%', height: '100%' }}>
      {size ? children(size.w, size.h) : null}
    </div>
  )
}
