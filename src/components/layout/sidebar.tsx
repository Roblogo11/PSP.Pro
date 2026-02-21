'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Dumbbell,
  Calendar,
  TrendingUp,
  Clock,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
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
  MoreHorizontal,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getLocalDateString } from '@/lib/utils/local-date'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { ThemeToggle } from '@/components/ui/theme-toggle'


interface NavItem {
  label: string
  subLabel?: string
  mobileLabel: string
  href: string
  icon: React.ElementType
  color?: string
  badgeKey?: string
}

const athleteNavItems: NavItem[] = [
  { label: 'Dashboard', mobileLabel: 'Home', href: '/locker', icon: LayoutDashboard, color: 'text-orange-400' },
  { label: 'Messages', mobileLabel: 'Chat', href: '/messages', icon: MessageCircle, color: 'text-blue-400', badgeKey: 'unreadMessages' },
  { label: 'Drills', subLabel: '(members only)', mobileLabel: 'Drills', href: '/drills', icon: Dumbbell, color: 'text-cyan-400' },
  { label: 'Progress', mobileLabel: 'Progress', href: '/progress', icon: TrendingUp, color: 'text-green-400' },
  { label: 'Report', mobileLabel: 'Report', href: '/progress-report', icon: FileBarChart, color: 'text-indigo-400' },
  { label: 'Achievements', mobileLabel: 'Awards', href: '/achievements', icon: Trophy, color: 'text-yellow-400' },
  { label: 'Leaderboards', mobileLabel: 'Ranks', href: '/leaderboards', icon: Medal, color: 'text-amber-400' },
  { label: 'My Lessons', mobileLabel: 'Lessons', href: '/sessions', icon: Calendar, color: 'text-purple-400', badgeKey: 'upcomingSessions' },
  { label: 'Book Lessons', mobileLabel: 'Book', href: '/booking', icon: Clock, color: 'text-blue-400', badgeKey: 'sessionsRemaining' },
  { label: 'Courses', mobileLabel: 'Courses', href: '/courses', icon: BookOpen, color: 'text-pink-400' },
  { label: 'Pop Quiz', mobileLabel: 'Quiz', href: '/questionnaires', icon: ClipboardCheck, color: 'text-emerald-400' },
  { label: 'Video Analysis', mobileLabel: 'Video', href: '/video-analysis', icon: Video, color: 'text-red-400' },
  { label: 'Settings', mobileLabel: 'Settings', href: '/settings', icon: Settings, color: 'text-cyan-600' },
]

