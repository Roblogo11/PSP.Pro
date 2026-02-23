'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Dumbbell,
  Calendar,
  TrendingUp,
  Clock,
  Settings,
  Zap,
  Trophy,
  Users,
  Video,
  BarChart3,
  Shield,
  DollarSign,
  BookOpen,
  ClipboardCheck,
  Newspaper,
  Medal,
  Building2,
  MessageCircle,
  FileBarChart,
  Tag,
  Upload,
  ArrowRight,
  ChevronLeft,
  Compass,
} from 'lucide-react'
import { useUserRole } from '@/lib/hooks/use-user-role'

interface GuideStep {
  label: string
  href: string
  icon: React.ElementType
  color: string
  description: string
}

interface GuideCategory {
  id: string
  title: string
  subtitle: string
  icon: React.ElementType
  accentColor: string
  accentBg: string
  steps: GuideStep[]
}

const athleteCategories: GuideCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    subtitle: 'First steps on your training journey',
    icon: Zap,
    accentColor: 'text-orange',
    accentBg: 'bg-orange/15',
    steps: [
      { label: 'Dashboard', href: '/locker', icon: LayoutDashboard, color: 'text-orange-400', description: 'Your home base. Velocity charts, next session, progress rings, and activity feed — all in one place.' },
      { label: 'Book Lessons', href: '/booking', icon: Clock, color: 'text-blue-400', description: 'Browse services, pick a date and time slot, and pay securely with Stripe or on-site. Packages save you more.' },
      { label: 'My Lessons', href: '/sessions', icon: Calendar, color: 'text-purple-400', description: 'All your upcoming and past sessions. RSVP, cancel, reschedule, or sync to your calendar in one tap.' },
    ],
  },
  {
    id: 'track-growth',
    title: 'Track Your Growth',
    subtitle: 'See how far you\'ve come',
    icon: TrendingUp,
    accentColor: 'text-green-400',
    accentBg: 'bg-green-400/15',
    steps: [
      { label: 'Progress', href: '/progress', icon: TrendingUp, color: 'text-green-400', description: 'Performance metrics across all sports. Time-series charts show how your velocity, exit velo, and more are trending.' },
      { label: 'Report', href: '/progress-report', icon: FileBarChart, color: 'text-indigo-400', description: 'AI-generated performance summary — what\'s improving, what needs work, and your coach\'s notes.' },
      { label: 'Achievements', href: '/achievements', icon: Trophy, color: 'text-yellow-400', description: 'Unlock badges by completing sessions, finishing drills, maintaining streaks, and hitting milestones.' },
      { label: 'Leaderboards', href: '/leaderboards', icon: Medal, color: 'text-amber-400', description: 'See where you rank. Filter by sport, metric, or time period across all verified athletes.' },
    ],
  },
  {
    id: 'train-learn',
    title: 'Train & Learn',
    subtitle: 'Sharpen your skills off the field',
    icon: Dumbbell,
    accentColor: 'text-cyan',
    accentBg: 'bg-cyan/15',
    steps: [
      { label: 'Drills', href: '/drills', icon: Dumbbell, color: 'text-cyan-400', description: 'Browse video drills by category and difficulty. Members get the full library assigned by their coach.' },
      { label: 'Courses', href: '/courses', icon: BookOpen, color: 'text-pink-400', description: 'Structured video courses with lesson-by-lesson progress tracking. Learn at your own pace.' },
      { label: 'Pop Quiz', href: '/questionnaires', icon: ClipboardCheck, color: 'text-emerald-400', description: 'Coach-assigned quizzes to test your knowledge. See scores and track improvement over time.' },
      { label: 'Video Analysis', href: '/video-analysis', icon: Video, color: 'text-red-400', description: 'Upload pitching or hitting videos for coach review. Get frame-by-frame feedback on mechanics.' },
    ],
  },
  {
    id: 'stay-connected',
    title: 'Stay Connected',
    subtitle: 'Communication and account',
    icon: MessageCircle,
    accentColor: 'text-blue-400',
    accentBg: 'bg-blue-400/15',
    steps: [
      { label: 'Messages', href: '/messages', icon: MessageCircle, color: 'text-blue-400', description: 'Real-time chat with your coaches. Ask questions, share updates, stay in the loop between sessions.' },
      { label: 'Settings', href: '/settings', icon: Settings, color: 'text-cyan-600', description: 'Profile, notifications, security, privacy. Export or delete your data anytime.' },
    ],
  },
]

