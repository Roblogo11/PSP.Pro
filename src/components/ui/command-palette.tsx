'use client'

import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Home,
  Video,
  Zap,
  Globe,
  Rocket,
  Camera,
  Mic,
  BookOpen,
  Users,
  DollarSign,
  Mail,
  Plane,
  TrendingUp,
  Sparkles,
  Wrench,
  RefreshCw,
} from 'lucide-react'
import { ALL_ROUTES, FUNNEL_ROUTES, SPOKE_ROUTES } from '@/config/navigation'
import { useNavigation } from '@/components/navigation/nav-context'
import { getTransitionDirection } from '@/config/navigation'
import { usePathname } from 'next/navigation'

const iconMap: Record<string, React.ElementType> = {
  '/': Home,
  '/video': Video,
  '/shock-kit': Zap,
  '/website-help': Globe,
  '/get-started': Rocket,
  '/drone': Plane,
  '/photography': Camera,
  '/podcast': Mic,
  '/blog': BookOpen,
  '/about': Users,
  '/pricing': DollarSign,
  '/contact': Mail,
  '/seo': TrendingUp,
  '/motion-graphics': Sparkles,
  '/digital-builds': Globe,
  '/website-redesign': RefreshCw,
  '/website-fix': Wrench,
}

export function CommandPalette() {
  const router = useRouter()
  const pathname = usePathname()
  const { setNavigationDirection } = useNavigation()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  // Toggle command palette with Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSelect = useCallback(
    (path: string) => {
      const direction = getTransitionDirection(pathname, path)
      setNavigationDirection(direction)
      setOpen(false)
      setSearch('')
      router.push(path)
    },
    [router, pathname, setNavigationDirection]
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setOpen(false)}
          />

          {/* Command Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-xl z-50 px-4"
          >
            <Command
              className="bg-dark-100 border border-secondary/20 rounded-xl shadow-2xl shadow-secondary/10 overflow-hidden"
              loop
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 border-b border-secondary/10">
                <Search className="w-5 h-5 text-secondary/60" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Search pages..."
                  className="flex-1 py-4 bg-transparent text-white placeholder:text-gray-700 dark:text-gray-400 outline-none text-lg"
                />
                <kbd className="px-2 py-1 text-xs text-gray-700 dark:text-gray-400 bg-dark-200 rounded border border-secondary/10">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <Command.List className="max-h-80 overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-gray-700 dark:text-gray-400">
                  No results found.
                </Command.Empty>

                {/* Funnel Routes */}
                <Command.Group
                  heading={
                    <span className="px-2 py-2 text-xs font-semibold text-secondary uppercase tracking-wider">
                      Quick Navigation
                    </span>
                  }
                >
                  {FUNNEL_ROUTES.map((route) => {
                    const Icon = iconMap[route.path] || Home
                    return (
                      <Command.Item
                        key={route.path}
                        value={`${route.name} ${route.keywords.join(' ')}`}
                        onSelect={() => handleSelect(route.path)}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer text-gray-600 dark:text-gray-300 data-[selected=true]:bg-secondary/20 data-[selected=true]:text-white transition-colors"
                      >
                        <Icon className="w-5 h-5 text-secondary" />
                        <span className="font-medium">{route.name}</span>
                        {route.path === '/' && (
                          <span className="ml-auto text-xs text-gray-700 dark:text-gray-400">Start</span>
                        )}
                      </Command.Item>
                    )
                  })}
                </Command.Group>

                {/* Spoke Routes by Category */}
                {['Services', 'Resources', 'Company'].map((category) => {
                  const categoryRoutes = SPOKE_ROUTES.filter((r) => r.category === category)
                  if (categoryRoutes.length === 0) return null

                  return (
                    <Command.Group
                      key={category}
                      heading={
                        <span className="px-2 py-2 text-xs font-semibold text-accent/80 uppercase tracking-wider">
                          {category}
                        </span>
                      }
                    >
                      {categoryRoutes.map((route) => {
                        const Icon = iconMap[route.path] || Globe
                        return (
                          <Command.Item
                            key={route.path}
                            value={`${route.name} ${route.keywords.join(' ')}`}
                            onSelect={() => handleSelect(route.path)}
                            className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer text-gray-600 dark:text-gray-300 data-[selected=true]:bg-accent/20 data-[selected=true]:text-white transition-colors"
                          >
                            <Icon className="w-5 h-5 text-accent/80" />
                            <span className="font-medium">{route.name}</span>
                          </Command.Item>
                        )
                      })}
                    </Command.Group>
                  )
                })}
              </Command.List>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-secondary/10 text-xs text-gray-700 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-dark-200 rounded">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-dark-200 rounded">↓</kbd>
                    <span className="ml-1">Navigate</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-dark-200 rounded">↵</kbd>
                    <span className="ml-1">Select</span>
                  </span>
                </div>
                <span className="text-secondary/60">ShockAI OS</span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
