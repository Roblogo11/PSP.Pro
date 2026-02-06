'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname, useSearchParams } from 'next/navigation'
import Image from 'next/image'

const LOGO_PATH = '/images/PSP-black-300x99-1.png'

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
            className="relative flex flex-col items-center"
          >
            {/* Soft glow behind logo */}
            <div
              className="absolute inset-0 blur-3xl opacity-60"
              style={{
                background: 'radial-gradient(circle, rgba(255, 87, 34, 0.5) 0%, rgba(0, 180, 216, 0.3) 50%, transparent 70%)',
                transform: 'scale(2)',
              }}
            />

            {/* Spinning circular border rings */}
            <div className="relative" style={{ width: '120px', height: '120px' }}>
              {/* Outer rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full"
                style={{
                  border: '3px solid transparent',
                  borderTopColor: 'rgba(255, 87, 34, 0.8)',
                  borderRightColor: 'rgba(255, 87, 34, 0.4)',
                }}
              />
              {/* Middle counter-rotating ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-2 rounded-full"
                style={{
                  border: '2px solid transparent',
                  borderTopColor: 'rgba(0, 180, 216, 0.6)',
                  borderLeftColor: 'rgba(0, 180, 216, 0.3)',
                }}
              />

              {/* Center circle with logo */}
              <div
                className="absolute inset-4 rounded-full flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 1) 100%)',
                  boxShadow: '0 0 30px rgba(255, 87, 34, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.5)',
                }}
              >
                <Image
                  src={LOGO_PATH}
                  alt="PSP.Pro"
                  width={80}
                  height={26}
                  priority
                  className="brightness-0 invert opacity-90"
                />
              </div>
            </div>

            {/* Loading text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="mt-6 text-sm font-semibold tracking-wider uppercase"
              style={{
                color: '#FF5722',
                textShadow: '0 0 10px rgba(255, 87, 34, 0.5)',
              }}
            >
              Loading...
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
