'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, ChevronLeft, Zap, SkipForward,
  LayoutDashboard, Calendar, TrendingUp, Dumbbell, Settings, Clock,
} from 'lucide-react'
import { isTourActive, markPageVisited } from '@/lib/tour/track'

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
        message: "Ayyyy, you made it! 🔥 This is YOUR home base — the Athlete Locker! Every time you log in, this is where you land. Let me walk you through what's here, no cap! 💪",
      },
      {
        title: 'Your Stats At a Glance 📊',
        message: "See those 4 cards up top? That's your real-time report card! 📈 Total sessions, average velocity, drills completed, and your training streak. Hit those numbers and watch 'em climb! 🚀",
        highlight: '.stat-card',
      },
      {
        title: 'Your Velocity Chart ⚡',
        message: "This chart right here? That's your PROOF. 📉➡️📈 Every session your coach logs your velocity — and this line goes UP. Screenshot it, send it to your rivals, do whatever you gotta do! 😤",
      },
      {
        title: 'Your Next Session 📅',
        message: "Next session card shows you EXACTLY when you gotta show up and who your coach is. No excuses, no 'I forgot!' — it's right here staring at you! ⏰🎯",
      },
      {
        title: 'Assigned Drills 🏋️',
        message: "Scroll down and you'll see your assigned drills — video content your coach handpicked specifically for YOU. Watch, rep it, mark it complete. That's how you level up between sessions! 🎥✅",
      },
      {
        title: 'Locker Tour Complete! 🎉',
        message: "LETSSS GOOO! 🏆 You know your Locker now. Next stop — Book your first session so we can get to WORK! Ready? Tap 'Book a Session' or hit Next to keep exploring! 💥",
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
        message: "OKAY! It's time to put some work on the calendar! 📅 Booking is 4 steps — service, date, time, confirm. I'm walking you through every single one. Let's RUN IT! 🔥",
      },
      {
        title: 'Step 1: Pick Your Training Type 🥎',
        message: "First, choose what kind of session you want! 1-on-1, group training, specialty — whatever fits your goals. Each card shows the price, duration, and what you're getting. PICK YOUR WEAPON! ⚔️",
        highlight: '.service-card',
      },
      {
        title: 'Step 2: Choose Your Date 📆',
        message: "Calendar pops up next! Pick any open date — green means go! 🟢 Gray dates are either in the past or already booked up. First come, first served out here! ⏱️",
      },
      {
        title: 'Step 3: Grab Your Time Slot ⏰',
        message: "Now pick a time slot that works for you! You'll see your coach's name, the location, and when spots are running low. Don't sleep on the good slots! 😤💨",
      },
      {
        title: 'Step 4: Confirm & Pay 💳',
        message: "Last step! Review your booking — service, date, time, price. Got a promo code? Drop it in! Elite members get 10% off automatic. Hit 'Confirm & Pay' and you're LOCKED IN! 🔒🎉",
      },
      {
        title: 'Booking Tour Complete! 🙌',
        message: "FACTS! Now you know how to book like a pro! 💯 Try booking a real session — this is tour mode so it'll clean up after. Or keep exploring! Next up: check your Sessions page! 📋",
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
        message: "This is where ALL your sessions live — upcoming, completed, the whole archive! 🗂️ Every booking you make shows up right here. Let me break it DOWN! 🔥",
      },
      {
        title: 'Filter Your Sessions 🔍',
        message: "See those tabs at the top? All, Upcoming, and Past! 📌 Filter to just what you need. Upcoming shows what's on deck. Past shows your training history — every grind session logged! 💪",
      },
      {
        title: 'RSVP to Your Sessions ✅',
        message: "For upcoming sessions, you can hit 'Going', 'Maybe', or 'Can't Go' — like a real calendar invite! 📩 Your coach can see your RSVP so they know who's showing up. BE THERE! 🏟️",
      },
      {
        title: 'Sync to Your Calendar 📲',
        message: "Hit the 'Sync Calendar' button at the top! 🔄 Grab that subscribe link and drop it in Google Cal, Apple Cal, or Outlook. Sessions auto-update when you book or cancel — zero manual work! 🤖",
      },
      {
        title: 'Coach Notes 📝',
        message: "After each session, your coach drops notes right here! Tips, wins, things to work on. That's personalized coaching in writing — READ THEM, apply them, level UP! 📈",
      },
      {
        title: 'Sessions Tour Done! 🎊',
        message: "You're a sessions pro now! 😎 Next up — your Progress page. This is where the NUMBERS tell your story! Let's go see how you're improving! 📊🚀",
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
        message: "YO! This page right here? This is PROOF that you put in work! 💎 Your performance data, personal records, and improvement charts all live here. Time to flex! 💪📈",
      },
      {
        title: 'Your Key Stats 📊',
        message: "Top 4 cards = your headline numbers! Peak velocity, average velocity, sessions completed, drills done. These update after EVERY session your coach logs. Watch them grow! 🌱➡️🌳",
      },
      {
        title: 'Sport-Specific Performance 🥎🏀⚽',
        message: "Tap the sport tabs to see YOUR sport's metrics! Softball shows exit velo + bat speed + throwing velocity. Basketball shows 3-point %, verticals, and more! 15 metrics per sport tracked! 😤",
      },
      {
        title: 'Multi-Metric Chart 📉➡️📈',
        message: "This chart tracks MULTIPLE metrics over time! Watch all your stats trend upward as you put in sessions. Hover over any point to see the exact number! Screenshot worthy fr! 📸🔥",
      },
      {
        title: 'Personal Records 🥇',
        message: "YOUR personal bests right here! Every metric you've ever hit — date, value, and whether it's PSP Verified (recorded by your coach with equipment) or Self-Reported! Legit stats only! ✅",
      },
      {
        title: 'Milestones Timeline 🎯',
        message: "Scroll down to your Milestones! Orange dots = ACHIEVED! 🔶 Gray = coming up next! First session, velocity PRs, drill counts, streaks — unlock them all! The grind is REAL! 😤",
      },
      {
        title: 'Progress Tour Done! 🚀',
        message: "You're BUILT DIFFERENT for checking your progress like this! 🏅 Now let's hit the Drills page — your coach-assigned training videos are waiting! Let's WORK! 🎥💪",
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
        message: "WELCOME to your training video library! 🏋️‍♀️ Every drill your coach assigns lives here. Watch, rep it, mark it complete — that's the formula between sessions! LET'S GO! 🔥",
      },
      {
        title: 'Browse & Filter 🔍',
        message: "Use the search bar and filters to find drills by difficulty (Beginner → Advanced) or category (Mechanics, Speed, Power, etc.)! 🎯 Your assigned drills are pinned right at the top for easy access! 📌",
      },
      {
        title: 'Open a Drill ▶️',
        message: "Click any drill card to open it! You'll get the full YouTube video player, description, duration, and instructions. Watch it FIRST, THEN go practice! Don't skip the form cues! 👀",
      },
      {
        title: 'Mark it Complete ✅',
        message: "After you do the drill — HIT THAT BUTTON! ✅ 'Mark Complete' logs your completion, bumps your drill count stats, and helps you unlock achievements! Every rep counts! 💯",
      },
      {
        title: 'Drills Tour Done! 🎊',
        message: "LOCKED IN! 🔒 You know how the drill library works. Last stop on the tour — Settings! Set up your profile, notifications, and leaderboard status! Almost done! ⚙️",
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
        message: "Last stop! ⚙️ Your Settings page is where you fine-tune everything about YOUR experience on PSP.Pro! Quick tour — 4 tabs, won't take long! 🙌",
      },
      {
        title: 'Profile Tab 👤',
        message: "Profile tab is where you update your name and email! Keep it current so your coach can reach you and your dashboard looks right! Click Edit, make changes, hit Save! ✏️💾",
      },
      {
        title: 'Notifications 🔔',
        message: "Notifications tab — control what pings you! Session reminders, new drills assigned, achievement unlocks, coach messages... toggle on what matters to you! Never miss a thing! 📲",
      },
      {
        title: 'Leaderboard Settings 🏅',
        message: "Wanna compete? 😤 Toggle 'Show on Leaderboards' ON and set your region (e.g. '757' or 'Hampton Roads')! Your best metrics will appear on the regional leaderboards! Let them SEE you! 👀",
      },
      {
        title: "Tour Complete — You're Ready! 🎉",
        message: "DR. PROP SAYS: YOU ARE OFFICIALLY READY! 🏆🔥 You've seen your Locker, Booking, Sessions, Progress, Drills, and Settings! Now go get that first booking in and let's make some HISTORY! 💪🚀",
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

// ─── Main TourHUD Component ───────────────────────────────────
export function TourHUD() {
  const pathname = usePathname()
  const router = useRouter()
  const [active, setActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [ending, setEnding] = useState(false)

  // Check tour cookie on mount AND on pathname change
  useEffect(() => {
    const cookieActive = isTourActive()
    setActive(cookieActive)
    // Reset step index when arriving at a new page during a tour
    if (cookieActive) setCurrentStep(0)
  }, [pathname])

  // Also check on mount (catches same-page reload after tour start)
  useEffect(() => {
    if (isTourActive()) {
      setActive(true)
      setCurrentStep(0)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const tour = active ? PAGE_TOURS[pathname] ?? null : null
  const steps = tour?.steps ?? []
  const step = steps[currentStep] ?? null
  const isLastStep = currentStep === steps.length - 1
  const TourIcon = tour?.icon ?? Zap

  const handleNext = useCallback(async () => {
    if (!step) return

    // If this step navigates somewhere, go there
    if (step.navigateTo && isLastStep) {
      markPageVisited(pathname)
      router.push(step.navigateTo)
      return
    }

    if (isLastStep) {
      // Last step of last page — end tour
      await endTour()
      return
    }

    setCurrentStep(s => s + 1)
  }, [step, isLastStep, pathname, router]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1)
  }

  const endTour = async () => {
    setEnding(true)
    try {
      await fetch('/api/tour', { method: 'DELETE' })
    } catch { /* ignore */ }
    setActive(false)
    setEnding(false)
    setCurrentStep(0)
    markPageVisited(pathname)
  }

  const skipTour = async () => {
    await endTour()
  }

  if (!active || !tour || !step) return null

  return (
    <AnimatePresence>
      <motion.div
        key="tour-hud"
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 80 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="fixed inset-x-3 bottom-[76px] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-6 sm:w-[480px] z-[120]"
      >
        {/* Card */}
        <div className="relative bg-slate-950 border border-orange/25 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] overflow-hidden">

          {/* Top progress bar */}
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
              onClick={skipTour}
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
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.15 }}
              className="px-3 pb-2"
            >
              <div className="flex items-start gap-2.5">
                {/* Avatar — CSS only, no emoji rendering issues */}
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange to-amber-500 flex items-center justify-center shadow-md shadow-orange/30 flex-shrink-0 ring-1 ring-orange/20">
                  <span className="text-white font-black text-[13px] leading-none">Dr</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-black text-orange tracking-widest uppercase block mb-0.5">Dr. Prop</span>
                  <p className="font-bold text-white text-[13px] leading-snug mb-1">{step.title}</p>
                  <p className="text-[12px] text-white/55 leading-relaxed line-clamp-3">{step.message}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Footer */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-t border-white/5">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-1 text-[12px] text-white/35 hover:text-white/65 disabled:opacity-20 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </button>

            {/* Dots */}
            <div className="flex items-center justify-center gap-1 flex-1">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`rounded-full transition-all duration-200 ${
                    i === currentStep
                      ? 'w-4 h-1.5 bg-orange'
                      : i < currentStep
                        ? 'w-1.5 h-1.5 bg-orange/30'
                        : 'w-1.5 h-1.5 bg-white/10'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={ending}
              className="flex items-center gap-1 text-[12px] font-bold text-white bg-orange hover:bg-orange-500 disabled:opacity-50 px-4 py-1.5 rounded-lg transition-colors shadow-sm shadow-orange/20 shrink-0"
            >
              {ending ? 'Cleaning...' : isLastStep ? (step.action ?? 'Finish!') : (
                <>
                  {step.action ?? 'Next'}
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
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
