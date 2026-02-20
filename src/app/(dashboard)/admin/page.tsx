'use client'

import { useEffect, useState } from 'react'
import { toastSuccess, toastError } from '@/lib/toast'
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
  Building2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getLocalDateString } from '@/lib/utils/local-date'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { useRouter } from 'next/navigation'
import { Tooltip, InfoBanner } from '@/components/ui/tooltip'
import { Lightbulb, AlertTriangle, CreditCard, ToggleLeft, ToggleRight, UserCircle, Trash2, Eye, Search, XCircle as XCircleIcon, UserPlus } from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const { profile, isCoach, isAdmin, loading, realRole, isSimulating } = useUserRole()
  // Use real role for master admin checks (not simulated role)
  const isMasterAdmin = realRole === 'master_admin'

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
  // Master admins always have access even when simulating another role
  useEffect(() => {
    if (!loading && profile && !isCoach && !isAdmin && realRole !== 'master_admin') {
      console.log('Not admin/coach, redirecting to locker. Profile:', profile)
      router.push('/locker')
    }
  }, [loading, profile, isCoach, isAdmin, realRole, router])

  // Check Stripe test mode status (admin only)
  useEffect(() => {
    if (!profile || !isMasterAdmin) return

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
          .gte('booking_date', getLocalDateString())

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
        const today = getLocalDateString()

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
      <div className="min-h-screen px-3 py-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cyan-700 dark:text-white">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isCoach && !isAdmin && realRole !== 'master_admin') {
    return null // Will redirect to /locker
  }

  const quickActions = [
    {
      title: 'Book for Athlete',
      description: 'Reserve a slot for a client',
      icon: UserPlus,
      href: '/admin/bookings?action=book',
      color: '#F97316',
    },
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
      title: 'Courses',
      description: 'Create and organize training courses',
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
      title: 'Content Hub',
      description: 'Blog posts, videos, and media',
      icon: Video,
      href: '/admin/media',
      color: '#8B5CF6',
      stat: 'Manage Content',
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
      title: 'Organizations',
      description: 'Multi-tenant orgs & payouts',
      icon: Building2,
      href: '/admin/org',
      color: '#6366f1',
      stat: 'Manage Orgs',
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
    <div className="min-h-screen px-3 py-4 md:p-8 pb-24 lg:pb-8 relative">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white">
            Admin <span className="text-gradient-orange">Control Center</span>
          </h1>
          <Link
            href="/admin/bookings?action=book"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange hover:bg-orange/90 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-orange/20 hover:shadow-orange/30 whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            Book for Athlete
          </Link>
        </div>
        <p className="text-cyan-700 dark:text-white text-lg mb-4">
          Manage your athletes, drills, and content from one place
        </p>

        {/* Smart Welcome Guide */}
        <InfoBanner
          title={`Hey ${profile?.full_name?.split(' ')[0] || 'Coach'}!`}
          description={
            stats.pendingBookings > 0
              ? `You have ${stats.pendingBookings} pending booking${stats.pendingBookings === 1 ? '' : 's'} to confirm. ${stats.activeSessions > 0 ? `${stats.activeSessions} upcoming session${stats.activeSessions === 1 ? '' : 's'} on the calendar.` : 'Check your calendar to stay on track.'}`
              : stats.totalDrills === 0
              ? 'Get started by adding drills to your library (bulk import is 180x faster!), then invite athletes and set your availability.'
              : stats.totalAthletes === 0
              ? `You have ${stats.totalDrills} drill${stats.totalDrills === 1 ? '' : 's'} ready. Next step: invite athletes and set your availability to start booking sessions.`
              : stats.activeSessions === 0
              ? `${stats.totalAthletes} athlete${stats.totalAthletes === 1 ? '' : 's'} registered, ${stats.totalDrills} drill${stats.totalDrills === 1 ? '' : 's'} in the library. Set your availability to start booking sessions!`
              : `${stats.totalAthletes} athlete${stats.totalAthletes === 1 ? '' : 's'}, ${stats.activeSessions} upcoming session${stats.activeSessions === 1 ? '' : 's'}, ${stats.totalDrills} drill${stats.totalDrills === 1 ? '' : 's'} in the library. Everything updates in real-time.`
          }
          icon={<Lightbulb className="w-5 h-5" />}
          color={stats.pendingBookings > 0 ? 'orange' : 'blue'}
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.title} href={action.href}>
                <div className="glass-card-hover p-4 md:p-6 group cursor-pointer h-full">
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-3 md:mb-4 group-hover:shadow-glow-orange transition-all"
                    style={{ backgroundColor: `${action.color}20`, borderColor: `${action.color}40` }}
                  >
                    <Icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: action.color }} />
                  </div>
                  <h3 className="text-sm md:text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-orange transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs md:text-sm text-cyan-700 dark:text-white">{action.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
        <div className="command-panel-active">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-6 h-6 md:w-8 md:h-8 text-orange" />
            <span className="text-xs text-cyan-700 dark:text-white hidden md:inline">Total</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats.totalAthletes}</p>
          <p className="text-xs md:text-sm text-cyan-700 dark:text-white">Athletes</p>
        </div>

        <div className="command-panel-active">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-6 h-6 md:w-8 md:h-8 text-cyan" />
            <span className="text-xs text-cyan-700 dark:text-white hidden md:inline">Upcoming</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats.activeSessions}</p>
          <p className="text-xs md:text-sm text-cyan-700 dark:text-white">Sessions</p>
        </div>

        <div className="command-panel-active">
          <div className="flex items-center justify-between mb-2">
            <Dumbbell className="w-6 h-6 md:w-8 md:h-8 text-green-400" />
            <span className="text-xs text-cyan-700 dark:text-white hidden md:inline">Library</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats.totalDrills}</p>
          <p className="text-xs md:text-sm text-cyan-700 dark:text-white">Drills</p>
        </div>

        <div className="command-panel-active">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
            {stats.pendingBookings > 0 ? (
              <span className="px-1.5 py-0.5 bg-orange/20 border border-orange/40 rounded-full text-[10px] md:text-xs text-orange font-semibold">
                {stats.pendingBookings}
              </span>
            ) : (
              <span className="text-xs text-cyan-700 dark:text-white hidden md:inline">None</span>
            )}
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats.pendingBookings}</p>
          <p className="text-xs md:text-sm text-cyan-700 dark:text-white">Pending</p>
        </div>
      </div>

      {/* Upcoming Sessions Widget */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Upcoming Sessions</h2>
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
                          <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-cyan transition-colors">
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

      {/* Admin Sections */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Platform Management</h2>
        <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {adminSections.map((section) => {
            const Icon = section.icon
            return (
              <Link key={section.title} href={section.href}>
                <div className="command-panel hover:border-orange/30 transition-all group cursor-pointer flex items-center gap-4 md:block">
                  <div className="flex items-center justify-between md:mb-4">
                    <div
                      className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${section.color}20`, borderColor: `${section.color}40` }}
                    >
                      <Icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: section.color }} />
                    </div>
                    <span className="text-xs text-cyan-700 dark:text-white bg-cyan-900/30 px-2 py-1 rounded-lg hidden md:inline">
                      {section.stat}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 md:mb-2">
                      <h3 className="text-base md:text-xl font-bold text-slate-900 dark:text-white group-hover:text-orange transition-colors">
                        {section.title}
                      </h3>
                      <span className="text-[10px] text-cyan-700 dark:text-white bg-cyan-900/30 px-1.5 py-0.5 rounded md:hidden">
                        {section.stat}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-cyan-700 dark:text-white">{section.description}</p>
                  </div>
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
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Stripe Payment Mode</h3>
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

      {/* Simulation Mode - Master Admin Only */}
      {isMasterAdmin && <SimulationPanel />}

      {/* Recent Activity */}
      <div className="mt-8">
        <div className="command-panel">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
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

// ─── Simulation Mode Panel (unified: Act as Player = impersonation, Act as Coach = simulation) ───
function SimulationPanel() {
  // Simulation state
  const [simStatus, setSimStatus] = useState<{
    active: boolean
    simulatedRole: string | null
    simulationId: string | null
    pastSessions: any[]
  } | null>(null)
  const [startingSim, setStartingSim] = useState(false)
  const [cleaningUp, setCleaningUp] = useState<string | null>(null)

  // Impersonation (Act as Player) state
  const [showPlayerSelect, setShowPlayerSelect] = useState(false)
  const [athletes, setAthletes] = useState<{ id: string; full_name: string | null; email: string }[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingAthletes, setLoadingAthletes] = useState(false)
  const [startingImpersonation, setStartingImpersonation] = useState<string | null>(null)
  const [impersonationStatus, setImpersonationStatus] = useState<{
    active: boolean
    userId: string | null
    userName: string | null
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Check both simulation + impersonation status on mount
  useEffect(() => {
    async function checkStatus() {
      try {
        const [simRes, impRes] = await Promise.all([
          fetch('/api/admin/simulation'),
          fetch('/api/admin/impersonation'),
        ])
        if (simRes.ok) setSimStatus(await simRes.json())
        if (impRes.ok) setImpersonationStatus(await impRes.json())
      } catch {
        // Non-critical
      }
    }
    checkStatus()
  }, [])

  // Fetch athletes when player selector is opened
  useEffect(() => {
    if (!showPlayerSelect || athletes.length > 0) return

    async function fetchAthletes() {
      setLoadingAthletes(true)
      try {
        const { data } = await createClient()
          .from('profiles')
          .select('id, full_name, email')
          .eq('role', 'athlete')
          .order('full_name', { ascending: true })

        if (data) {
          setAthletes(data.map((a: any) => ({ ...a, email: a.email || '' })))
        }
      } catch {
        // Non-critical
      } finally {
        setLoadingAthletes(false)
      }
    }
    fetchAthletes()
  }, [showPlayerSelect])

  // ── Simulation handlers ──
  const startSimulation = async (role: 'athlete' | 'coach') => {
    const roleLabel = role === 'athlete' ? 'Player' : 'Coach'
    const confirmed = window.confirm(
      `Start simulation as ${roleLabel}?\n\n` +
      `• Stripe test mode will be enabled automatically\n` +
      `• All data you create will be tracked for cleanup\n` +
      `• The site will render as if you are a ${roleLabel}\n\n` +
      `You can end the simulation and clean up at any time.`
    )
    if (!confirmed) return

    setStartingSim(true)
    try {
      const res = await fetch('/api/admin/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })

      if (res.ok) {
        window.location.href = '/locker'
      }
    } catch {
      setStartingSim(false)
    }
  }

  const cleanupSession = async (simulationId: string) => {
    const confirmed = window.confirm(
      'Clean up this simulation?\n\n' +
      'All data created during this simulation session will be permanently deleted ' +
      'and any test Stripe payments will be refunded.'
    )
    if (!confirmed) return

    setCleaningUp(simulationId)
    try {
      if (simStatus?.simulationId === simulationId) {
        await fetch('/api/admin/simulation', { method: 'DELETE' })
      }

      const res = await fetch('/api/admin/simulation/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulationId }),
      })

      if (res.ok) {
        const data = await res.json()
        const totalCleaned = Object.values(data.summary as Record<string, number>).reduce((a, b) => a + b, 0)
        toastSuccess(
          `Cleanup complete! ` +
          `${totalCleaned} record${totalCleaned === 1 ? '' : 's'} deleted` +
          (data.stripeRefunds > 0 ? `. ${data.stripeRefunds} Stripe refund${data.stripeRefunds === 1 ? '' : 's'} processed` : '')
        )
        window.location.reload()
      }
    } catch {
      toastError('Cleanup failed. Please try again.')
    } finally {
      setCleaningUp(null)
    }
  }

  // ── Impersonation handlers ──
  const startImpersonation = async (userId: string) => {
    setStartingImpersonation(userId)
    setError(null)
    try {
      const res = await fetch('/api/admin/impersonation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to start impersonation')
        setStartingImpersonation(null)
        return
      }

      window.location.href = '/locker'
    } catch {
      setError('Network error. Please try again.')
      setStartingImpersonation(null)
    }
  }

  const endImpersonation = async () => {
    try {
      await fetch('/api/admin/impersonation', { method: 'DELETE' })
      window.location.reload()
    } catch {
      // Non-critical
    }
  }

  const filteredAthletes = searchTerm
    ? athletes.filter(a =>
        (a.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        a.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : athletes

  const isSimActive = simStatus?.active
  const isImpActive = impersonationStatus?.active
  const isAnyActive = isSimActive || isImpActive
  const pastUncleaned = simStatus?.pastSessions?.filter(s => !s.cleaned_up && s.id !== simStatus?.simulationId) || []

  // Determine border color based on active mode
  const borderClass = isImpActive
    ? 'border-amber-500/50 bg-amber-500/5'
    : isSimActive
    ? 'border-purple-500/50 bg-purple-500/5'
    : 'border-purple-500/20'

  return (
    <div className="mt-8">
      <div className={`command-panel border-2 ${borderClass}`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isImpActive ? 'bg-amber-500/30' : isSimActive ? 'bg-purple-500/30' : 'bg-purple-500/10'}`}>
            {isImpActive ? (
              <Eye className="w-6 h-6 text-amber-300" />
            ) : (
              <UserCircle className={`w-6 h-6 ${isSimActive ? 'text-purple-600 dark:text-purple-300' : 'text-purple-400'}`} />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Simulation Mode</h3>

            {/* ── Active impersonation state ── */}
            {isImpActive && (
              <>
                <p className="text-sm text-cyan-700 dark:text-white mb-4">
                  Viewing as <span className="font-bold text-amber-400">{impersonationStatus?.userName}</span>.
                  Read-only mode — no data can be modified.
                </p>
                <button
                  onClick={endImpersonation}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
                >
                  <XCircleIcon className="w-4 h-4" />
                  Exit View
                </button>
              </>
            )}

            {/* ── Active simulation state ── */}
            {isSimActive && !isImpActive && (
              <>
                <p className="text-sm text-cyan-700 dark:text-white mb-4">
                  You are currently simulating as <span className="font-bold text-purple-400">{simStatus?.simulatedRole === 'athlete' ? 'Player' : 'Coach'}</span>.
                  Stripe test mode is active. All data is being tracked.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => simStatus?.simulationId && cleanupSession(simStatus.simulationId)}
                    disabled={!!cleaningUp}
                    className="btn-primary bg-purple-600 hover:bg-purple-700 border-purple-500 flex items-center gap-2"
                  >
                    {cleaningUp ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    End & Clean Up
                  </button>
                </div>
              </>
            )}

            {/* ── Inactive: show action buttons ── */}
            {!isAnyActive && (
              <>
                <p className="text-sm text-cyan-700 dark:text-white mb-4">
                  Experience the site as a different role. Choose how you want to interact.
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => setShowPlayerSelect(!showPlayerSelect)}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                      showPlayerSelect
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    Act as Player
                  </button>
                  <button
                    onClick={() => { setShowPlayerSelect(false); startSimulation('coach') }}
                    disabled={startingSim}
                    className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 dark:text-purple-300 border border-purple-500/50 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {startingSim && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    Act as Coach
                  </button>
                </div>

                {/* ── Player selector (expanded when Act as Player is clicked) ── */}
                {showPlayerSelect && (
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <p className="text-sm text-amber-400 font-semibold mb-3">
                      Select a player to view their dashboard (read-only)
                    </p>

                    {/* Search */}
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-700 dark:text-white" />
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-cyan-50/50 dark:bg-white/5 border border-cyan-200/40 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder-cyan-700 dark:placeholder-white/50 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    {/* Athlete List */}
                    {loadingAthletes ? (
                      <div className="text-center py-4">
                        <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                      </div>
                    ) : filteredAthletes.length === 0 ? (
                      <p className="text-sm text-cyan-700 dark:text-white text-center py-4">
                        {searchTerm ? 'No players match your search' : 'No athletes registered yet'}
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {filteredAthletes.map(athlete => (
                          <div
                            key={athlete.id}
                            className="flex items-center justify-between p-3 bg-cyan-50/50 dark:bg-white/5 border border-cyan-200/40 dark:border-white/10 rounded-xl hover:border-amber-500/30 transition-all"
                          >
                            <div>
                              <p className="font-semibold text-sm text-slate-900 dark:text-white">
                                {athlete.full_name || 'Unnamed Player'}
                              </p>
                              <p className="text-xs text-cyan-700 dark:text-white">{athlete.email}</p>
                            </div>
                            <button
                              onClick={() => startImpersonation(athlete.id)}
                              disabled={startingImpersonation === athlete.id}
                              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5"
                            >
                              {startingImpersonation === athlete.id ? (
                                <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                              View Dashboard
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Past uncleaned simulations */}
        {pastUncleaned.length > 0 && (
          <div className="mt-4 pt-4 border-t border-purple-500/20">
            <p className="text-xs font-semibold text-purple-400 mb-2">Past simulations needing cleanup:</p>
            <div className="space-y-2">
              {pastUncleaned.map(session => (
                <div key={session.id} className="flex items-center justify-between p-2 bg-purple-500/10 rounded-lg">
                  <div className="text-xs text-cyan-700 dark:text-white">
                    <span className="font-semibold">{session.simulated_role === 'athlete' ? 'Player' : 'Coach'}</span>
                    {' — '}
                    {new Date(session.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </div>
                  <button
                    onClick={() => cleanupSession(session.id)}
                    disabled={cleaningUp === session.id}
                    className="text-xs px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 dark:text-purple-300 rounded-lg transition-all disabled:opacity-50"
                  >
                    {cleaningUp === session.id ? 'Cleaning...' : 'Clean Up'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info note */}
        <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-purple-600 dark:text-purple-300">
            <strong>Act as Player</strong> — read-only view of a specific player&apos;s dashboard (no data created, amber banner, 2hr expiry).
            <br />
            <strong>Act as Coach</strong> — full simulation with Stripe test mode and tracked test data (purple banner, 4hr expiry, one-click cleanup).
          </p>
        </div>
      </div>
    </div>
  )
}
