'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname, useSearchParams } from 'next/navigation'
import Image from 'next/image'

const LOGO_URL = 'https://roblogo.com/wp-content/uploads/2025/02/smp-icon-anim.gif'

// Timing thresholds
const SHOW_DELAY = 150 // Show loader if navigation takes longer than 150ms
const MIN_SHOW_TIME = 400 // If loader shows, keep it visible for at least 400ms
const MAX_SHOW_TIME = 4000 // Never show loader longer than 4 seconds

// Exit transition - fast snap
const exitTransition = {
  duration: 0.2,
  ease: 'easeOut',
}

export function FlashLoader() {
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const shownAtRef = useRef<number>(0)
  const isNavigatingRef = useRef(false)
  const lastPathnameRef = useRef(pathname)

  // Route change completed - hide loader
  useEffect(() => {
    // Only process if we were actually navigating
    if (isNavigatingRef.current && pathname !== lastPathnameRef.current) {
      // Clear all timers since navigation completed
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current)
        showTimerRef.current = null
      }
      if (maxTimerRef.current) {
        clearTimeout(maxTimerRef.current)
        maxTimerRef.current = null
      }

      // If loader is visible, ensure minimum show time
      if (isVisible && shownAtRef.current) {
        const elapsed = Date.now() - shownAtRef.current
        const remaining = MIN_SHOW_TIME - elapsed

        if (remaining > 0) {
          hideTimerRef.current = setTimeout(() => {
            setIsVisible(false)
            isNavigatingRef.current = false
          }, remaining)
        } else {
          setIsVisible(false)
          isNavigatingRef.current = false
        }
      } else {
        isNavigatingRef.current = false
      }
    }

    lastPathnameRef.current = pathname
  }, [pathname, searchParams, isVisible])

  // Listen for navigation start
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')

      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      // Only internal navigation (not external, not hash, not same page)
      const isInternal = href.startsWith('/') && !href.startsWith('//')
      const isSamePage = href === pathname || href.startsWith('#')

      if (isInternal && !isSamePage) {
        // Clear any existing timers
        if (showTimerRef.current) clearTimeout(showTimerRef.current)
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
        if (maxTimerRef.current) clearTimeout(maxTimerRef.current)

        isNavigatingRef.current = true

        // Delay showing loader - if page loads fast, we never show it
        showTimerRef.current = setTimeout(() => {
          if (isNavigatingRef.current) {
            shownAtRef.current = Date.now()
            setIsVisible(true)

            // Force hide after MAX_SHOW_TIME - never let loader get stuck
            maxTimerRef.current = setTimeout(() => {
              setIsVisible(false)
              isNavigatingRef.current = false
            }, MAX_SHOW_TIME)
          }
        }, SHOW_DELAY)
      }
    }

    // Use capture phase to catch clicks before Next.js processes them
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [pathname])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (showTimerRef.current) clearTimeout(showTimerRef.current)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      if (maxTimerRef.current) clearTimeout(maxTimerRef.current)
    }
  }, [])

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="flash-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={exitTransition}
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none backdrop-blur-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(26, 26, 46, 0.9) 50%, rgba(10, 10, 10, 0.95) 100%)',
          }}
          aria-hidden="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative"
            style={{ width: '140px', height: '140px' }}
          >
            {/* Soft glow behind hex */}
            <div
              className="absolute inset-0 blur-2xl opacity-60"
              style={{
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(236, 72, 153, 0.2) 50%, transparent 70%)',
                transform: 'scale(1.5)',
              }}
            />
            {/* Spinning hex border */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0"
              style={{
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.5) 0%, rgba(236, 72, 153, 0.3) 100%)',
              }}
            />
            {/* Static hex background */}
            <div
              className="absolute"
              style={{
                inset: '6px',
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                background: 'rgba(10, 10, 10, 0.9)',
              }}
            />
            {/* Static logo centered - clipped to hex */}
            <div
              className="absolute flex items-center justify-center overflow-hidden"
              style={{
                inset: '6px',
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              }}
            >
              <Image
                src={LOGO_URL}
                alt=""
                width={90}
                height={90}
                priority
                unoptimized
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
