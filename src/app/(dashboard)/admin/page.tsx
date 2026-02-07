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
import { Lightbulb, AlertTriangle, CreditCard, ToggleLeft, ToggleRight } from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const { profile, isCoach, isAdmin, loading } = useUserRole()
  const isMasterAdmin = profile?.role === 'master_admin'

  // Stripe test mode state
  const [stripeTestMode, setStripeTestMode] = useState(false)
  const [testKeysConfigured, setTestKeysConfigured] = useState(false)
  const [togglingTestMode, setTogglingTestMode] = useState(false)
  const [testModeMessage, setTestModeMessage] = useState<string | null>(null)

  const [stats, setStats] = useState({
    totalAthletes: 0,
    activeSessions: 0,
    totalDrills: 0,
    pendingBookings: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([])
  const [loadingSessions, setLoadingSessions] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !profile) {
      router.push('/login')
    }
  }, [loading, profile, router])

  // Check if user is coach/admin (only redirect if we have a profile loaded)
  useEffect(() => {
    if (!loading && profile && !isCoach && !isAdmin) {
      console.log('Not admin/coach, redirecting to locker. Profile:', profile)
      router.push('/locker')
    }
  }, [loading, profile, isCoach, isAdmin, router])

  // Check Stripe test mode status (admin only)
  useEffect(() => {
    if (!profile || (profile.role !== 'master_admin' && profile.role !== 'admin')) return

    async function checkTestMode() {
      try {
        const res = await fetch('/api/stripe/test-mode')
        if (res.ok) {
          const data = await res.json()
          setStripeTestMode(data.testMode)
          setTestKeysConfigured(data.testKeyConfigured)
        }
      } catch (err) {
        console.error('Error checking test mode:', err)
      }
    }

    checkTestMode()
  }, [profile])

  const handleToggleTestMode = async () => {
    if (togglingTestMode) return

    const newMode = !stripeTestMode
    const confirmMsg = newMode
      ? 'Enable Stripe TEST MODE? All payments will use test keys — zero real charges will be processed.'
      : 'Disable test mode? Payments will switch back to LIVE mode with real charges.'

    if (!window.confirm(confirmMsg)) return

    setTogglingTestMode(true)
    setTestModeMessage(null)

    try {
      const res = await fetch('/api/stripe/test-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newMode }),
      })

      const data = await res.json()

      if (!res.ok) {
        setTestModeMessage(data.error || 'Failed to toggle test mode')
      } else {
        setStripeTestMode(data.testMode)
        setTestModeMessage(data.message)
        // Reload to update banner
        setTimeout(() => window.location.reload(), 1500)
      }
    } catch (err) {
      setTestModeMessage('Network error. Please try again.')
    } finally {
      setTogglingTestMode(false)
    }
  }

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

        // Get upcoming sessions count (coaches see only their sessions)
        let sessionsQuery = supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .in('status', ['confirmed', 'pending'])
          .gte('booking_date', new Date().toISOString().split('T')[0])

        if (!isAdmin && profile?.id) {
          sessionsQuery = sessionsQuery.eq('coach_id', profile.id)
        }
        const { count: sessionCount } = await sessionsQuery

        // Get total drills (coaches see only their drills)
        let drillsQuery = supabase
          .from('drills')
          .select('*', { count: 'exact', head: true })

        if (!isAdmin && profile?.id) {
          drillsQuery = drillsQuery.eq('created_by', profile.id)
        }
        const { count: drillCount } = await drillsQuery

        // Get pending bookings (coaches see only theirs)
        let pendingQuery = supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')

        if (!isAdmin && profile?.id) {
          pendingQuery = pendingQuery.eq('coach_id', profile.id)
        }
        const { count: pendingCount } = await pendingQuery

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

  // Load upcoming sessions
  useEffect(() => {
    if (!profile || !isCoach) return

    async function loadUpcomingSessions() {
      try {
        const supabase = createClient()
        const today = new Date().toISOString().split('T')[0]

        // Coaches see only their sessions, admins see all
        let sessionsQuery = supabase
          .from('bookings')
          .select(`
            id,
            booking_date,
            start_time,
            end_time,
            status,
            athlete:athlete_id (full_name),
            service:service_id (name)
          `)
          .in('status', ['confirmed', 'pending'])
          .gte('booking_date', today)
          .order('booking_date', { ascending: true })
          .order('start_time', { ascending: true })
          .limit(5)

        if (!isAdmin && profile?.id) {
          sessionsQuery = sessionsQuery.eq('coach_id', profile.id)
        }

        const { data: sessions, error } = await sessionsQuery

        if (error) {
          console.error('Error loading upcoming sessions:', error)
        } else {
          setUpcomingSessions(sessions || [])
        }
      } catch (error) {
        console.error('Error in loadUpcomingSessions:', error)
      } finally {
        setLoadingSessions(false)
      }
    }

    loadUpcomingSessions()
  }, [profile, isCoach])

  if (loading || loadingStats || !profile) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cyan-700 dark:text-white">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isCoach && !isAdmin) {
    return null // Will redirect to /locker
  }

  const quickActions = [
    {
      title: 'Create Drill',
      description: 'Add new drill to library',
      icon: Dumbbell,
      href: '/admin/drills',
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
      href: '/admin/athletes',
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
      href: '/settings',
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
        <p className="text-cyan-700 dark:text-white text-lg mb-4">
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
              <span className="text-sm text-cyan-700 dark:text-white">Total</span>
              <Tooltip content="Total number of athletes in your system. Click 'Athletes' in the sidebar to manage them or add new ones." />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats.totalAthletes}</p>
          <p className="text-sm text-cyan-700 dark:text-white">Active Athletes</p>
        </div>

        <div className="command-panel-active">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-cyan" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-cyan-700 dark:text-white">Upcoming</span>
              <Tooltip content="Shows confirmed and pending sessions scheduled in the future. Go to 'Bookings' to manage them." />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats.activeSessions}</p>
          <p className="text-sm text-cyan-700 dark:text-white">Scheduled Sessions</p>
        </div>

        <div className="command-panel-active">
          <div className="flex items-center justify-between mb-2">
            <Dumbbell className="w-8 h-8 text-green-400" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-cyan-700 dark:text-white">Library</span>
              <Tooltip content="Total drills in your library. Use 'Bulk Import' to add multiple YouTube videos at once (180x faster than manual entry!)" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats.totalDrills}</p>
          <p className="text-sm text-cyan-700 dark:text-white">Training Drills</p>
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
                <span className="text-sm text-cyan-700 dark:text-white">None</span>
              )}
              <Tooltip content="Bookings waiting for your approval. Click to review and confirm or cancel them." />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats.pendingBookings}</p>
          <p className="text-sm text-cyan-700 dark:text-white">Pending Bookings</p>
        </div>
      </div>

      {/* Upcoming Sessions Widget */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Upcoming Sessions</h2>
          <Link
            href="/admin/bookings"
            className="text-sm text-cyan hover:text-cyan/80 transition-colors flex items-center gap-1"
          >
            View All
            <TrendingUp className="w-4 h-4" />
          </Link>
        </div>

        {loadingSessions ? (
          <div className="command-panel">
            <div className="text-center py-8">
              <div className="w-8 h-8 border-3 border-cyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-cyan-700 dark:text-white">Loading sessions...</p>
            </div>
          </div>
        ) : upcomingSessions.length === 0 ? (
          <div className="command-panel">
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-cyan-700 dark:text-white mx-auto mb-3" />
              <p className="text-cyan-700 dark:text-white mb-2">No upcoming sessions scheduled</p>
              <p className="text-sm text-cyan-700 dark:text-white">Set your availability to start booking sessions</p>
              <Link href="/admin/availability" className="btn-primary mt-4 inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Set Availability
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {upcomingSessions.map((session) => {
              const sessionDate = new Date(session.booking_date)
              const formattedDate = sessionDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })
              const statusColor =
                session.status === 'confirmed'
                  ? 'bg-green-500/20 border-green-500/40 text-green-400'
                  : 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'

              return (
                <Link key={session.id} href={`/admin/bookings`}>
                  <div className="command-panel-active hover:border-cyan/30 transition-all group cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-cyan/10 border border-cyan/20 flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-cyan" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white group-hover:text-cyan transition-colors">
                            {session.athlete?.full_name || 'Unknown Athlete'}
                          </h3>
                          <p className="text-sm text-cyan-700 dark:text-white">
                            {session.service?.name || 'Training Session'}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusColor}`}
                      >
                        {session.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-cyan-700 dark:text-white">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formattedDate}
                      </div>
                      <div className="flex items-center gap-1">
                        <span>
                          {session.start_time} - {session.end_time}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
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
                  <p className="text-sm text-cyan-700 dark:text-white">{action.description}</p>
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
                    <span className="text-xs text-cyan-700 dark:text-white bg-cyan-900/30 px-2 py-1 rounded-lg">
                      {section.stat}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-sm text-cyan-700 dark:text-white">{section.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Stripe Test Mode - Admin Only */}
      {(isMasterAdmin || isAdmin) && (
        <div className="mt-8">
          <div className={`command-panel border-2 ${stripeTestMode ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-cyan-200/20'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stripeTestMode ? 'bg-yellow-500/20' : 'bg-cyan/10'}`}>
                  <CreditCard className={`w-6 h-6 ${stripeTestMode ? 'text-yellow-400' : 'text-cyan'}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Stripe Payment Mode</h3>
                  <p className="text-sm text-cyan-700 dark:text-white mb-2">
                    {stripeTestMode
                      ? 'TEST MODE — No real charges. Use card: 4242 4242 4242 4242, any future expiry, any CVC.'
                      : 'LIVE MODE — Real payments are being processed.'}
                  </p>
                  {!testKeysConfigured && (
                    <p className="text-xs text-orange">
                      Test keys not configured yet. Add your Stripe test keys to .env.local (or Vercel env vars) to enable test mode.
                    </p>
                  )}
                  {testModeMessage && (
                    <p className={`text-sm mt-2 font-semibold ${stripeTestMode ? 'text-yellow-400' : 'text-green-400'}`}>
                      {testModeMessage}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleToggleTestMode}
                disabled={togglingTestMode || (!testKeysConfigured && !stripeTestMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  stripeTestMode
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 hover:bg-yellow-500/30'
                    : 'bg-cyan/10 text-cyan border border-cyan/30 hover:bg-cyan/20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {togglingTestMode ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : stripeTestMode ? (
                  <ToggleRight className="w-5 h-5" />
                ) : (
                  <ToggleLeft className="w-5 h-5" />
                )}
                {stripeTestMode ? 'Switch to Live' : 'Enable Test Mode'}
              </button>
            </div>
            {stripeTestMode && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-400">
                  Test mode auto-expires after 4 hours. All users will see a yellow banner at the top of the site.
                  Bookings created in test mode use test payment intents and will not appear on your live Stripe dashboard.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="mt-8">
        <div className="command-panel">
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-cyan-900/20 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-sm text-cyan-700 dark:text-white">
                System ready for athlete management and drill creation
              </p>
            </div>
            <div className="text-center py-4">
              <p className="text-sm text-cyan-700 dark:text-white">Activity feed will populate as you use the platform</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
