'use client'

import { useState } from 'react'
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
  href: string
  icon: React.ElementType
  color?: string
}

const athleteNavItems: NavItem[] = [
  { label: 'My Dashboard', href: '/locker', icon: LayoutDashboard, color: 'text-orange-400' },
  { label: 'Training Drills', href: '/drills', icon: Dumbbell, color: 'text-cyan-400' },
  { label: 'My Sessions', href: '/sessions', icon: Calendar, color: 'text-purple-400' },
  { label: 'My Progress', href: '/progress', icon: TrendingUp, color: 'text-green-400' },
  { label: 'Achievements', href: '/achievements', icon: Trophy, color: 'text-yellow-400' },
  { label: 'Buy Lessons', href: '/booking', icon: Clock, color: 'text-blue-400' },
  { label: 'Settings', href: '/settings', icon: Settings, color: 'text-cyan-600' },
]

const adminNavItems: NavItem[] = [
  { label: 'Coaches', href: '/admin', icon: Shield, color: 'text-red-400' },
  { label: 'My Athletes', href: '/admin/athletes', icon: Users, color: 'text-cyan-400' },
  { label: 'Manage Trainings', href: '/admin/services', icon: DollarSign, color: 'text-green-400' },
  { label: 'Assign Courses', href: '/admin/drills', icon: Dumbbell, color: 'text-purple-400' },
  { label: 'Confirm Appointments', href: '/admin/bookings', icon: Calendar, color: 'text-blue-400' },
  { label: 'Media Library', href: '/admin/media', icon: Video, color: 'text-pink-400' },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, color: 'text-green-400' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { isCoach, isAdmin, loading } = useUserRole()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  // Determine which nav items to show
  const navItems = isCoach || isAdmin ? [...athleteNavItems, ...adminNavItems] : athleteNavItems

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
                    group flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200 cursor-pointer
                    ${
                      isActive
                        ? 'bg-orange/20 border border-orange/50 text-white shadow-glow-orange'
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
                        Admin Tools
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
                        group flex items-center gap-3 px-4 py-3 rounded-xl
                        transition-all duration-200 cursor-pointer
                        ${
                          isActive
                            ? 'bg-cyan/20 border border-cyan/50 text-white shadow-glow-cyan'
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
        <div className="flex items-center justify-around p-2">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`
                    flex flex-col items-center gap-1 p-3 rounded-xl min-w-[64px]
                    ${
                      isActive
                        ? 'bg-orange/20 text-orange'
                        : 'text-slate-700 dark:text-white hover:text-slate-900 dark:hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{item.label}</span>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </motion.nav>

      {/* Spacer for desktop sidebar */}
      <div className="hidden lg:block" style={{ width: collapsed ? 80 : 280 }} />
    </>
  )
}
