'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, ChevronLeft, Zap, SkipForward,
  LayoutDashboard, Calendar, TrendingUp, Dumbbell, Settings, Clock,
  Shield, Users, DollarSign, BarChart3, BookOpen, ClipboardCheck, Tag,
  Building2, Newspaper, Upload, Compass, Image, FileText,
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

  '/achievements': {
    pageTitle: 'Achievements',
    icon: Zap,
    color: 'text-orange',
    steps: [
      {
        title: 'Your Achievement Vault 🏆',
        message: "Welcome to your Trophy Case! Every badge you see here was EARNED — through sessions, drills, PRs, and consistency. Let's break it down!",
      },
      {
        title: 'Your Stats at a Glance 📊',
        message: "Three cards, three numbers that matter: how many you've unlocked, total points earned, and your completion rate. Chase that 100%! 🔥",
        highlight: 'achievements-stats',
      },
      {
        title: 'Your Achievement Grid 🎖️',
        message: "Each card is a badge — orange glow means UNLOCKED, faded means in progress. Tap any badge to see what it takes to earn it. Go stack these!",
        highlight: 'achievements-grid',
      },
      {
        title: 'Achievements Tour Done! 🎊',
        message: "You know what's here — now go EARN IT! Every session, every drill, every PR gets you closer to filling this page with gold. Let's get to work!",
        action: 'Finish Tour',
      },
    ],
  },

  '/leaderboards': {
    pageTitle: 'Leaderboards',
    icon: TrendingUp,
    color: 'text-orange',
    steps: [
      {
        title: 'The Regional Leaderboards 🏅',
        message: "THIS is where you see how you stack up against other PSP athletes in your region! Verified metrics only — no cap, no self-report drama!",
      },
      {
        title: 'Pick Your Sport 🥎🏀⚽',
        message: "Tap a sport tab to filter the leaderboard! Softball, Basketball, Soccer, or Athleticism — every sport has its own rankings. Which one are you topping?",
        highlight: 'leaderboards-sport-tabs',
      },
      {
        title: 'Filter & Refine 🔍',
        message: "Choose a metric to rank by, filter by region, or toggle Verified Only to see only coach-confirmed stats. Use this to find where YOU rank!",
        highlight: 'leaderboards-filters',
      },
      {
        title: 'The Rankings Board 📋',
        message: "Here's the live standings — rank, name, region, and stat. Is your name on the board? Go to Settings → Leaderboards to opt in and let them see you!",
        highlight: 'leaderboards-table',
      },
      {
        title: 'Leaderboards Tour Done! 🚀',
        message: "Now you know how rankings work! Get your stats verified by your coach and opt in from Settings to start climbing. TOP OF THE BOARD is yours to take!",
        action: 'Finish Tour',
      },
    ],
  },

  '/messages': {
    pageTitle: 'Messages',
    icon: Calendar,
    color: 'text-blue-400',
    steps: [
      {
        title: 'Your Message Hub 💬',
        message: "Direct line to your coaches and teammates! Send questions, get feedback, coordinate sessions — all in one place. No more guessing!",
      },
      {
        title: 'Your Conversations 📋',
        message: "Left panel = all your chats. Tap any conversation to open it. Unread messages show an orange badge. Hit the + button to start a new conversation!",
        highlight: 'messages-conversation-list',
      },
      {
        title: 'The Chat Window 💭',
        message: "Right side is where messages live! Type in the box at the bottom and hit Send (or press Enter). Your coach can reply from their dashboard — real-time!",
        highlight: 'messages-chat-container',
      },
      {
        title: 'Messages Tour Done! 🎊',
        message: "Communication is KEY to your development! Don't be shy — ask your coach questions, share wins, and stay connected. They're here for you!",
        action: 'Finish Tour',
      },
    ],
  },

  '/courses': {
    pageTitle: 'Video Courses',
    icon: Dumbbell,
    color: 'text-cyan-400',
    steps: [
      {
        title: 'Your Video Course Library 🎥',
        message: "Welcome to the Course Hub! Expert training videos broken into full courses — watch on YOUR schedule, track your progress, and level up your game knowledge!",
      },
      {
        title: 'Browse & Filter 🔍',
        message: "Three views: All Courses, My Courses (enrolled), and Available (not yet enrolled). Switch between them to find what you're looking for fast!",
        highlight: 'courses-filters',
      },
      {
        title: 'Course Cards 📚',
        message: "Each card shows title, lessons count, price, and your progress bar if enrolled. Free courses for members are tagged! Tap a card to start or continue!",
        highlight: 'courses-grid',
      },
      {
        title: 'Courses Tour Done! 🎊',
        message: "Knowledge is a weapon — use it! Enroll in a course, watch a few lessons, and bring those concepts to your next session. Your coach will notice!",
        action: 'Finish Tour',
      },
    ],
  },

  '/questionnaires': {
    pageTitle: 'Pop Quizzes',
    icon: Zap,
    color: 'text-amber-400',
    steps: [
      {
        title: 'Pop Quiz Time! 📝',
        message: "Your coaches assign quizzes to test your knowledge between sessions! Sports science, technique, game IQ — it all counts. Let's see what you know!",
      },
      {
        title: 'Your Quiz Stats 📊',
        message: "Pending quizzes on the left (get to those ASAP!), completed on the right. Your coaches can see your scores — so don't sleep on the pending ones!",
        highlight: 'quizzes-stats',
      },
      {
        title: 'Filter Your Quizzes 🔍',
        message: "Use the filter buttons to show All quizzes, just Pending ones, or your Completed history. Pending = action needed! Don't leave your coach waiting!",
        highlight: 'quizzes-filters',
      },
      {
        title: 'Take a Quiz ✅',
        message: "Tap any quiz card to open it and start answering! Multiple choice — pick your answer and submit. You'll see your score right away. Don't overthink it!",
        highlight: 'quizzes-list',
      },
      {
        title: 'Quiz Tour Done! 🎊',
        message: "Mental reps are just as important as physical ones! When a quiz drops, knock it out fast. Your coach assigns these for a reason — trust the process!",
        action: 'Finish Tour',
      },
    ],
  },

  '/video-analysis': {
    pageTitle: 'Video Analysis',
    icon: TrendingUp,
    color: 'text-purple-400',
    steps: [
      {
        title: 'Video Analysis — Get Eyes On You! 🎬',
        message: "Submit YOUR game film and get professional coaching feedback from the PSP staff! Upload a clip or drop a YouTube link — your coach will break it DOWN!",
      },
      {
        title: 'Filming Guidelines 📷',
        message: "Before you upload, expand this card! It has tips on angles, lighting, and framing so your coach can see EXACTLY what they need to analyze. Film it right the first time!",
        highlight: 'video-analysis-guidelines',
      },
      {
        title: 'Submit Your Video 📤',
        message: "Choose Upload File OR paste a YouTube link — whichever is easier! Add notes to tell your coach what to focus on (swing, footwork, release, etc.). Then hit Submit!",
        highlight: 'video-analysis-form',
      },
      {
        title: 'Video Analysis Tour Done! 🎊',
        message: "Getting a coach's eyes on your film is NEXT LEVEL! Submit your first video after your next session or practice. Feedback you can actually use — let's GO!",
        action: 'Finish Tour',
      },
    ],
  },

  '/progress-report': {
    pageTitle: 'Progress Report',
    icon: TrendingUp,
    color: 'text-green-400',
    steps: [
      {
        title: 'Your Progress Report 📈',
        message: "This is your OFFICIAL athlete report — sessions logged, drills completed, new personal records. Think of it as your performance report card for the period!",
      },
      {
        title: 'Quick Stats 📊',
        message: "Three headline numbers: Sessions Completed, Drills Done, and New PRs this period. These update as your coach logs sessions and you complete drills!",
        highlight: 'progress-report-stats',
      },
      {
        title: 'Personal Records 🥇',
        message: "Scroll down to see your NEW personal records from this reporting period! Every PR is a proof point that you're improving. Screenshot this and share it!",
        highlight: 'progress-report-records',
      },
      {
        title: 'Progress Report Tour Done! 🎊',
        message: "Your progress is documented and REAL! Share this with your parents, your team, your school — this is the receipts for all your hard work. Keep stacking those numbers!",
        action: 'Finish Tour',
      },
    ],
  },

  // ─── Coach / Admin Tours ─────────────────────────────────────

  '/admin': {
    pageTitle: 'Admin Dashboard',
    icon: Shield,
    color: 'text-red-400',
    steps: [
      {
        title: 'Welcome to Command Central! 🎯',
        message: "THIS is your HQ, Coach! Everything you need to run your business lives right here. Let me show you around!",
      },
      {
        title: 'Quick Actions ⚡',
        message: "These 4 buttons are your power moves — Log a Session, Create an Athlete, Add a Service, or Generate an Invite Link. One tap and you're rolling!",
        highlight: 'admin-actions',
      },
      {
        title: 'Your Stats Dashboard 📊',
        message: "Total athletes, active sessions, revenue, booking trends — your business health at a glance. These update in real-time as you work!",
        highlight: 'admin-stats',
      },
      {
        title: "Today's Sessions 📋",
        message: "See what's on deck! Upcoming sessions with athlete names, times, and status. Tap any session to log performance metrics after training.",
        highlight: 'admin-sessions',
      },
      {
        title: 'Management Hub 🛠️',
        message: "Quick links to Athletes, Bookings, Drills, Services, and more. Think of this as your shortcut panel to every tool you need!",
        highlight: 'admin-management',
      },
      {
        title: 'Admin Home Tour Done! 🔥',
        message: "You know your dashboard now, Coach! Next up — let's check out your Bookings Calendar where you manage all sessions!",
        navigateTo: '/admin/bookings',
        action: 'View Bookings',
      },
    ],
  },

  '/admin/bookings': {
    pageTitle: 'Bookings Calendar',
    icon: Calendar,
    color: 'text-blue-400',
    steps: [
      {
        title: 'Your Booking Command Center 📅',
        message: "Every session request, confirmation, and cancellation flows through here. Calendar view + list view — you pick how you wanna work!",
      },
      {
        title: 'Filter Controls 🔍',
        message: "Filter by status (Pending, Confirmed, Completed), by athlete, or by date range. Pending bookings need your attention — confirm or decline!",
        highlight: 'bookings-filters',
      },
      {
        title: 'Booking Stats 📊',
        message: "Quick numbers — total bookings, pending requests, today's sessions, and revenue. Watch these grow as your business scales!",
        highlight: 'bookings-stats',
      },
      {
        title: 'The Calendar View 📆',
        message: "Your visual schedule! Each booking shows athlete name, service type, and status color-coded. Tap any booking to confirm, reschedule, or log metrics after the session!",
        highlight: 'bookings-calendar',
      },
      {
        title: 'Bookings Tour Done! ✅',
        message: "You're a booking pro now! Next stop — your Athletes roster. That's where the REAL coaching data lives!",
        navigateTo: '/admin/athletes',
        action: 'Manage Athletes',
      },
    ],
  },

  '/admin/athletes': {
    pageTitle: 'Manage Athletes',
    icon: Users,
    color: 'text-cyan-400',
    steps: [
      {
        title: 'Your Athlete Roster 🏅',
        message: "Every athlete you coach is right here! Full profiles, performance data, drill assignments — your complete athlete management system.",
      },
      {
        title: 'Roster Stats 📊',
        message: "Total athletes, active this month, new signups, and parent accounts. These cards give you the pulse of your training program at a glance!",
        highlight: 'athletes-stats',
      },
      {
        title: 'The Athlete Grid 👥',
        message: "Each card shows the athlete's name, sport, membership status, and last activity. Tap any card to open their full profile — metrics, sessions, drill progress, everything!",
        highlight: 'athletes-grid',
      },
      {
        title: 'Athletes Tour Done! 💪',
        message: "You know your roster! Next — let's check out the Drills Manager where you create and assign training content!",
        navigateTo: '/admin/drills',
        action: 'Manage Drills',
      },
    ],
  },

  '/admin/drills': {
    pageTitle: 'Drill Manager',
    icon: Dumbbell,
    color: 'text-purple-400',
    steps: [
      {
        title: 'Your Drill Library 🎥',
        message: "Create video drills, organize by category and difficulty, then assign them to athletes. This is how you coach between sessions!",
      },
      {
        title: 'Drill Stats 📊',
        message: "Total drills created, categories covered, and athlete completion rates. Track what drills are actually getting DONE!",
        highlight: 'admin-drills-stats',
      },
      {
        title: 'Filter & Search 🔍',
        message: "Filter by category, difficulty, or search by name. Find the right drill in seconds, then assign it to an athlete or group!",
        highlight: 'admin-drills-filter',
      },
      {
        title: 'The Drill Grid 📋',
        message: "Each card shows video thumbnail, difficulty badge, and assignment count. Tap to edit, assign, or preview. Create new drills with the + button up top!",
        highlight: 'admin-drills-grid',
      },
      {
        title: 'Drills Tour Done! 🎬',
        message: "Content is KING, Coach! Next up — Services. That's where you set up your training packages and pricing!",
        navigateTo: '/admin/services',
        action: 'Manage Services',
      },
    ],
  },

  '/admin/services': {
    pageTitle: 'Lesson Builder',
    icon: DollarSign,
    color: 'text-green-400',
    steps: [
      {
        title: 'Your Service Catalog 💰',
        message: "This is where you build your offerings! 1-on-1 sessions, group training, specialty clinics — set prices, durations, and descriptions for everything you offer.",
      },
      {
        title: 'Your Services 📋',
        message: "Each service card shows name, price, duration, and active status. Athletes see these when booking! Tap to edit pricing, add descriptions, or toggle availability.",
        highlight: 'services-list',
      },
      {
        title: 'Services Tour Done! 🏷️',
        message: "Your offerings are SET! Next — Analytics. See how your business is actually performing with real revenue and booking data!",
        navigateTo: '/admin/analytics',
        action: 'View Analytics',
      },
    ],
  },

  '/admin/analytics': {
    pageTitle: 'Business Analytics',
    icon: BarChart3,
    color: 'text-green-400',
    steps: [
      {
        title: 'Your Business Intelligence 📈',
        message: "Revenue, bookings, athlete growth, session trends — everything you need to make smart decisions about your coaching business!",
      },
      {
        title: 'Key Metrics 📊',
        message: "Revenue totals, booking counts, average session value, and growth trends. These are YOUR business KPIs — watch them climb!",
        highlight: 'analytics-stats',
      },
      {
        title: 'Charts & Trends 📉',
        message: "Visual breakdowns — revenue over time, bookings by service type, athlete activity heatmaps. Use these to spot your busiest days and best-selling services!",
        highlight: 'analytics-charts',
      },
      {
        title: 'Analytics Tour Done! 🚀',
        message: "Data-driven coaching is NEXT LEVEL! Next — Courses. Build structured video courses your athletes can learn from!",
        navigateTo: '/admin/courses',
        action: 'Manage Courses',
      },
    ],
  },

  '/admin/courses': {
    pageTitle: 'Course Builder',
    icon: BookOpen,
    color: 'text-pink-400',
    steps: [
      {
        title: 'Your Course Library 📚',
        message: "Build full video courses with multiple lessons! Set pricing, track enrollment, and give athletes structured learning paths they can follow at their own pace.",
      },
      {
        title: 'Course Cards 🎓',
        message: "Each card shows title, lesson count, enrollment numbers, and pricing. Tap to edit, manage lessons, or view who's enrolled. Hit New Course to build one!",
        highlight: 'admin-courses-grid',
      },
      {
        title: 'Courses Tour Done! 🎬',
        message: "Courses = passive income + athlete development! Next up — Pop Quizzes. Test your athletes' knowledge between sessions!",
        navigateTo: '/admin/questionnaires',
        action: 'Manage Quizzes',
      },
    ],
  },

  '/admin/questionnaires': {
    pageTitle: 'Pop Quiz Manager',
    icon: ClipboardCheck,
    color: 'text-emerald-400',
    steps: [
      {
        title: 'Pop Quiz Builder 📝',
        message: "Create true/false quizzes to test your athletes' game IQ! Assign them individually or to groups, then review scores to see who's paying attention.",
      },
      {
        title: 'Your Quizzes 📋',
        message: "Each row shows title, question count, assignments, and published status. Assign to athletes, view responses, or edit questions. Create new quizzes with the + button!",
        highlight: 'admin-quizzes-list',
      },
      {
        title: 'Quizzes Tour Done! ✅',
        message: "Mental reps matter as much as physical ones! Next — Promo Codes. Create discounts to grow your client base!",
        navigateTo: '/admin/promos',
        action: 'Manage Promos',
      },
    ],
  },

  '/admin/promos': {
    pageTitle: 'Promo Codes',
    icon: Tag,
    color: 'text-orange',
    steps: [
      {
        title: 'Promo Code Manager 🏷️',
        message: "Create discount codes for marketing campaigns, referral rewards, or seasonal deals! Percentage off or flat amount — you control the terms.",
      },
      {
        title: 'Create & Manage 📋',
        message: "Hit New Code to create a promo. Set the discount type, amount, max uses, and expiration. Athletes enter codes at checkout — the discount applies automatically!",
        highlight: 'admin-promos-form',
      },
      {
        title: 'Promos Tour Done! 💸',
        message: "Smart promotions fill your schedule! Next — Organizations. Set up your coaching academy brand and team!",
        navigateTo: '/admin/org',
        action: 'View Orgs',
      },
    ],
  },

  '/admin/org': {
    pageTitle: 'Organizations',
    icon: Building2,
    color: 'text-indigo-400',
    steps: [
      {
        title: 'Your Organization Hub 🏢',
        message: "Build your coaching academy brand! Custom branding, team members, Stripe Connect payouts, and invite links — all managed here.",
      },
      {
        title: 'Org Management 📋',
        message: "Select an org from the sidebar, then use tabs to manage Overview, Members, Branding, Payouts, and Settings. Everything for running a multi-coach operation!",
        highlight: 'admin-org-layout',
      },
      {
        title: 'Org Tour Done! 🏗️',
        message: "Your brand, your team, your rules! Next — Content Hub. Manage blog posts and media for your public site!",
        navigateTo: '/admin/media',
        action: 'Content Hub',
      },
    ],
  },

  '/admin/media': {
    pageTitle: 'Content Hub',
    icon: Newspaper,
    color: 'text-pink-400',
    steps: [
      {
        title: 'Your Content Hub 📰',
        message: "Two sections in one — Blog Posts and Media Gallery. Keep your public site fresh with training tips, athlete spotlights, and facility photos!",
      },
      {
        title: 'Blog & Media Tabs 📑',
        message: "Switch between Blog Posts and Media Gallery with these tabs. Blog posts drive SEO and engagement. Media Gallery stores images and videos for your site!",
        highlight: 'admin-media-tabs',
      },
      {
        title: 'Content Tour Done! 📝',
        message: "Content marketing is how you get found! Last stop — Data Import. Bring in performance data from your training devices!",
        navigateTo: '/admin/imports',
        action: 'Data Import',
      },
    ],
  },

  '/admin/imports': {
    pageTitle: 'Data Import',
    icon: Upload,
    color: 'text-purple-400',
    steps: [
      {
        title: 'Device Data Import 📤',
        message: "Import CSV data from Rapsodo, Blast Motion, Pocket Radar, and HitTrax! Bulk upload performance metrics straight into your athletes' profiles.",
      },
      {
        title: 'Upload Form 📋',
        message: "Select an athlete, choose the device type, upload the CSV file, and hit Import. The system parses the data and maps it to the right metrics automatically!",
        highlight: 'admin-imports-form',
      },
      {
        title: "You've Seen It ALL! 🎉",
        message: "DR. PROP SAYS: YOU ARE A CERTIFIED PSP PRO COACH! 🏆 You've toured every tool in your arsenal. Now go build your empire — create services, add athletes, and start coaching!",
        action: 'Finish Tour',
      },
    ],
  },

  '/admin/availability': {
    pageTitle: 'Availability',
    icon: Calendar,
    color: 'text-blue-400',
    steps: [
      {
        title: 'Your Schedule Command Center 📅',
        message: "This is where you control WHEN athletes can book you! Create time slots, set recurring schedules, and manage your entire availability from one place.",
      },
      {
        title: 'Create Time Slots ➕',
        message: "Hit 'Add Time Slot' to open the form. Pick a date, start/end time, location, and max bookings. Turn on 'Repeat' to auto-create weekly or monthly slots!",
        highlight: 'admin-availability-header',
      },
      {
        title: 'Your Slots List 📋',
        message: "All your upcoming slots appear here. Filter by week, see how many bookings each slot has, and edit or delete on the fly. Green = available, Red = full.",
        highlight: 'admin-availability-list',
      },
      {
        title: 'Bulk Edit Power 💪',
        message: "Got 20 slots to update? Hit 'Bulk Edit', select the ones you want, and change service, time, location, or max bookings all at once. Massive time saver!",
      },
      {
        title: 'Availability Done! ✅',
        message: "Set your schedule once, repeat it weekly, and athletes can book you around the clock. Now head to Bookings to see who's signed up!",
        navigateTo: '/admin/bookings',
        action: 'View Bookings',
      },
    ],
  },

  '/admin/requests': {
    pageTitle: 'Action Requests',
    icon: FileText,
    color: 'text-amber-400',
    steps: [
      {
        title: 'Action Requests Hub 📋',
        message: "This is the master admin approval center! When coaches request destructive actions (like deleting an athlete), those requests land here for your review.",
      },
      {
        title: 'Review & Approve 🔍',
        message: "Each request shows who asked, what they want, and why. You can 'Approve & Execute' to carry out the action, or 'Deny' to block it. Full audit trail!",
        highlight: 'admin-requests-list',
      },
      {
        title: 'Filter by Status 📑',
        message: "Use the tabs to switch between Pending, Approved, and Denied requests. Pending is where the action is — that's what needs your attention right now.",
        highlight: 'admin-requests-tabs',
      },
      {
        title: 'Requests Complete! 🛡️',
        message: "This keeps your platform safe by requiring approval for sensitive actions. Coaches request, you approve — no accidental deletions!",
        action: 'Got It!',
      },
    ],
  },

  '/admin/images': {
    pageTitle: 'Image Management',
    icon: Image,
    color: 'text-pink-400',
    steps: [
      {
        title: 'Image Management 🖼️',
        message: "Replace all the placeholder images on your marketing site with YOUR real photography! Hero banners, coach headshots, feature cards, facility photos — everything.",
      },
      {
        title: 'Upload Sections 📸',
        message: "Scroll down to see sections: Hero, Feature Cards, Coach Headshots, and Facility Photos. Each slot shows the current image, recommended dimensions, and an upload button.",
        highlight: 'admin-images-sections',
      },
      {
        title: 'Image Guidelines 📐',
        message: "Match the aspect ratio shown (16:9, 3:2, or 1:1). Use high-res images at 2x display size. WebP format is best for performance. Keep files under 5MB!",
        highlight: 'admin-images-guidelines',
      },
      {
        title: 'Images Done! 🎨',
        message: "Upload your real photos and watch your public site transform from template to professional! First impressions matter — make yours count.",
        action: 'Got It!',
      },
    ],
  },

  '/guide': {
    pageTitle: 'Play-by-Play Guide',
    icon: Compass,
    color: 'text-teal-400',
    steps: [
      {
        title: 'Your Play-by-Play Guide 🧭',
        message: "Welcome to the ultimate map of PSP.Pro! This page shows you every feature organized by category. Tap any card to drill into the details.",
      },
      {
        title: 'Category Cards 🗂️',
        message: "Each card represents a group of related features — Getting Started, Track Your Growth, Train & Learn, and Stay Connected. The breadcrumb trail shows the flow!",
        highlight: 'guide-categories',
      },
      {
        title: 'Step-by-Step Details 📖',
        message: "Inside each category, you'll see numbered steps with descriptions and 'Go There' links that take you straight to that page. Some even have a 'Take a Tour' button!",
      },
      {
        title: 'Coach vs Athlete Views 👥',
        message: "Use the tabs at the top to switch between Athlete Guide and Coach Guide. Coaches get their own categories: Command Center, Build Content, Grow Business, and Import Tools.",
      },
      {
        title: 'Guide Complete! 🎓',
        message: "This is your reference manual. Come back anytime you forget where something is. And remember — Dr. Prop is always one tap away in the bottom-right corner!",
        action: 'Got It!',
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

// ─── Tour Active Banner ─────────────────────────────────────────
function TourActiveBanner({ onEnd, ending }: { onEnd: () => void; ending: boolean }) {
  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -40, opacity: 0 }}
      className="fixed top-0 left-0 right-0 z-[130] flex items-center justify-center gap-3 py-1.5 px-4 bg-gradient-to-r from-orange via-amber-500 to-orange text-white text-sm font-bold shadow-lg"
    >
      <span className="text-base">🧪</span>
      <span>Tour Mode Active — data will be cleaned up when you finish</span>
      <button
        onClick={onEnd}
        disabled={ending}
        className="ml-2 px-3 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors border border-white/30"
      >
        {ending ? 'Ending...' : 'End Tour'}
      </button>
    </motion.div>
  )
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

  // ── Auto-end tour when user leaves (tab close / navigate away) ──
  useEffect(() => {
    if (!active) return

    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable fire-on-close
      navigator.sendBeacon('/api/tour/end', '')
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Mark timestamp — if they come back quickly, don't end tour
        sessionStorage.setItem('psp_tour_hidden_at', Date.now().toString())
      } else if (document.visibilityState === 'visible') {
        // Back within 5 minutes? Keep tour. Otherwise end it.
        const hiddenAt = sessionStorage.getItem('psp_tour_hidden_at')
        if (hiddenAt) {
          const elapsed = Date.now() - parseInt(hiddenAt, 10)
          if (elapsed > 5 * 60 * 1000) {
            endTour()
          }
          sessionStorage.removeItem('psp_tour_hidden_at')
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [active]) // eslint-disable-line react-hooks/exhaustive-deps

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

  // Listen for tour-start event dispatched by TourTriggerButton (same-page restart)
  useEffect(() => {
    const handler = () => {
      setActive(true)
      setCurrentStep(0)
      setTargetRect(null)
    }
    window.addEventListener('psp-tour-start', handler)
    return () => window.removeEventListener('psp-tour-start', handler)
  }, [])

  // No tour definition for this page — show persistent "Tour Active" banner only
  if (!active) return null
  if (!tour || !step) {
    return (
      <TourActiveBanner onEnd={endTour} ending={ending} />
    )
  }

  // Compute card position
  const CARD_W = 360
  const CARD_H = 240
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
      {/* Persistent banner */}
      <TourActiveBanner onEnd={endTour} ending={ending} />

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
                    <p className="text-[12px] text-white/80 leading-relaxed">{step.message}</p>
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
        // Same page: dispatch event so TourHUD activates immediately without reload
        window.dispatchEvent(new CustomEvent('psp-tour-start'))
        setStarting(false)
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
