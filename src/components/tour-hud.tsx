'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, ChevronLeft, Zap, SkipForward,
  LayoutDashboard, Calendar, TrendingUp, Dumbbell, Settings, Clock,
} from 'lucide-react'
import { isTourActive, markPageVisited } from '@/lib/tour/track'
import { SpotlightOverlay } from '@/components/spotlight-overlay'

// ─── Types ───────────────────────────────────────────────────
interface TourStep {
  title: string
  message: string
  highlight?: string      // CSS selector to spotlight (optional)
  navigateTo?: string     // auto-navigate after this step
  action?: string         // label for the primary action button
}

interface PageTour {
  pageTitle: string
  icon: React.ElementType
  color: string
  steps: TourStep[]
}

// ─── Tour Scripts ─────────────────────────────────────────────
const PAGE_TOURS: Record<string, PageTour> = {
  '/locker': {
    pageTitle: 'Your Athlete Locker',
    icon: LayoutDashboard,
    color: 'text-orange',
    steps: [
      {
        title: 'Welcome to Your Locker! 🏠',
        message: "Ayyyy, you made it! 🔥 This is YOUR home base. Every time you log in, this is where you land. Let me walk you through what's here!",
      },
      {
        title: 'Your Stats At a Glance 📊',
        message: "See those cards up top? That's your real-time report card! Total sessions, velocity, drills completed, and your training streak. Tap to explore!",
        highlight: 'locker-stats',
      },
      {
        title: 'Your Velocity Chart ⚡',
        message: "This chart is your PROOF. Every session your coach logs your velocity — and this line goes UP. That's your progress, plotted! 📈",
        highlight: 'locker-chart',
      },
      {
        title: 'Assigned Drills 🏋️',
        message: "Scroll down to your assigned drills — videos your coach handpicked for YOU. Watch, rep it, mark it complete. That's how you level up between sessions! 🎥✅",
        highlight: 'locker-drills',
      },
      {
        title: 'Locker Tour Complete! 🎉',
        message: "LETSSS GOOO! 🏆 You know your Locker now. Next stop — Book your first session so we can get to WORK!",
        navigateTo: '/booking',
        action: 'Book a Session',
      },
    ],
  },

  '/booking': {
    pageTitle: 'Book a Session',
    icon: Clock,
    color: 'text-blue-400',
    steps: [
      {
        title: "Let's Book Your First Session! 🎯",
        message: "It's time to put some work on the calendar! Booking is 4 steps — Service → Date → Time → Confirm. Watch those steps light up as you go!",
        highlight: 'booking-steps',
      },
      {
        title: 'Step 1: Pick Your Training Type 🥎',
        message: "See those service cards? Choose 1-on-1, group, specialty — whatever fits your goals. Each card shows price, duration, and what you're getting. TAP a card to pick and move to the next step!",
        highlight: 'booking-service',
      },
      {
        title: 'Step 2: Choose Your Date 📆',
        message: "A calendar loads after you pick a service. Tap any open date — your coach's available slots will appear for that day. Go ahead and pick one!",
        highlight: 'booking-steps',
      },
      {
        title: 'Step 3: Grab Your Time Slot ⏰',
        message: "After choosing a date, time slots appear. You'll see coach name, location, and how many spots are left. Tap your slot to move to the final step!",
        highlight: 'booking-steps',
      },
      {
        title: 'Step 4: Confirm & Pay 💳',
        message: "Review everything — service, date, time, price. Got a promo code? Drop it in! Elite members get 10% off automatically. Choose Pay Online or Pay at Location, then lock it in!",
        highlight: 'booking-steps',
      },
      {
        title: 'Booking Tour Complete! 🙌',
        message: "FACTS! Now you know how to book like a pro! Try it for real — this is tour mode so it cleans up after. Next up: check your Sessions page!",
        navigateTo: '/sessions',
        action: 'View My Sessions',
      },
    ],
  },

  '/sessions': {
    pageTitle: 'My Sessions',
    icon: Calendar,
    color: 'text-purple-400',
    steps: [
      {
        title: 'Your Session History HQ 📋',
        message: "This is where ALL your sessions live — upcoming, completed, the whole archive! Every booking you make shows up right here.",
      },
      {
        title: 'Filter Your Sessions 🔍',
        message: "See those tabs — All, Upcoming, Past! Tap Upcoming to see sessions on deck, Past for your training history. TAP a tab to switch the view!",
        highlight: 'sessions-filters',
      },
      {
        title: 'Your Session Cards 📋',
        message: "Each card shows coach, date, time, status, and coach feedback after sessions. Your whole training story in one scroll!",
        highlight: 'sessions-list',
      },
      {
        title: 'RSVP to Upcoming Sessions ✅',
        message: "On upcoming sessions you'll see Going / Maybe / Can't Go buttons — your coach sees your RSVP in real-time. Tap Upcoming in the filter to find them, then let your coach know you're showing up!",
        highlight: 'sessions-filters',
      },
      {
        title: 'Sync to Your Calendar 📲',
        message: "See that Sync Calendar button up top? Tap it to copy a live subscribe link — drop it in Google Cal, Apple Cal, or Outlook and your sessions auto-update every time you book or cancel!",
        highlight: 'sessions-sync',
      },
      {
        title: 'Sessions Tour Done! 🎊',
        message: "You're a sessions pro now! Next up — your Progress page. This is where the NUMBERS tell your story!",
        navigateTo: '/progress',
        action: 'View My Progress',
      },
    ],
  },

  '/progress': {
    pageTitle: 'Progress Tracking',
    icon: TrendingUp,
    color: 'text-green-400',
    steps: [
      {
        title: 'Your Trophy Case 🏆',
        message: "This page is PROOF that you put in work! Your performance data, personal records, and improvement charts all live here.",
      },
      {
        title: 'Your Key Stats 📊',
        message: "These 4 cards are your headline numbers! Peak velocity, sessions completed, drills done — they update after EVERY session your coach logs!",
        highlight: 'progress-stats',
      },
      {
        title: 'Sport-Specific Tabs 🥎🏀⚽',
        message: "Tap a sport tab to see YOUR metrics! Softball = exit velo + bat speed. Basketball = 3-point % + verticals. 15 metrics per sport tracked!",
        highlight: 'progress-sport-tabs',
      },
      {
        title: 'Multi-Metric Chart 📈',
        message: "This chart tracks multiple metrics over time! Watch all your stats trend up as you put in sessions. Screenshot worthy fr!",
        highlight: 'progress-chart',
      },
      {
        title: 'Personal Records 🥇',
        message: "YOUR personal bests! Every metric you've hit — date, value, and whether it's PSP Verified (by your coach) or Self-Reported. Legit stats only!",
        highlight: 'progress-records',
      },
      {
        title: 'Milestones Timeline 🎯',
        message: "Scroll down to your Milestones! Orange = ACHIEVED, gray = coming up. First session, velocity PRs, drill streaks — unlock them all!",
        highlight: 'progress-milestones',
      },
      {
        title: 'Progress Tour Done! 🚀',
        message: "You're BUILT DIFFERENT for checking your progress like this! Now let's hit the Drills page — your coach-assigned training videos are waiting!",
        navigateTo: '/drills',
        action: 'View My Drills',
      },
    ],
  },

  '/drills': {
    pageTitle: 'Training Drills',
    icon: Dumbbell,
    color: 'text-cyan-400',
    steps: [
      {
        title: 'Your Drill Library 🎥',
        message: "WELCOME to your training video library! Every drill your coach assigns lives here. Watch, rep it, mark it complete — that's the formula between sessions!",
      },
      {
        title: 'Your Progress Stats 📊',
        message: "These cards show your drill totals, completion rate, and hours trained. The more you complete, the higher these numbers climb!",
        highlight: 'drills-stats',
      },
      {
        title: 'Browse & Filter 🔍',
        message: "Use the search bar and filters to find drills by difficulty or category! Your assigned drills are pinned at the top for easy access.",
        highlight: 'drills-filter',
      },
      {
        title: 'Your Drill Cards ▶️',
        message: "Tap any drill card to open the full video, description, and instructions. Watch it FIRST, then go practice! Don't skip the form cues!",
        highlight: 'drills-grid',
      },
      {
        title: 'Drills Tour Done! 🎊',
        message: "LOCKED IN! Last stop — Settings! Set up your profile, notifications, and leaderboard status. Almost done!",
        navigateTo: '/settings',
        action: 'Go to Settings',
      },
    ],
  },

  '/settings': {
    pageTitle: 'Account Settings',
    icon: Settings,
    color: 'text-slate-400',
    steps: [
      {
        title: 'Settings — Your Control Panel ⚙️',
        message: "Last stop! Your Settings page is where you fine-tune everything about YOUR experience on PSP.Pro. Quick tour — 4 tabs, won't take long!",
      },
      {
        title: 'Tab Navigation 📑',
        message: "These 4 tabs control everything — Profile, Notifications, Security, and Privacy. Tap any tab to switch sections. Start with Profile!",
        highlight: 'settings-tabs',
      },
      {
        title: 'Notifications 🔔',
        message: "Control what pings you! Session reminders, new drills assigned, achievement unlocks, coach messages... toggle on what matters to you!",
        highlight: 'settings-notifications',
      },
      {
        title: 'Leaderboard Settings 🏅',
        message: "Wanna compete? Toggle Show on Leaderboards ON and set your region! Your best metrics will appear on the regional leaderboards — let them SEE you!",
        highlight: 'settings-leaderboard',
      },
      {
        title: "Tour Complete — You're Ready! 🎉",
        message: "DR. PROP SAYS: YOU ARE OFFICIALLY READY! You've seen your Locker, Booking, Sessions, Progress, Drills, and Settings! Now go get that first booking in!",
        action: 'Finish Tour',
      },
    ],
  },
}

