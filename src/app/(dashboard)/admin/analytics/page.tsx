'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUserRole } from '@/lib/hooks/use-user-role'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Activity,
  BarChart3,
  Clock,
  Target,
  Award,
} from 'lucide-react'

interface AnalyticsData {
  totalRevenue: number
  revenueGrowth: number
  totalBookings: number
  bookingsGrowth: number
  activeAthletes: number
  athletesGrowth: number
  avgSessionsPerAthlete: number
  completionRate: number
  popularDrills: Array<{ name: string; count: number }>
  recentBookings: Array<any>
  monthlyRevenue: Array<{ month: string; amount: number }>
}

export default function AnalyticsPage() {
  const router = useRouter()
  const { profile, isCoach, isAdmin, loading } = useUserRole()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  // Redirect if not authenticated or not admin/coach
  useEffect(() => {
    if (!loading && !profile) {
      router.push('/login')
    } else if (!loading && profile && !isCoach && !isAdmin) {
      router.push('/locker')
    }
  }, [loading, profile, isCoach, isAdmin, router])

  // Load analytics data
  useEffect(() => {
    if (!profile || (!isCoach && !isAdmin)) return

    async function loadAnalytics() {
      try {
        const supabase = createClient()
        const now = new Date()
        const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
        const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]

        // Calculate previous period for growth comparison
        const prevStartDate = new Date(
          now.getTime() - daysAgo * 2 * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split('T')[0]

        // Total Revenue (current period)
        const { data: currentRevenue } = await supabase
          .from('bookings')
          .select('price')
          .gte('booking_date', startDate)
          .eq('status', 'confirmed')

        const totalRevenue =
          currentRevenue?.reduce((sum, b) => sum + (b.price || 0), 0) || 0

        // Previous period revenue for growth calculation
        const { data: prevRevenue } = await supabase
          .from('bookings')
          .select('price')
          .gte('booking_date', prevStartDate)
          .lt('booking_date', startDate)
          .eq('status', 'confirmed')

        const prevTotalRevenue =
          prevRevenue?.reduce((sum, b) => sum + (b.price || 0), 0) || 0

        const revenueGrowth =
          prevTotalRevenue > 0
            ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100
            : 0

        // Total Bookings
        const { count: currentBookings } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .gte('booking_date', startDate)

        const { count: prevBookings } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .gte('booking_date', prevStartDate)
          .lt('booking_date', startDate)

        const bookingsGrowth =
          prevBookings && prevBookings > 0
            ? ((currentBookings || 0) - prevBookings) / prevBookings * 100
            : 0

        // Active Athletes
        const { data: activeAthletes } = await supabase
          .from('bookings')
          .select('athlete_id')
          .gte('booking_date', startDate)

        const uniqueAthletes = new Set(activeAthletes?.map((b) => b.athlete_id) || [])
          .size

        // Previous period active athletes
        const { data: prevActiveAthletes } = await supabase
          .from('bookings')
          .select('athlete_id')
          .gte('booking_date', prevStartDate)
          .lt('booking_date', startDate)

        const prevUniqueAthletes = new Set(
          prevActiveAthletes?.map((b) => b.athlete_id) || []
        ).size

        const athletesGrowth =
          prevUniqueAthletes > 0
            ? ((uniqueAthletes - prevUniqueAthletes) / prevUniqueAthletes) * 100
            : 0

        // Average sessions per athlete
        const avgSessionsPerAthlete =
          uniqueAthletes > 0 ? (currentBookings || 0) / uniqueAthletes : 0

        // Completion rate
        const { count: completedBookings } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .gte('booking_date', startDate)
          .eq('status', 'completed')

        const completionRate =
          currentBookings && currentBookings > 0
            ? (completedBookings || 0) / currentBookings * 100
            : 0

        // Recent bookings
        const { data: recentBookings } = await supabase
          .from('bookings')
          .select(
            `
            *,
            athlete:profiles!bookings_athlete_id_fkey(full_name),
            coach:profiles!bookings_coach_id_fkey(full_name),
            service:services(name)
          `
          )
          .order('created_at', { ascending: false })
          .limit(5)

        setAnalytics({
          totalRevenue,
          revenueGrowth,
          totalBookings: currentBookings || 0,
          bookingsGrowth,
          activeAthletes: uniqueAthletes,
          athletesGrowth,
          avgSessionsPerAthlete,
          completionRate,
          popularDrills: [],
          recentBookings: recentBookings || [],
          monthlyRevenue: [],
        })
      } catch (error) {
        console.error('Error loading analytics:', error)
      } finally {
        setLoadingData(false)
      }
    }

    loadAnalytics()
  }, [profile, isCoach, isAdmin, timeRange])

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange mx-auto mb-4"></div>
          <p className="text-cyan-800 dark:text-white">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-cyan-700 dark:text-white mx-auto mb-4" />
          <p className="text-cyan-800 dark:text-white">No analytics data available</p>
        </div>
      </div>
    )
  }

  const StatCard = ({
    title,
    value,
    growth,
    icon: Icon,
    prefix = '',
    suffix = '',
  }: {
    title: string
    value: number | string
    growth?: number
    icon: any
    prefix?: string
    suffix?: string
  }) => (
    <div className="glass-card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-orange/10">
          <Icon className="w-6 h-6 text-orange" />
        </div>
        {growth !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              growth >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {growth >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {Math.abs(growth).toFixed(1)}%
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">
        {prefix}
        {typeof value === 'number' ? value.toLocaleString() : value}
        {suffix}
      </h3>
      <p className="text-sm text-cyan-800 dark:text-white">{title}</p>
    </div>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-cyan-800 dark:text-white">
          Track your performance and insights
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6 flex gap-2">
        {(['7d', '30d', '90d'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              timeRange === range
                ? 'bg-orange text-white'
                : 'bg-cyan-50/50 text-cyan-600 hover:bg-white/10'
            }`}
          >
            {range === '7d' && 'Last 7 Days'}
            {range === '30d' && 'Last 30 Days'}
            {range === '90d' && 'Last 90 Days'}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={analytics.totalRevenue}
          growth={analytics.revenueGrowth}
          icon={DollarSign}
          prefix="$"
        />
        <StatCard
          title="Total Bookings"
          value={analytics.totalBookings}
          growth={analytics.bookingsGrowth}
          icon={Calendar}
        />
        <StatCard
          title="Active Athletes"
          value={analytics.activeAthletes}
          growth={analytics.athletesGrowth}
          icon={Users}
        />
        <StatCard
          title="Completion Rate"
          value={analytics.completionRate.toFixed(1)}
          icon={Target}
          suffix="%"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-orange" />
            <h3 className="text-lg font-semibold text-white">
              Avg Sessions per Athlete
            </h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {analytics.avgSessionsPerAthlete.toFixed(1)}
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-5 h-5 text-orange" />
            <h3 className="text-lg font-semibold text-white">Performance</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {analytics.completionRate >= 80 ? 'Excellent' : analytics.completionRate >= 60 ? 'Good' : 'Needs Improvement'}
          </p>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-5 h-5 text-orange" />
          <h3 className="text-lg font-semibold text-white">Recent Bookings</h3>
        </div>

        {analytics.recentBookings.length === 0 ? (
          <p className="text-cyan-800 dark:text-white text-center py-8">No recent bookings</p>
        ) : (
          <div className="space-y-3">
            {analytics.recentBookings.map((booking: any) => (
              <div
                key={booking.id}
                className="p-4 rounded-xl bg-cyan-50/50 border border-cyan-200/40 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-white font-medium mb-1">
                      {booking.athlete?.full_name || 'Unknown Athlete'}
                    </p>
                    <p className="text-sm text-cyan-800 dark:text-white">
                      {booking.service?.name || 'Training Session'} •{' '}
                      {new Date(booking.booking_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold mb-1">
                      ${booking.price}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-green-500/10 text-green-400'
                          : booking.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : booking.status === 'completed'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
