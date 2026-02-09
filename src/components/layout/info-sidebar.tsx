'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Info,
  Rocket,
  BookOpen,
  Mail,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
  Home,
  Package,
  LayoutDashboard,
  LogIn,
} from 'lucide-react'
import { useUserRole } from '@/lib/hooks/use-user-role'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { label: 'About PSP.Pro', href: '/about', icon: Info },
  { label: 'Pricing', href: '/pricing', icon: Package },
  { label: 'Join the Team', href: '/get-started', icon: Rocket },
  { label: 'Blog & Tips', href: '/blog', icon: BookOpen },
  { label: 'Contact Us', href: '/contact', icon: Mail },
  { label: 'FAQ', href: '/faq', icon: HelpCircle },
  { label: 'Thank You', href: '/thank-you', icon: Zap },
]

export function InfoSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { profile, isCoach, isAdmin } = useUserRole()

  // Build dynamic nav items based on auth state
  const dynamicNavItems: NavItem[] = profile
    ? [
        { label: 'Your Dashboard', href: (isCoach || isAdmin) ? '/admin' : '/locker', icon: LayoutDashboard },
        ...navItems,
      ]
    : [
        ...navItems,
        { label: 'Login', href: '/login', icon: LogIn },
      ]

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col fixed left-0 top-0 h-screen pb-20 glass-card border-r border-cyan-700/30 z-50"
      >
        {/* Logo & Brand - Clickable to Home */}
        <Link href="/" className="flex items-center justify-between p-6 border-b border-cyan-700/30 hover:bg-cyan-900/20 transition-colors cursor-pointer group">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-orange to-cyan rounded-xl flex items-center justify-center shadow-glow-orange group-hover:shadow-glow-orange-intense transition-shadow">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-display text-lg font-bold text-slate-800 dark:text-white group-hover:text-orange transition-colors">
                    PSP.Pro
                  </h1>
                  <p className="text-xs text-cyan-700 dark:text-white group-hover:text-cyan transition-colors">PSP.Pro</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {collapsed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="w-10 h-10 bg-gradient-to-br from-orange to-cyan rounded-xl flex items-center justify-center shadow-glow-orange mx-auto group-hover:shadow-glow-orange-intense transition-shadow"
            >
              <Zap className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </Link>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {dynamicNavItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200 cursor-pointer
                    ${
                      isActive
                        ? 'bg-orange/20 border border-orange/50 text-slate-900 dark:text-white shadow-glow-orange'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-cyan-900/20 dark:hover:text-white hover:text-slate-900'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${collapsed ? 'mx-auto' : ''} ${isActive ? 'text-orange' : 'text-slate-700 dark:text-slate-300'}`} />
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
        </nav>

        {/* Collapse Toggle & Back Home */}
        <div className="p-4 border-t border-cyan-700/30 space-y-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-cyan-900/20 hover:bg-white/10 text-slate-700 dark:text-white hover:text-slate-900 dark:hover:text-white transition-all duration-200"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-slate-700 dark:text-white" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-white" />
                <span className="font-medium">Collapse</span>
              </>
            )}
          </motion.button>

          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                bg-cyan-900/20 hover:bg-cyan/20 text-slate-700 dark:text-slate-300 hover:text-cyan
                border border-transparent hover:border-cyan/50
                transition-all duration-200
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <Home className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              {!collapsed && <span className="font-medium">Back Home</span>}
            </motion.button>
          </Link>
        </div>
      </motion.aside>

      {/* Mobile Bottom Navigation */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="lg:hidden fixed bottom-0 left-0 right-0 glass-card border-t border-cyan-700/30 z-50 mobile-safe"
      >
        <div className="flex items-center overflow-x-auto scrollbar-hide gap-1 px-2 py-2">
          {dynamicNavItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`
                    flex flex-col items-center gap-0.5 p-2 rounded-xl min-w-[56px] flex-shrink-0
                    ${
                      isActive
                        ? 'bg-orange/20 text-orange'
                        : 'text-slate-700 dark:text-white hover:text-slate-900 dark:hover:text-white'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-orange' : 'text-slate-700 dark:text-white'}`} />
                  <span className="text-[10px] font-medium leading-tight text-center whitespace-nowrap">{item.label.split(' ')[0]}</span>
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