// ─── Dr. Prop Avatar ─────────────────────────────────────────
function DrPropAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-base',
    md: 'w-11 h-11 text-xl',
    lg: 'w-14 h-14 text-2xl',
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-orange via-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange/30 flex-shrink-0 ring-2 ring-orange/40`}>
      <span role="img" aria-label="Dr. Prop">🧪</span>
    </div>
  )
}

// ─── Card positioning helper ──────────────────────────────────
interface CardPos {
  top?: number
  bottom?: number
  left: number
  arrowDir: 'up' | 'down' | 'none'
}

function computeCardPos(targetRect: DOMRect, cardW = 360, cardH = 200): CardPos {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const pad = 12
  const gap = 16 // gap between spotlight and card

  // Horizontal: centre on target, clamp to viewport
  const idealLeft = targetRect.left + targetRect.width / 2 - cardW / 2
  const left = Math.max(pad, Math.min(idealLeft, vw - cardW - pad))

  // Vertical: prefer below target, flip above if not enough room
  const spaceBelow = vh - (targetRect.bottom + gap)
  const spaceAbove = targetRect.top - gap

  if (spaceBelow >= cardH + pad) {
    return { top: targetRect.bottom + gap, left, arrowDir: 'up' }
  } else if (spaceAbove >= cardH + pad) {
    return { top: targetRect.top - gap - cardH, left, arrowDir: 'down' }
  } else {
    // Not enough room either side — pin to bottom of viewport
    return { bottom: 76, left: pad, arrowDir: 'none' }
  }
}

// ─── Main TourHUD Component ───────────────────────────────────
export function TourHUD() {
  const pathname = usePathname()
  const router = useRouter()
  const [active, setActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [ending, setEnding] = useState(false)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

  // Check tour cookie on mount AND on pathname change
  useEffect(() => {
    const cookieActive = isTourActive()
    setActive(cookieActive)
    if (cookieActive) setCurrentStep(0)
  }, [pathname])

  useEffect(() => {
    if (isTourActive()) { setActive(true); setCurrentStep(0) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const tour = active ? PAGE_TOURS[pathname] ?? null : null
  const steps = tour?.steps ?? []
  const step = steps[currentStep] ?? null
  const isLastStep = currentStep === steps.length - 1
  const TourIcon = tour?.icon ?? Zap

  // ── Spotlight: find element, scroll to it, measure rect ──────
  useEffect(() => {
    if (!step?.highlight) { setTargetRect(null); return }

    const el = document.querySelector(`[data-tour="${step.highlight}"]`) as HTMLElement | null
    if (!el) { setTargetRect(null); return }

    // Scroll element into view
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })

    // Wait for scroll to settle then measure
    const t = setTimeout(() => {
      setTargetRect(el.getBoundingClientRect())
    }, 420)

    // Keep rect updated on window resize/scroll
    const update = () => setTargetRect(el.getBoundingClientRect())
    window.addEventListener('resize', update, { passive: true })
    window.addEventListener('scroll', update, { passive: true })

    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update)
    }
  }, [currentStep, step?.highlight, pathname])

  // ── Click-to-advance on highlighted element ───────────────────
  const handleNextRef = useCallback(async () => {
    if (!step) return
    if (step.navigateTo && isLastStep) {
      markPageVisited(pathname)
      router.push(step.navigateTo)
      return
    }
    if (isLastStep) { await endTour(); return }
    setCurrentStep(s => s + 1)
  }, [step, isLastStep, pathname, router]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!step?.highlight) return
    const el = document.querySelector(`[data-tour="${step.highlight}"]`) as HTMLElement | null
    if (!el) return

    const onClick = (e: Event) => {
      e.stopPropagation()
      handleNextRef()
    }
    el.addEventListener('click', onClick, { capture: true })
    el.style.cursor = 'pointer'
    el.style.position = el.style.position || 'relative'
    el.style.zIndex = '116' // above overlay (z-115), below card (z-120)

    return () => {
      el.removeEventListener('click', onClick, { capture: true })
      el.style.cursor = ''
      el.style.zIndex = ''
    }
  }, [currentStep, step?.highlight, pathname, handleNextRef])

  const endTour = async () => {
    setEnding(true)
    try { await fetch('/api/tour', { method: 'DELETE' }) } catch { /* ignore */ }
    setActive(false)
    setEnding(false)
    setCurrentStep(0)
    setTargetRect(null)
    markPageVisited(pathname)
  }

  if (!active || !tour || !step) return null

  // Compute card position
  const CARD_W = 360
  const CARD_H = 190
  const pos: CardPos = targetRect
    ? computeCardPos(targetRect, CARD_W, CARD_H)
    : { bottom: 76, left: 12, arrowDir: 'none' }

  const cardStyle: React.CSSProperties = {
    position: 'fixed',
    width: Math.min(CARD_W, window.innerWidth - 24),
    zIndex: 120,
    ...(pos.top !== undefined ? { top: pos.top } : {}),
    ...(pos.bottom !== undefined ? { bottom: pos.bottom } : {}),
    left: pos.left,
  }

  return (
    <>
      {/* Spotlight overlay */}
      <SpotlightOverlay
        targetRect={targetRect}
        show={active}
        padding={10}
        onBackdropClick={() => {}} // backdrop clicks don't skip — user must use End button
      />

      {/* Dr. Prop card */}
      <AnimatePresence>
        <motion.div
          key={`card-${currentStep}`}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          style={cardStyle}
        >
          {/* Arrow pointing UP to target (card is below target) */}
          {pos.arrowDir === 'up' && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-2 overflow-hidden">
              <div className="w-4 h-4 bg-slate-950 border border-orange/25 rotate-45 translate-y-2 mx-auto" />
            </div>
          )}

          {/* Arrow pointing DOWN to target (card is above target) */}
          {pos.arrowDir === 'down' && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-2 overflow-hidden">
              <div className="w-4 h-4 bg-slate-950 border border-orange/25 rotate-45 -translate-y-2 mx-auto" />
            </div>
          )}

          {/* Card */}
          <div className="relative bg-slate-950 border border-orange/25 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.7)] overflow-hidden">

            {/* Progress bar */}
            <div className="h-[3px] bg-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-orange to-amber-400"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5">
              <div className="flex items-center gap-1.5">
                <TourIcon className={`w-3 h-3 ${tour.color} opacity-70`} />
                <span className="text-[11px] font-medium text-white/40">{tour.pageTitle}</span>
                <span className="text-[11px] text-white/20">·</span>
                <span className="text-[11px] font-bold text-orange">{currentStep + 1}/{steps.length}</span>
              </div>
              <button
                onClick={endTour}
                className="flex items-center gap-1 text-[11px] text-white/25 hover:text-white/50 transition-colors px-1.5 py-0.5 rounded-md hover:bg-white/5"
              >
                <SkipForward className="w-3 h-3" />
                End
              </button>
            </div>

            {/* Body */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="px-3 pb-2"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange to-amber-500 flex items-center justify-center shadow-md shadow-orange/30 flex-shrink-0 ring-1 ring-orange/20">
                    <span className="text-white font-black text-[13px] leading-none">Dr</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-black text-orange tracking-widest uppercase block mb-0.5">Dr. Prop</span>
                    <p className="font-bold text-white text-[13px] leading-snug mb-1">{step.title}</p>
                    <p className="text-[12px] text-white/55 leading-relaxed line-clamp-3">{step.message}</p>
                    {step.highlight && (
                      <p className="text-[11px] text-orange/60 mt-1.5 font-medium">
                        👆 Tap the highlighted area to continue
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Footer */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-t border-white/5">
              <button
                onClick={() => { if (currentStep > 0) setCurrentStep(s => s - 1) }}
                disabled={currentStep === 0}
                className="flex items-center gap-1 text-[12px] text-white/35 hover:text-white/65 disabled:opacity-20 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back
              </button>

              <div className="flex items-center justify-center gap-1 flex-1">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`rounded-full transition-all duration-200 ${
                      i === currentStep ? 'w-4 h-1.5 bg-orange'
                      : i < currentStep ? 'w-1.5 h-1.5 bg-orange/30'
                      : 'w-1.5 h-1.5 bg-white/10'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNextRef}
                disabled={ending}
                className="flex items-center gap-1 text-[12px] font-bold text-white bg-orange hover:bg-orange-500 disabled:opacity-50 px-4 py-1.5 rounded-lg transition-colors shadow-sm shadow-orange/20 shrink-0"
              >
                {ending ? 'Cleaning...' : isLastStep ? (step.action ?? 'Finish!') : (
                  <>{step.action ?? 'Next'}<ChevronRight className="w-3.5 h-3.5" /></>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  )
}