const coachCategories: GuideCategory[] = [
  {
    id: 'command-center',
    title: 'Your Command Center',
    subtitle: 'Manage your athletes and schedule',
    icon: Shield,
    accentColor: 'text-red-400',
    accentBg: 'bg-red-400/15',
    steps: [
      { label: 'Admin Home', href: '/admin', icon: Shield, color: 'text-red-400', description: 'Your command center. Athlete counts, active sessions, pending bookings, and quick actions at a glance.' },
      { label: 'Calendar', href: '/admin/bookings', icon: Calendar, color: 'text-blue-400', description: 'Calendar view of all bookings. Confirm requests, log performance metrics per sport after each session.' },
      { label: 'Manage Athletes', href: '/admin/athletes', icon: Users, color: 'text-cyan-400', description: 'Full athlete roster with individual stats, drill assignments, and course enrollment tracking.' },
    ],
  },
  {
    id: 'build-content',
    title: 'Build Training Content',
    subtitle: 'Create drills, courses, and quizzes',
    icon: BookOpen,
    accentColor: 'text-purple-400',
    accentBg: 'bg-purple-400/15',
    steps: [
      { label: 'Lesson Builder', href: '/admin/services', icon: DollarSign, color: 'text-green-400', description: 'Create and edit coaching services with custom pricing, duration, and Stripe integration.' },
      { label: 'Drills', href: '/admin/drills', icon: Dumbbell, color: 'text-purple-400', description: 'Create, publish, and assign video drills to individuals or groups.' },
      { label: 'Courses', href: '/admin/courses', icon: BookOpen, color: 'text-pink-400', description: 'Build video courses with lessons, set pricing, and track athlete enrollment.' },
      { label: 'Pop Quiz', href: '/admin/questionnaires', icon: ClipboardCheck, color: 'text-emerald-400', description: 'Create knowledge quizzes. Review athlete scores and spot areas that need more coaching.' },
    ],
  },
  {
    id: 'grow-business',
    title: 'Grow Your Business',
    subtitle: 'Analytics, promos, and content',
    icon: BarChart3,
    accentColor: 'text-green-400',
    accentBg: 'bg-green-400/15',
    steps: [
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, color: 'text-green-400', description: 'Revenue, booking trends, athlete growth, and session metrics — see what\'s driving your business.' },
      { label: 'Promo Codes', href: '/admin/promos', icon: Tag, color: 'text-orange-400', description: 'Discount codes with percentage or flat amounts, usage limits, and expiration dates.' },
      { label: 'Organizations', href: '/admin/org', icon: Building2, color: 'text-indigo-400', description: 'Organization branding, team members, and Stripe Connect payouts.' },
      { label: 'Content', href: '/admin/media', icon: Newspaper, color: 'text-pink-400', description: 'Blog posts and gallery media to keep your public site fresh and engaging.' },
    ],
  },
  {
    id: 'import-tools',
    title: 'Import & Tools',
    subtitle: 'Bring in external data',
    icon: Upload,
    accentColor: 'text-indigo-400',
    accentBg: 'bg-indigo-400/15',
    steps: [
      { label: 'Data Import', href: '/admin/imports', icon: Upload, color: 'text-purple-400', description: 'Bulk import metrics from Rapsodo, Blast Motion, Pocket Radar, and HitTrax via CSV.' },
      { label: 'Lesson Builder', href: '/admin/services', icon: DollarSign, color: 'text-green-400', description: 'Configure service pricing, duration, and availability for your coaching sessions.' },
    ],
  },
]

function CategoryCard({ category, onSelect }: { category: GuideCategory; onSelect: (id: string) => void }) {
  const Icon = category.icon
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(category.id)}
      className="command-panel p-5 sm:p-6 text-left w-full group cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${category.accentBg} flex-shrink-0`}>
          <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${category.accentColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-orange dark:group-hover:text-orange transition-colors">
            {category.title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-white/60 mb-3">{category.subtitle}</p>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 dark:text-white/40">
            {category.steps.map((step, i) => (
              <span key={step.href} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-orange font-bold">→</span>}
                <span>{step.label}</span>
              </span>
            ))}
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-slate-300 dark:text-white/20 group-hover:text-orange transition-colors flex-shrink-0 mt-1" />
      </div>
    </motion.button>
  )
}

