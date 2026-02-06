'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Zap, Home, Video, Package, Globe, Rocket, Sparkles, Users } from 'lucide-react'
import { getFunnelNavigation, getTransitionDirection, getFunnelIndex } from '@/config/navigation'
import { useNavigation } from './nav-context'

// Step labels for the progress indicator - PSP.Pro Athletic Journey
const STEP_LABELS = ['Home', 'About', 'Pricing', 'Get Started', 'Contact']
const STEP_ICONS = [Home, Users, Package, Rocket, Sparkles]

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
      sessionStorage.setItem('shock-nav-history', 'true'); setIsFreshEntry(false)
    }
  }, [])

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
                {/* Home Button */}
                <button
                  onClick={() => {
                    setNavigationDirection(-1)
                    sessionStorage.setItem('shock-nav-history', 'true'); setIsFreshEntry(false)
                    router.push('/')
                  }}
                  className="group flex items-center gap-2 px-4 py-4 rounded-xl bg-dark-200/80 border border-secondary/10 hover:border-secondary/30 hover:bg-dark-200 transition-all duration-300 min-h-[48px]"
                >
                  <Home className="w-4 h-4 text-gray-400 group-hover:text-secondary transition-all" />
                  <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                    Home
                  </span>
                </button>

                {/* Get Started Button */}
                <button
                  onClick={() => {
                    setNavigationDirection(1)
                    sessionStorage.setItem('shock-nav-history', 'true'); setIsFreshEntry(false)
                    router.push('/get-started')
                  }}
                  className="group flex items-center gap-2 px-5 py-4 rounded-xl bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 shadow-lg shadow-secondary/30 hover:shadow-secondary/50 hover:scale-[1.02] transition-all duration-300 min-h-[48px]"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-sm font-semibold text-white">Get Started</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </>
    )
  }

  const handleNavigation = (path: string) => {
    const direction = getTransitionDirection(pathname, path)
    setNavigationDirection(direction)
    sessionStorage.setItem('shock-nav-history', 'true')
    setIsFreshEntry(false)
    router.push(path)
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
          <div className="max-w-5xl mx-auto px-4 py-3">
            {/* Progress Steps - Desktop */}
            <div className="hidden md:flex items-center justify-center gap-1 mb-3">
              {STEP_LABELS.map((label, index) => {
                const StepIcon = STEP_ICONS[index]
                const isActive = index === currentIndex
                const isCompleted = index < currentIndex

                return (
                  <div key={index} className="flex items-center">
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
                    {index < 4 && (
                      <div
                        className={`w-8 h-0.5 mx-1 transition-colors ${
                          isCompleted ? 'bg-secondary/50' : 'bg-dark-300'
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Mobile Progress Bar */}
            <div className="md:hidden mb-2">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>Step {currentIndex + 1} of 5</span>
                <span className="text-secondary">{STEP_LABELS[currentIndex]}</span>
              </div>
              <div className="h-1 bg-dark-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-secondary to-accent transition-all duration-500"
                  style={{ width: `${((currentIndex + 1) / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-3">
              {/* Back Button - Shows Home if fresh entry, otherwise prev page */}
              {prev ? (
                isFreshEntry ? (
                  // Fresh entry: Show Home button instead of Back
                  <button
                    onClick={() => {
                      setNavigationDirection(-1)
                      sessionStorage.setItem('shock-nav-history', 'true'); setIsFreshEntry(false)
                      router.push('/')
                    }}
                    className="group flex items-center gap-2 px-4 py-4 rounded-xl bg-dark-200/80 border border-secondary/10 hover:border-secondary/30 hover:bg-dark-200 transition-all duration-300 min-h-[48px]"
                  >
                    <Home className="w-4 h-4 text-gray-400 group-hover:text-secondary transition-all" />
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                      Home
                    </span>
                  </button>
                ) : (
                  // Has history: Show normal Back button
                  <button
                    onClick={() => handleNavigation(prev.path)}
                    className="group flex items-center gap-2 px-4 py-4 rounded-xl bg-dark-200/80 border border-secondary/10 hover:border-secondary/30 hover:bg-dark-200 transition-all duration-300 min-h-[48px]"
                  >
                    <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-secondary group-hover:-translate-x-0.5 transition-all" />
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors hidden sm:inline">
                      {prev.name}
                    </span>
                    <span className="text-sm font-medium text-gray-300 sm:hidden">Back</span>
                  </button>
                )
              ) : (
                <div className="w-20" />
              )}

              {/* Center: Current Step Hint (Mobile) */}
              <div className="flex-1 text-center md:hidden">
                <p className="text-xs text-gray-500">
                  {next ? `Next: ${next.name}` : 'Final Step'}
                </p>
              </div>

              {/* Next Step Button */}
              {next ? (
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
              ) : (
                <button
                  onClick={() => {
                    setNavigationDirection(1)
                    sessionStorage.setItem('shock-nav-history', 'true'); setIsFreshEntry(false)
                    router.push('/contact')
                  }}
                  className="group flex items-center gap-2 px-5 py-4 rounded-xl bg-gradient-to-r from-accent to-pink-500 hover:from-accent/90 hover:to-pink-500/90 shadow-lg shadow-accent/30 hover:shadow-accent/50 hover:scale-[1.02] transition-all duration-300 min-h-[48px]"
                >
                  <Zap className="w-4 h-4 text-white" />
                  <span className="text-sm font-semibold text-white">Let's Talk</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