const adminNavItems: NavItem[] = [
  { label: 'Admin Home', mobileLabel: 'Admin', href: '/admin', icon: Shield, color: 'text-red-400' },
  { label: 'Calendar', subLabel: '(Confirm/Book)', mobileLabel: 'Calendar', href: '/admin/bookings', icon: Calendar, color: 'text-blue-400', badgeKey: 'pendingBookings' },
  { label: 'Lesson Builder', mobileLabel: 'Builder', href: '/admin/services', icon: DollarSign, color: 'text-green-400' },
  { label: 'Manage Athletes', mobileLabel: 'Athletes', href: '/admin/athletes', icon: Users, color: 'text-cyan-400' },
  { label: 'Drills', mobileLabel: 'Drills', href: '/admin/drills', icon: Dumbbell, color: 'text-purple-400' },
  { label: 'Courses', mobileLabel: 'Courses', href: '/admin/courses', icon: BookOpen, color: 'text-pink-400' },
  { label: 'Pop Quiz', mobileLabel: 'Quiz', href: '/admin/questionnaires', icon: ClipboardCheck, color: 'text-emerald-400' },
  { label: 'Content', mobileLabel: 'Content', href: '/admin/media', icon: Newspaper, color: 'text-pink-400' },
  { label: 'Analytics', mobileLabel: 'Stats', href: '/admin/analytics', icon: BarChart3, color: 'text-green-400' },
  { label: 'Promo Codes', mobileLabel: 'Promos', href: '/admin/promos', icon: Tag, color: 'text-orange-400' },
  { label: 'Data Import', mobileLabel: 'Import', href: '/admin/imports', icon: Upload, color: 'text-purple-400' },
  { label: 'Organizations', mobileLabel: 'Orgs', href: '/admin/org', icon: Building2, color: 'text-indigo-400' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { profile, isCoach, isAdmin, isImpersonating, impersonatedUserId, loading } = useUserRole()


  // Badge counts
  const [badges, setBadges] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!profile?.id) return

    // Use impersonated user ID for athlete badge counts
    const effectiveUserId = impersonatedUserId || profile!.id

    async function fetchBadges() {
      const supabase = createClient()
      const today = getLocalDateString()
      const counts: Record<string, number> = {}

      // Unread messages (for all users)
      try {
        const { data: myConvs } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', effectiveUserId)

        if (myConvs && myConvs.length > 0) {
          const convIds = myConvs.map((c: any) => c.conversation_id)
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .in('conversation_id', convIds)
            .neq('sender_id', effectiveUserId)
            .is('read_at', null)
          if (unreadCount && unreadCount > 0) counts.unreadMessages = unreadCount
        }
      } catch {}

      // Athlete-specific badges (skip for staff unless impersonating)
      if (!isCoach && !isAdmin || impersonatedUserId) {
        // Upcoming sessions for athletes
        const { count: upcomingCount } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('athlete_id', effectiveUserId)
          .in('status', ['confirmed', 'pending'])
          .gte('booking_date', today)

        if (upcomingCount && upcomingCount > 0) {
          counts.upcomingSessions = upcomingCount
        }

        // Sessions remaining in active package
        const { data: activePkg } = await supabase
          .from('athlete_packages')
          .select('sessions_total, sessions_used')
          .eq('athlete_id', effectiveUserId)
          .eq('is_active', true)
          .gte('expires_at', new Date().toISOString())
          .order('expires_at', { ascending: false })
          .limit(1)
          .single()

        if (activePkg) {
          const remaining = activePkg.sessions_total - activePkg.sessions_used
          if (remaining > 0) {
            counts.sessionsRemaining = remaining
          }
        }
      }

      // Pending bookings for coaches/admins
      if (isCoach || isAdmin) {
        let pendingQuery = supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')

        if (!isAdmin && profile?.id) {
          pendingQuery = pendingQuery.eq('coach_id', profile.id)
        }

        const { count: pendingCount } = await pendingQuery
        if (pendingCount && pendingCount > 0) {
          counts.pendingBookings = pendingCount
        }
      }

      setBadges(counts)
    }

    fetchBadges()
  }, [profile?.id, isCoach, isAdmin, impersonatedUserId])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut({ scope: 'local' })
    router.push('/')
  }

  // Badge renderer
  const renderBadge = (item: NavItem, isCollapsed: boolean) => {
    if (!item.badgeKey || !badges[item.badgeKey]) return null
    const count = badges[item.badgeKey]
    const isSessions = item.badgeKey === 'sessionsRemaining'
    return (
      <span className={`
        ${isCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto'}
        px-1.5 py-0.5 text-[10px] font-bold rounded-full min-w-[18px] text-center leading-tight
        ${isSessions
          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
          : item.badgeKey === 'pendingBookings'
          ? 'bg-orange/20 text-orange border border-orange/30'
          : 'bg-cyan/20 text-cyan border border-cyan/30'
        }
      `}>
        {count}
      </span>
    )
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col fixed left-0 top-0 h-screen glass-card border-r border-cyan-200/40 z-50"
      >
        {/* Logo & Brand */}
        <div className="flex items-center justify-between p-6 border-b border-cyan-200/40">
          <Link href="/" className="w-full">
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="w-10 h-10 bg-gradient-velocity rounded-xl flex items-center justify-center shadow-glow-orange group-hover:scale-105 transition-transform">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="font-display text-lg font-bold text-slate-800 dark:text-white group-hover:text-orange transition-colors">
                      PSP.Pro
                    </h1>
                    <p className="text-xs text-cyan-700 dark:text-white">PSP.Pro</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {collapsed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="w-10 h-10 bg-gradient-velocity rounded-xl flex items-center justify-center shadow-glow-orange mx-auto hover:scale-105 transition-transform cursor-pointer"
              >
                <Zap className="w-6 h-6 text-white" />
              </motion.div>
            )}
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* Athlete Navigation */}
          {athleteNavItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    group flex items-center gap-3 px-4 py-3 rounded-xl relative
                    transition-all duration-200 cursor-pointer
                    ${
                      isActive
                        ? 'bg-orange/20 border border-orange/50 text-slate-900 dark:text-white shadow-glow-orange'
                        : 'text-slate-700 dark:text-white hover:bg-cyan-50/50 dark:hover:text-white hover:text-slate-900'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${collapsed ? 'mx-auto' : ''} ${item.color || 'text-slate-700 dark:text-white'}`} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-medium whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                        {item.subLabel && <span className="text-[10px] ml-1 opacity-60 font-normal">{item.subLabel}</span>}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {renderBadge(item, collapsed)}
                </motion.div>
              </Link>
            )
          })}

          {/* Admin Navigation (Coaches Only) */}
          {(isCoach || isAdmin) && (
            <>
              {/* Separator */}
              <div className="py-2">
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="px-4 py-2"
                    >
                      <p className="text-xs font-bold text-cyan-800 dark:text-white uppercase tracking-wider">
                        Admin Tools 👈
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                {collapsed && (
                  <div className="h-px bg-white/10 mx-2" />
                )}
              </div>

              {/* Admin Nav Items */}
              {adminNavItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        group flex items-center gap-3 px-4 py-3 rounded-xl relative
                        transition-all duration-200 cursor-pointer
                        ${
                          isActive
                            ? 'bg-cyan/20 border border-cyan/50 text-slate-900 dark:text-white shadow-glow-cyan'
                            : 'text-slate-700 dark:text-white hover:bg-cyan-50/50 dark:hover:text-white hover:text-slate-900'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 ${collapsed ? 'mx-auto' : ''} ${item.color || 'text-slate-700 dark:text-white'}`} />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className="font-medium whitespace-nowrap overflow-hidden"
                          >
                            {item.label}
                            {item.subLabel && <span className="text-[10px] ml-1 opacity-60 font-normal">{item.subLabel}</span>}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {renderBadge(item, collapsed)}
                    </motion.div>
                  </Link>
                )
              })}
            </>
          )}
        </nav>

        {/* Theme Toggle, Collapse & Logout */}
        <div className="p-4 border-t border-cyan-200/40 space-y-2">
          {/* Theme Toggle */}
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-2 py-2 rounded-lg bg-gradient-to-r from-cyan/10 to-orange/10 border border-cyan/20`}>
            {!collapsed && (
              <span className="text-sm font-medium bg-gradient-to-r from-cyan to-orange bg-clip-text text-transparent">Theme</span>
            )}
            <ThemeToggle />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-orange/10 hover:bg-orange/20 text-orange hover:text-orange-400 border border-orange/30 hover:border-orange/50 transition-all duration-200"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">Collapse</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl
              bg-red-500/10 hover:bg-red-500/20
              border border-red-500/30 hover:border-red-500/60
              transition-all duration-200 shadow-sm hover:shadow-red-500/20
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut className="w-5 h-5 text-red-300 hover:text-red-200" />
            {!collapsed && <span className="font-medium text-red-300 hover:text-red-200">Logout</span>}
          </motion.button>
        </div>
      </motion.aside>

      {/* Mobile Bottom Navigation — 5-tab + More sheet */}
      <MobileBottomNav
        pathname={pathname}
        badges={badges}
        isCoach={isCoach}
        isAdmin={isAdmin}
        handleLogout={handleLogout}
      />

      {/* Spacer for desktop sidebar */}
      <div className="hidden lg:block" style={{ width: collapsed ? 80 : 280 }} />
    </>
  )
}

/* ─── Mobile Bottom Navigation ─── */

// Primary tabs shown in the fixed bottom bar
const primaryMobileTabs: NavItem[] = [
  athleteNavItems[0],  // Home/Dashboard
  athleteNavItems[1],  // Messages/Chat
  athleteNavItems[7],  // My Lessons (Calendar)
  athleteNavItems[3],  // Progress
]

// Remaining athlete items for the "More" sheet
const remainingAthleteItems = athleteNavItems.filter(
  (_, i) => ![0, 1, 7, 3].includes(i)
)

function MobileBottomNav({
  pathname,
  badges,
  isCoach,
  isAdmin,
  handleLogout,
}: {
  pathname: string
  badges: Record<string, number>
  isCoach: boolean
  isAdmin: boolean
  handleLogout: () => void
}) {
  const [moreSheetOpen, setMoreSheetOpen] = useState(false)

  // Check if active route is in the "More" sheet (not a primary tab)
  const primaryHrefs = primaryMobileTabs.map((t) => t.href)
  const isMoreActive = !primaryHrefs.includes(pathname) && pathname !== '/'

  return (
    <>
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 mobile-safe"
      >
        <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/90 border-t border-cyan-200/30 dark:border-white/10 shadow-[0_-4px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_30px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-around px-2 py-2">
            {primaryMobileTabs.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    className={`
                      flex flex-col items-center justify-center
                      min-w-[56px] min-h-[44px] rounded-2xl px-3 py-1.5 relative
                      transition-colors duration-200
                      ${isActive
                        ? 'text-orange'
                        : 'text-slate-500 dark:text-slate-400'
                      }
                    `}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="mobileActiveTab"
                        className="absolute -top-1 w-8 h-1 rounded-full bg-orange"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    <Icon className={`w-5 h-5 ${isActive ? 'text-orange' : ''}`} />
                    <span className={`text-[11px] font-medium mt-0.5 ${isActive ? 'text-orange font-semibold' : ''}`}>
                      {item.mobileLabel}
                    </span>
                    {item.badgeKey && badges[item.badgeKey] ? (
                      <span className="absolute -top-1 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold rounded-full bg-orange text-white">
                        {badges[item.badgeKey]}
                      </span>
                    ) : null}
                  </motion.div>
                </Link>
              )
            })}

            {/* More button */}
            <button onClick={() => setMoreSheetOpen(true)}>
              <motion.div
                whileTap={{ scale: 0.85 }}
                className={`
                  flex flex-col items-center justify-center
                  min-w-[56px] min-h-[44px] rounded-2xl px-3 py-1.5 relative
                  transition-colors duration-200
                  ${isMoreActive
                    ? 'text-orange'
                    : 'text-slate-500 dark:text-slate-400'
                  }
                `}
              >
                {isMoreActive && (
                  <motion.div
                    layoutId="mobileActiveTab"
                    className="absolute -top-1 w-8 h-1 rounded-full bg-orange"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <MoreHorizontal className={`w-5 h-5 ${isMoreActive ? 'text-orange' : ''}`} />
                <span className={`text-[11px] font-medium mt-0.5 ${isMoreActive ? 'text-orange font-semibold' : ''}`}>More</span>
              </motion.div>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* More Sheet */}
      <AnimatePresence>
        {moreSheetOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreSheetOpen(false)}
              className="lg:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-[61] bg-white dark:bg-slate-900 rounded-t-3xl border-t border-cyan-200/30 dark:border-white/10 shadow-[0_-8px_40px_rgba(0,0,0,0.2)] mobile-safe max-h-[75vh] overflow-y-auto"
            >
              {/* Drag handle */}
              <div className="flex justify-center py-3">
                <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20" />
              </div>

              <div className="px-4 pb-6">
                {/* Training section */}
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-1">
                  Training
                </p>
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {remainingAthleteItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setMoreSheetOpen(false)}>
                        <div className={`
                          flex flex-col items-center gap-1.5 p-3 rounded-2xl
                          transition-colors relative
                          ${isActive
                            ? 'bg-orange/10 dark:bg-orange/20'
                            : 'active:bg-slate-100 dark:active:bg-white/5'
                          }
                        `}>
                          <div className={`
                            w-11 h-11 rounded-xl flex items-center justify-center
                            ${isActive
                              ? 'bg-orange/20 dark:bg-orange/30'
                              : 'bg-slate-100 dark:bg-white/10'
                            }
                          `}>
                            <Icon className={`w-5 h-5 ${isActive ? 'text-orange' : (item.color || 'text-slate-600 dark:text-slate-300')}`} />
                          </div>
                          <span className={`text-[11px] font-medium text-center leading-tight ${isActive ? 'text-orange' : 'text-slate-700 dark:text-slate-300'}`}>
                            {item.mobileLabel}
                          </span>
                          {item.badgeKey && badges[item.badgeKey] ? (
                            <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold rounded-full bg-orange text-white">
                              {badges[item.badgeKey]}
                            </span>
                          ) : null}
                        </div>
                      </Link>
                    )
                  })}
                </div>

                {/* Admin section (coaches/admins only) */}
                {(isCoach || isAdmin) && (
                  <>
                    <div className="h-px bg-slate-200 dark:bg-white/10 mb-4" />
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-1">
                      Admin Tools
                    </p>
                    <div className="grid grid-cols-4 gap-3 mb-6">
                      {adminNavItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                          <Link key={item.href} href={item.href} onClick={() => setMoreSheetOpen(false)}>
                            <div className={`
                              flex flex-col items-center gap-1.5 p-3 rounded-2xl
                              transition-colors relative
                              ${isActive
                                ? 'bg-cyan/10 dark:bg-cyan/20'
                                : 'active:bg-slate-100 dark:active:bg-white/5'
                              }
                            `}>
                              <div className={`
                                w-11 h-11 rounded-xl flex items-center justify-center
                                ${isActive
                                  ? 'bg-cyan/20 dark:bg-cyan/30'
                                  : 'bg-slate-100 dark:bg-white/10'
                                }
                              `}>
                                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan' : (item.color || 'text-slate-600 dark:text-slate-300')}`} />
                              </div>
                              <span className={`text-[11px] font-medium text-center leading-tight ${isActive ? 'text-cyan' : 'text-slate-700 dark:text-slate-300'}`}>
                                {item.mobileLabel}
                              </span>
                              {item.badgeKey && badges[item.badgeKey] ? (
                                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold rounded-full bg-orange text-white">
                                  {badges[item.badgeKey]}
                                </span>
                              ) : null}
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </>
                )}

                {/* Theme toggle + Logout */}
                <div className="h-px bg-slate-200 dark:bg-white/10 mb-4" />
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Theme</span>
                  </div>
                  <button
                    onClick={() => { setMoreSheetOpen(false); handleLogout() }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 text-sm font-medium active:scale-95 transition-transform"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