function StepCard({ step, stepNumber }: { step: GuideStep; stepNumber: number }) {
  const Icon = step.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: stepNumber * 0.08 }}
      className="command-panel p-5"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange/20 flex items-center justify-center">
          <span className="text-sm font-bold text-orange">{stepNumber}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Icon className={`w-5 h-5 ${step.color}`} />
            <h4 className="font-bold text-slate-900 dark:text-white">{step.label}</h4>
          </div>
          <p className="text-xs text-slate-400 dark:text-white/40 font-mono mb-2">
            Sidebar → {step.label}
          </p>
          <p className="text-sm text-slate-600 dark:text-white/70 leading-relaxed mb-3">
            {step.description}
          </p>
          <Link
            href={step.href}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange hover:text-orange-300 transition-colors"
          >
            Go There
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

function CategoryDetail({ category, onBack }: { category: GuideCategory; onBack: () => void }) {
  const Icon = category.icon
  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-white/60 hover:text-orange transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to categories
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-xl ${category.accentBg}`}>
          <Icon className={`w-8 h-8 ${category.accentColor}`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{category.title}</h2>
          <p className="text-sm text-slate-500 dark:text-white/60">{category.subtitle}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-8 px-1">
        {category.steps.map((step, i) => (
          <span key={step.href} className="flex items-center gap-2">
            {i > 0 && <span className="text-xl text-orange font-bold">→</span>}
            <span className="text-sm font-semibold text-slate-700 dark:text-white/80">{step.label}</span>
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {category.steps.map((step, index) => (
          <StepCard key={step.href} step={step} stepNumber={index + 1} />
        ))}
      </div>
    </div>
  )
}

export default function GuidePage() {
  const { isCoach, isAdmin, loading } = useUserRole()
  const [activeTab, setActiveTab] = useState<'athlete' | 'coach'>('athlete')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = activeTab === 'athlete' ? athleteCategories : coachCategories
  const selected = categories.find(c => c.id === selectedCategory)

  if (loading) {
    return (
      <div className="min-h-screen px-3 py-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 dark:text-white/60">Loading guide...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-3 py-4 md:p-8 pb-24 lg:pb-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-teal-400/15">
              <Compass className="w-6 h-6 text-teal-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white">
              Play-by-Play <span className="text-gradient-orange">Guide</span>
            </h1>
          </div>
          <p className="text-slate-500 dark:text-white/60 text-base sm:text-lg ml-[52px] sm:ml-0">
            Tap a category to see what you can do and where to find it
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => { setActiveTab('athlete'); setSelectedCategory(null) }}
            className={`px-4 sm:px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'athlete'
                ? 'bg-orange/20 text-orange border border-orange/40'
                : 'text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            Athlete Guide
          </button>
          {(isCoach || isAdmin) && (
            <button
              onClick={() => { setActiveTab('coach'); setSelectedCategory(null) }}
              className={`px-4 sm:px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'coach'
                  ? 'bg-cyan/20 text-cyan border border-cyan/40'
                  : 'text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              Coach Guide
            </button>
          )}
        </div>

        {/* Content: Category Grid or Detail */}
        <AnimatePresence mode="wait">
          {!selected ? (
            <motion.div
              key={`grid-${activeTab}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {categories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} onSelect={setSelectedCategory} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={`detail-${selected.id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <CategoryDetail category={selected} onBack={() => setSelectedCategory(null)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chatbot CTA */}
        <div className="mt-12 command-panel p-6 sm:p-8 text-center">
          <MessageCircle className="w-10 h-10 text-cyan mx-auto mb-3" />
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Still have questions?
          </h3>
          <p className="text-sm text-slate-500 dark:text-white/60 max-w-lg mx-auto">
            Tap the chat bubble in the bottom-right corner for instant, context-aware help from our PSP Guide.
          </p>
        </div>
      </div>
    </div>
  )
}
