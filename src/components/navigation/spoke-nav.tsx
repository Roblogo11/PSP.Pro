'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Calendar, Zap, Users, BookOpen, Home } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useNavigation } from './nav-context'

type SpokePage = 'coaches' | 'coach-profile' | 'memberships' | 'vault' | 'faq' | 'blog'

interface SpokeNavConfig {
  back: { label: string; path: string; icon?: React.ComponentType<{ className?: string }> }
  forward: { label: string; path: string; icon?: React.ComponentType<{ className?: string }> }
  /** Short label shown on the left describing where you are */
  context: string
}

const SPOKE_CONFIGS: Record<SpokePage, SpokeNavConfig> = {
  coaches: {
    back: { label: 'Pricing', path: '/pricing', icon: ArrowLeft },
    forward: { label: 'Book a Session', path: '/get-started', icon: Calendar },
    context: 'Meet the Coaches',
  },
  'coach-profile': {
    back: { label: 'All Coaches', path: '/coaches', icon: Users },
    forward: { label: 'Book This Coach', path: '/get-started', icon: Calendar },
    context: 'Coach Profile',
  },
  memberships: {
    back: { label: 'Pricing', path: '/pricing', icon: ArrowLeft },
    forward: { label: 'Join the Team', path: '/get-started', icon: Zap },
    context: 'Membership Plans',
  },
  vault: {
    back: { label: 'Home', path: '/', icon: Home },
    forward: { label: 'Join the Team', path: '/get-started', icon: Zap },
    context: 'Velocity Vault',
  },
  faq: {
    back: { label: 'Home', path: '/', icon: Home },
    forward: { label: 'Join the Team', path: '/get-started', icon: ArrowRight },
    context: 'FAQ',
  },
  blog: {
    back: { label: 'Home', path: '/', icon: Home },
    forward: { label: 'Join the Team', path: '/get-started', icon: ArrowRight },
    context: 'Training Tips',
  },
}

interface SpokeNavProps {
  page: SpokePage
  /** Override the forward path (e.g. pass coach ID for booking) */
  forwardPath?: string
  /** Override the forward label */
  forwardLabel?: string
}

export function SpokeNav({ page, forwardPath, forwardLabel }: SpokeNavProps) {
  const router = useRouter()
  const { setNavigationDirection } = useNavigation()
  const config = SPOKE_CONFIGS[page]

  const resolvedForwardPath = forwardPath ?? config.forward.path
  const resolvedForwardLabel = forwardLabel ?? config.forward.label

  const BackIcon = config.back.icon ?? ArrowLeft
  const ForwardIcon = config.forward.icon ?? ArrowRight

  const handleBack = () => {
    setNavigationDirection(-1)
    router.push(config.back.path)
  }

  const handleForward = () => {
    setNavigationDirection(1)
    router.push(resolvedForwardPath)
  }

  return (
    <>
      {/* Spacer */}
      <div className="h-20" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4, type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50"
      >
        <div className="bg-dark-100/95 backdrop-blur-xl border-t border-secondary/20 shadow-2xl shadow-black/50">
          <div className="max-w-5xl mx-auto px-4 py-3">

            {/* Desktop layout */}
            <div className="hidden md:flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <button
                  onClick={handleBack}
                  className="group flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dark-200/80 border border-secondary/10 hover:border-secondary/30 hover:bg-dark-200 transition-all duration-200"
                >
                  <BackIcon className="w-3.5 h-3.5 text-gray-400 group-hover:text-secondary transition-all" />
                  <span className="text-xs text-gray-400 group-hover:text-white transition-colors">{config.back.label}</span>
                </button>
              </div>

              <span className="text-xs font-semibold text-gray-500 tracking-wide uppercase">{config.context}</span>

              <button
                onClick={handleForward}
                className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 shadow-lg shadow-secondary/30 hover:shadow-secondary/50 hover:scale-[1.02] transition-all duration-300"
              >
                <span className="text-sm font-semibold text-white">{resolvedForwardLabel}</span>
                <ForwardIcon className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Mobile layout */}
            <div className="md:hidden flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 shrink-0">
                <ThemeToggle />
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-secondary transition-colors active:scale-95"
                >
                  <BackIcon className="w-3 h-3" />
                  <span className="max-w-[60px] truncate">{config.back.label}</span>
                </button>
              </div>

              <span className="text-xs font-semibold text-gray-500 truncate px-2">{config.context}</span>

              <button
                onClick={handleForward}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-secondary to-accent shadow-md shadow-secondary/30 active:scale-95 transition-all shrink-0"
              >
                <span className="text-xs font-bold text-white">{resolvedForwardLabel}</span>
                <ForwardIcon className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

          </div>
        </div>
      </motion.div>
    </>
  )
}
