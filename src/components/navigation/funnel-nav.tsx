'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Zap, Home, Video, Package, Globe, Rocket, Sparkles, Users } from 'lucide-react'
import { getFunnelNavigation, getTransitionDirection, getFunnelIndex } from '@/config/navigation'
import { useNavigation } from './nav-context'
import { ThemeToggle } from '@/components/ui/theme-toggle'

// Step labels for the progress indicator - PSP.Pro Athletic Journey
const STEP_LABELS = ['Home', 'Pricing', 'Join the Team', 'Contact']
const STEP_ICONS = [Home, Package, Rocket, Sparkles]
// Map step indices to funnel indices (About is at index 1, so we skip it)
const STEP_TO_FUNNEL_INDEX = [0, 2, 3, 4] // Home=0, Pricing=2, GetStarted=3, Contact=4

interface FunnelNavProps {
  className?: string
}

export function FunnelNav({ className = '' }: FunnelNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { setNavigationDirection } = useNavigation()
  const { prev, next, isInFunnel } = getFunnelNavigation(pathname)
  const currentIndex = getFunnelIndex(pathname)

  // Track if user landed directly on this page (no internal navigation history)
  // Use sessionStorage to persist across client-side navigation
  const [isFreshEntry, setIsFreshEntry] = useState(() => {
    if (typeof window === 'undefined') return true
    return sessionStorage.getItem('shock-nav-history') !== 'true'
  })

  useEffect(() => {
    // Only check on initial mount, not on every pathname change
    const hasNavigatedInternally = sessionStorage.getItem('shock-nav-history') === 'true'
    if (hasNavigatedInternally) {
      sessionStorage.setItem('shock-nav-history', 'true')
      setIsFreshEntry(false)
    }
  }, [])

  const handleNavigation = (path: string) => {
    const direction = getTransitionDirection(pathname, path)
    setNavigationDirection(direction)
    sessionStorage.setItem('shock-nav-history', 'true')
    setIsFreshEntry(false)
    router.push(path)
  }

  // For spoke pages (outside funnel), show simplified nav with Home + Get Started
  if (!isInFunnel) {
    return (
      <>
        <div className="h-20" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4, type: 'spring', stiffness: 300, damping: 30 }}
          className={`fixed bottom-0 left-0 right-0 z-50 ${className}`}
        >
          <div className="bg-dark-100/95 backdrop-blur-xl border-t border-secondary/20 shadow-2xl shadow-black/50">
            <div className="max-w-5xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                {/* Theme Toggle + Home Button */}
                <div className="flex items-center gap-3">
                  <div className="px-2">
                    <ThemeToggle />
                  </div>
                  <button
                    onClick={() => {
                      setNavigationDirection(-1)
                      sessionStorage.setItem('shock-nav-history', 'true')
                      setIsFreshEntry(false)
                      router.push('/')
                    }}
                    className="group flex items-center gap-2 px-4 py-4 rounded-xl bg-dark-200/80 border border-secondary/10 hover:border-secondary/30 hover:bg-dark-200 transition-all duration-300 min-h-[48px]"
                  >
                    <Home className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-secondary transition-all" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-white transition-colors">
                      Home
                    </span>
                  </button>
                </div>

                {/* Get Started Button */}
                <button
                  onClick={() => {
                    setNavigationDirection(1)
                    sessionStorage.setItem('shock-nav-history', 'true')
                    setIsFreshEntry(false)
                    router.push('/get-started')
                  }}
                  className="group flex items-center gap-2 px-5 py-4 rounded-xl bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 shadow-lg shadow-secondary/30 hover:shadow-secondary/50 hover:scale-[1.02] transition-all duration-300 min-h-[48px]"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-sm font-semibold text-white">Join the Team</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </>
    )
  }

  return (
    <>
      {/* Spacer to prevent content from being hidden behind sticky nav */}
      <div className="h-24 md:h-20" />

      {/* Sticky Navigation Bar */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4, type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed bottom-0 left-0 right-0 z-50 ${className}`}
      >
        {/* Glass backdrop */}
        <div className="bg-dark-100/95 backdrop-blur-xl border-t border-secondary/20 shadow-2xl shadow-black/50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            {/* Progress Steps - Desktop */}
            <div className="hidden md:flex items-center justify-between gap-2">
              {/* Theme Toggle - Left Side */}
              <div className="flex-shrink-0">
                <ThemeToggle />
              </div>

              {/* Progress Bar - Center */}
              <div className="flex items-center justify-center gap-2 flex-1">
                {STEP_LABELS.map((label, index) => {
                  const StepIcon = STEP_ICONS[index]
                  const funnelIndex = STEP_TO_FUNNEL_INDEX[index]
                  const isActive = funnelIndex === currentIndex
                  const isCompleted = funnelIndex < currentIndex
                  const isHome = index === 0

                  return (
                    <div key={index} className="flex items-center">
                      {isHome ? (
                        <button
                          onClick={() => handleNavigation('/')}
                          className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 cursor-pointer hover:scale-110 ${
                            isActive
                              ? 'bg-gradient-to-r from-secondary/30 to-accent/30 text-white border border-secondary/40 shadow-lg shadow-secondary/30'
                              : 'bg-secondary/15 text-secondary border border-secondary/20 hover:bg-secondary/25 hover:border-secondary/40 hover:shadow-lg hover:shadow-secondary/20'
                          }`}
                        >
                          {/* Glow effect */}
                          <div className="absolute inset-0 rounded-full bg-secondary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                          <StepIcon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'animate-pulse' : ''}`} />
                          <span className="text-xs font-semibold">{label}</span>
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                            <div className="bg-dark-200 border border-secondary/30 px-3 py-1.5 rounded-lg shadow-xl">
                              <p className="text-xs font-medium text-white">Back to Home</p>
                            </div>
                          </div>
                        </button>
                      ) : (
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
                            isActive
                              ? 'bg-secondary/20 text-secondary'
                              : isCompleted
                                ? 'text-secondary/60'
                                : 'text-gray-500'
                          }`}
                        >
                          <StepIcon className={`w-3.5 h-3.5 ${isActive ? 'animate-pulse' : ''}`} />
                          <span className="text-xs font-medium">{label}</span>
                        </div>
                      )}
                      {index < 3 && (
                        <div
                          className={`w-8 h-0.5 mx-1 transition-colors ${
                            isCompleted ? 'bg-secondary/50' : 'bg-dark-300'
                          }`}
                        />
                      )}
                    </div>
                  )
                })}

                {/* Next Step Button - Positioned at end of progress bar */}
                {next && (
                  <div className="flex items-center">
                    <div className="w-8 h-0.5 mx-1 bg-dark-300" />
                    <button
                      onClick={() => handleNavigation(next.path)}
                      className="group flex items-center gap-2 px-5 py-4 rounded-xl bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 shadow-lg shadow-secondary/30 hover:shadow-secondary/50 hover:scale-[1.02] transition-all duration-300 min-h-[48px]"
                    >
                      <span className="text-sm font-semibold text-white hidden sm:inline">
                        {next.name}
                      </span>
                      <span className="text-sm font-semibold text-white sm:hidden">Next</span>
                      <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <ThemeToggle />
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Step {currentIndex + 1} of 5
                  </div>
                </div>
                <span className="text-xs text-secondary">
                  {pathname === '/about' ? 'About' : STEP_LABELS[STEP_TO_FUNNEL_INDEX.indexOf(currentIndex)]}
                </span>
              </div>
              <div className="h-1 bg-dark-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-secondary to-accent transition-all duration-500"
                  style={{ width: `${((currentIndex + 1) / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
