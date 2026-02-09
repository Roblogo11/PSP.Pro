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
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { ThemeToggle } from '@/components/ui/theme-toggle'


interface NavItem {
  label: string
  mobileLabel: string
  href: string
  icon: React.ElementType
  color?: string
  badgeKey?: string
}

const athleteNavItems: NavItem[] = [
  { label: 'Dashboard', mobileLabel: 'Home', href: '/locker', icon: LayoutDashboard, color: 'text-orange-400' },
  { label: 'Start Training', mobileLabel: 'Train', href: '/drills', icon: Dumbbell, color: 'text-cyan-400' },
  { label: 'Sessions', mobileLabel: 'Sessions', href: '/sessions', icon: Calendar, color: 'text-purple-400', badgeKey: 'upcomingSessions' },
  { label: 'Progress', mobileLabel: 'Progress', href: '/progress', icon: TrendingUp, color: 'text-green-400' },
  { label: 'Achievements', mobileLabel: 'Awards', href: '/achievements', icon: Trophy, color: 'text-yellow-400' },
  { label: 'Buy Lessons', mobileLabel: 'Buy', href: '/booking', icon: Clock, color: 'text-blue-400', badgeKey: 'sessionsRemaining' },
  { label: 'Settings', mobileLabel: 'Settings', href: '/settings', icon: Settings, color: 'text-cyan-600' },
]

const adminNavItems: NavItem[] = [
  { label: 'Admin Home', mobileLabel: 'Admin', href: '/admin', icon: Shield, color: 'text-red-400' },
  { label: 'Services & Pricing', mobileLabel: 'Services', href: '/admin/services', icon: DollarSign, color: 'text-green-400' },
  { label: 'Courses', mobileLabel: 'Courses', href: '/admin/drills', icon: Dumbbell, color: 'text-purple-400' },
  { label: 'Athletes', mobileLabel: 'Athletes', href: '/admin/athletes', icon: Users, color: 'text-cyan-400' },
  { label: 'Calendar', mobileLabel: 'Calendar', href: '/admin/bookings', icon: Calendar, color: 'text-blue-400', badgeKey: 'pendingBookings' },
  { label: 'Media', mobileLabel: 'Media', href: '/admin/media', icon: Video, color: 'text-pink-400' },
  { label: 'Analytics', mobileLabel: 'Stats', href: '/admin/analytics', icon: BarChart3, color: 'text-green-400' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { profile, isCoach, isAdmin, loading } = useUserRole()

  // Badge counts
  const [badges, setBadges] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!profile?.id) return

    async function fetchBadges() {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]
      const counts: Record<string, number> = {}

      // Upcoming sessions for athletes
      const { count: upcomingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('athlete_id', profile!.id)
        .in('status', ['confirmed', 'pending'])
        .gte('booking_date', today)

      if (upcomingCount && upcomingCount > 0) {
        counts.upcomingSessions = upcomingCount
      }

      // Sessions remaining in active package
      const { data: activePkg } = await supabase
        .from('athlete_packages')
        .select('sessions_total, sessions_used')
        .eq('athlete_id', profile!.id)
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
  }, [profile?.id, isCoach, isAdmin])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut({ scope: 'local' })
    router.push('/')
  }

  // Determine which nav items to show
  const navItems = isCoach || isAdmin ? [...athleteNavItems, ...adminNavItems] : athleteNavItems

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

      {/* Mobile Bottom Navigation */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="lg:hidden fixed bottom-0 left-0 right-0 glass-card border-t border-cyan-200/40 z-50 mobile-safe"
      >
        <div className="flex items-center overflow-x-auto scrollbar-hide gap-0.5 px-1 py-1.5">
          {/* Theme Toggle - compact */}
          <div className="flex-shrink-0 flex flex-col items-center gap-1 px-1.5">
            <ThemeToggle />
          </div>

          {/* Athlete Nav Items */}
          {athleteNavItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`
                    flex flex-col items-center gap-0.5 p-1.5 rounded-xl min-w-[48px] flex-shrink-0 relative
                    ${
                      isActive
                        ? 'bg-orange/20 text-orange'
                        : 'text-slate-700 dark:text-white hover:text-slate-900 dark:hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[9px] font-medium leading-tight text-center whitespace-nowrap">{item.mobileLabel}</span>
                  {item.badgeKey && badges[item.badgeKey] ? (
                    <span className="absolute -top-0.5 -right-0.5 px-1 py-0 text-[8px] font-bold rounded-full min-w-[14px] text-center leading-[14px] bg-orange text-white">
                      {badges[item.badgeKey]}
                    </span>
                  ) : null}
                </motion.div>
              </Link>
            )
          })}

          {/* Admin separator + items (coaches/admins only) */}
          {(isCoach || isAdmin) && (
            <>
              <div className="flex-shrink-0 w-px h-8 bg-cyan-200/40 dark:bg-white/10 mx-1" />
              {adminNavItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      className={`
                        flex flex-col items-center gap-0.5 p-1.5 rounded-xl min-w-[48px] flex-shrink-0 relative
                        ${
                          isActive
                            ? 'bg-cyan/20 text-cyan'
                            : 'text-slate-700 dark:text-white hover:text-slate-900 dark:hover:text-white'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[9px] font-medium leading-tight text-center whitespace-nowrap">{item.mobileLabel}</span>
                      {item.badgeKey && badges[item.badgeKey] ? (
                        <span className="absolute -top-0.5 -right-0.5 px-1 py-0 text-[8px] font-bold rounded-full min-w-[14px] text-center leading-[14px] bg-orange text-white">
                          {badges[item.badgeKey]}
                        </span>
                      ) : null}
                    </motion.div>
                  </Link>
                )
              })}
            </>
          )}

          {/* Logout */}
          <div className="flex-shrink-0 w-px h-8 bg-cyan-200/40 dark:bg-white/10 mx-1" />
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl min-w-[48px] flex-shrink-0 text-red-400 hover:text-red-300"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-[9px] font-medium leading-tight text-center whitespace-nowrap">Logout</span>
          </button>
        </div>
      </motion.nav>

      {/* Spacer for desktop sidebar */}
      <div className="hidden lg:block" style={{ width: collapsed ? 80 : 280 }} />
    </>
  )
}
