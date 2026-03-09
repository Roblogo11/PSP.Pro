'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Saves and restores window scroll position per route using sessionStorage.
 * Prevents "death scrolling" when navigating back to a previously visited page.
 */
export function ScrollRestoration() {
  const pathname = usePathname()
  const prevPathname = useRef<string | null>(null)

  useEffect(() => {
    // Save scroll position of the page we're leaving
    if (prevPathname.current && prevPathname.current !== pathname) {
      sessionStorage.setItem(
        `scroll:${prevPathname.current}`,
        String(window.scrollY)
      )
    }

    // Restore scroll position for the page we're arriving at
    const saved = sessionStorage.getItem(`scroll:${pathname}`)
    if (saved) {
      // Use requestAnimationFrame to wait for paint before restoring
      const y = parseInt(saved, 10)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: y, behavior: 'instant' })
        })
      })
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }

    prevPathname.current = pathname
  }, [pathname])

  return null
}
