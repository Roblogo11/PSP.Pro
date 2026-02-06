'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users,
  Dumbbell,
  Calendar,
  Video,
  TrendingUp,
  Plus,
  FileText,
  Award,
  Settings as SettingsIcon,
  BarChart3,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { useRouter } from 'next/navigation'
import { Tooltip, InfoBanner } from '@/components/ui/tooltip'
import { Lightbulb } from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const { profile, isCoach, isAdmin, loading } = useUserRole()
  const [stats, setStats] = useState({
    totalAthletes: 0,
    activeSessions: 0,
    totalDrills: 0,
    pendingBookings: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)

  // Check if user is coach/admin (only redirect if we have a profile loaded)
  useEffect(() => {
    if (!loading && profile && !isCoach && !isAdmin) {
      console.log('Not admin/coach, redirecting to locker. Profile:', profile)
      router.push('/locker')
    }
  }, [loading, profile, isCoach, isAdmin, router])

  // Load admin stats
  useEffect(() => {
    console.log('Admin page - Profile:', profile, 'isCoach:', isCoach, 'isAdmin:', isAdmin)
    if (!profile || !isCoach) return

    async function loadAdminStats() {
      try {
        const supabase = createClient()

        // Get athlete count
        const { count: athleteCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'athlete')

        // Get upcoming sessions count
        const { count: sessionCount } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .in('status', ['confirmed', 'pending'])
          .gte('booking_date', new Date().toISOString().split('T')[0])

        // Get total drills
        const { count: drillCount } = await supabase
          .from('drills')
          .select('*', { count: 'exact', head: true })

        // Get pending bookings
        const { count: pendingCount } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')

        setStats({
          totalAthletes: athleteCount || 0,
          activeSessions: sessionCount || 0,
          totalDrills: drillCount || 0,
          pendingBookings: pendingCount || 0,
        })
      } catch (error) {
        console.error('Error loading admin stats:', error)
      } finally {
        setLoadingStats(false)
      }
    }

    loadAdminStats()
  }, [profile, isCoach])

  if (loading || loadingStats) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isCoach && !isAdmin) {
    return null // Will redirect
  }

  const quickActions = [
    {
      title: 'Create Drill',
      description: 'Add new drill to library',
      icon: Dumbbell,
      href: '/admin/drills/new',
      color: '#B8301A',
    },
    {
      title: 'Schedule Session',
      description: 'Set availability slots',
      icon: Calendar,
      href: '/admin/availability',
      color: '#00B4D8',
    },
    {
      title: 'Add Athlete',
      description: 'Invite new athlete',
      icon: Users,
      href: '/admin/athletes/new',
      color: '#10B981',
    },
    {
      title: 'Upload Video',
      description: 'Add training content',
      icon: Video,
      href: '/admin/media',
      color: '#F59E0B',
    },
  ]

  const adminSections = [
    {
      title: 'Athlete Management',
      description: 'View and manage all athletes',
      icon: Users,
      href: '/admin/athletes',
      color: '#B8301A',
      stat: `${stats.totalAthletes} Athletes`,
    },
    {
      title: 'Drill Bank',
      description: 'Create and organize drills',
      icon: Dumbbell,
      href: '/admin/drills',
      color: '#00B4D8',
      stat: `${stats.totalDrills} Drills`,
    },
    {
      title: 'Session Schedule',
      description: 'Manage bookings and availability',
      icon: Calendar,
      href: '/admin/bookings',
      color: '#10B981',
      stat: `${stats.activeSessions} Upcoming`,
    },
    {
      title: 'Content Library',
      description: 'Videos, images, and media',
      icon: Video,
      href: '/admin/media',
      color: '#8B5CF6',
      stat: 'Manage Files',
    },
    {
      title: 'Analytics',
      description: 'Performance insights',
      icon: BarChart3,
      href: '/admin/analytics',
      color: '#F59E0B',
      stat: 'View Reports',
    },
    {
      title: 'Platform Settings',
      description: 'Configure system settings',
      icon: SettingsIcon,
      href: '/admin/settings',
      color: '#6B7280',
      stat: 'Configure',
    },
  ]

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24 lg:pb-8 relative">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
          Admin <span className="text-gradient-orange">Control Center</span>
        </h1>
        <p className="text-slate-400 text-lg mb-4">
          Manage your athletes, drills, and content from one place
        </p>

        {/* Welcome Guide */}
        <InfoBanner
          title="Welcome to Your Command Center!"
          description="Start by adding drills (bulk import is 180x faster!), then invite athletes, and approve their bookings. Everything updates in real-time."
          icon={<Lightbulb className="w-5 h-5" />}
          color="blue"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="command-panel-active">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-orange" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Total</span>
              <Tooltip content="Total number of athletes in your system. Click 'Athletes' in the sidebar to manage them or add new ones." />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats.totalAthletes}</p>
          <p className="text-sm text-slate-400">Active Athletes</p>
        </div>

        <div className="command-panel-active">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-cyan" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Upcoming</span>
              <Tooltip content="Shows confirmed and pending sessions scheduled in the future. Go to 'Bookings' to manage them." />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats.activeSessions}</p>
          <p className="text-sm text-slate-400">Scheduled Sessions</p>
        </div>

        <div className="command-panel-active">
          <div className="flex items-center justify-between mb-2">
            <Dumbbell className="w-8 h-8 text-green-400" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Library</span>
              <Tooltip content="Total drills in your library. Use 'Bulk Import' to add multiple YouTube videos at once (180x faster than manual entry!)" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats.totalDrills}</p>
          <p className="text-sm text-slate-400">Training Drills</p>
        </div>

        <div className="command-panel-active">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-yellow-400" />
            <div className="flex items-center gap-2">
              {stats.pendingBookings > 0 ? (
                <span className="px-2 py-1 bg-orange/20 border border-orange/40 rounded-full text-xs text-orange font-semibold">
                  {stats.pendingBookings} Pending
                </span>
              ) : (
                <span className="text-sm text-slate-400">None</span>
              )}
              <Tooltip content="Bookings waiting for your approval. Click to review and confirm or cancel them." />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats.pendingBookings}</p>
          <p className="text-sm text-slate-400">Pending Bookings</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.title} href={action.href}>
                <div className="glass-card-hover p-6 group cursor-pointer">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:shadow-glow-orange transition-all"
                    style={{ backgroundColor: `${action.color}20`, borderColor: `${action.color}40` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: action.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-orange transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-slate-400">{action.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Admin Sections */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Platform Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminSections.map((section) => {
            const Icon = section.icon
            return (
              <Link key={section.title} href={section.href}>
                <div className="command-panel hover:border-orange/30 transition-all group cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${section.color}20`, borderColor: `${section.color}40` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: section.color }} />
                    </div>
                    <span className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded-lg">
                      {section.stat}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-sm text-slate-400">{section.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <div className="command-panel">
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-sm text-slate-300">
                System ready for athlete management and drill creation
              </p>
            </div>
            <div className="text-center py-4">
              <p className="text-sm text-slate-400">Activity feed will populate as you use the platform</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