// ─── Tour Trigger Button (shown by chatbot / manual) ─────────
export function TourTriggerButton({ page, compact = false }: { page: string; compact?: boolean }) {
  const [starting, setStarting] = useState(false)
  const router = useRouter()

  const startTour = async () => {
    setStarting(true)
    try {
      const res = await fetch('/api/tour', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to start tour')

      if (page && window.location.pathname !== page) {
        // Navigate to the tour start page — pathname change triggers TourHUD mount effect
        router.push(page)
      } else {
        // Same page: hard reload so the TourHUD mounts fresh and picks up the new cookie
        window.location.href = page
      }
    } catch {
      setStarting(false)
    }
  }

  if (compact) {
    return (
      <button
        onClick={startTour}
        disabled={starting}
        className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl bg-gradient-to-r from-orange/15 to-amber-500/10 border border-orange/30 hover:bg-orange/25 hover:border-orange/50 transition-all group"
      >
        <span className="text-base">🧪</span>
        <span className="text-xs font-bold text-orange flex-1 text-left">
          {starting ? 'Starting...' : 'Take a Tour'}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-orange/60 group-hover:text-orange transition-colors flex-shrink-0" />
      </button>
    )
  }

  return (
    <button
      onClick={startTour}
      disabled={starting}
      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl bg-orange/15 border border-orange/30 hover:bg-orange/25 transition-all text-left group"
    >
      <DrPropAvatar size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-orange">{starting ? 'Starting tour...' : "Start Dr. Prop's Tour"}</p>
        <p className="text-xs text-white/50 truncate">Interactive walkthrough · cleans up after 🧹</p>
      </div>
      <ChevronRight className="w-4 h-4 text-orange/60 group-hover:text-orange transition-colors flex-shrink-0" />
    </button>
  )
}
