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
  PieChart as PieChartIcon,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

interface AnalyticsData {
  totalRevenue: number
  revenueGrowth: number
  totalBookings: number
  bookingsGrowth: number
  activeAthletes: number
  athletesGrowth: number
  avgSessionsPerAthlete: number
  completionRate: number
  recentBookings: Array<any>
  monthlyRevenue: Array<{ month: string; revenue: number }>
  serviceBreakdown: Array<{ name: string; revenue: number; count: number }>
  statusBreakdown: Array<{ name: string; value: number }>
  topAthletes: Array<{ name: string; revenue: number; sessions: number }>
}

const CHART_COLORS = ['#FF4B2B', '#00B4D8', '#22C55E', '#F59E0B', '#A855F7', '#EC4899']

export default function AnalyticsPage() {
  const router = useRouter()
  const { profile, isCoach, isAdmin, loading } = useUserRole()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  const isCoachOnly = isCoach && !isAdmin

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
        const prevStartDate = new Date(now.getTime() - daysAgo * 2 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]

        // Helper to add coach filter
        const coachFilter = (query: any) => {
          if (isCoachOnly && profile?.id) {
            return query.eq('coach_id', profile.id)
          }
          return query
        }

        // --- Current period revenue ---
        let revenueQuery = supabase
          .from('bookings')
          .select('amount_cents, payment_status, booking_date, service_id, athlete_id, status')
          .gte('booking_date', startDate)

        revenueQuery = coachFilter(revenueQuery)
        const { data: currentBookingsData } = await revenueQuery

        const paidBookings = (currentBookingsData || []).filter(b => b.payment_status === 'paid')
        const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.amount_cents || 0), 0) / 100

        // --- Previous period revenue ---
        let prevRevenueQuery = supabase
          .from('bookings')
          .select('amount_cents, payment_status')
          .gte('booking_date', prevStartDate)
          .lt('booking_date', startDate)

        prevRevenueQuery = coachFilter(prevRevenueQuery)
        const { data: prevBookingsData } = await prevRevenueQuery

        const prevPaidBookings = (prevBookingsData || []).filter(b => b.payment_status === 'paid')
        const prevTotalRevenue = prevPaidBookings.reduce((sum, b) => sum + (b.amount_cents || 0), 0) / 100
        const revenueGrowth = prevTotalRevenue > 0 ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100 : 0

        // --- Booking counts ---
        const totalBookings = currentBookingsData?.length || 0

        let prevCountQuery = supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .gte('booking_date', prevStartDate)
          .lt('booking_date', startDate)

        prevCountQuery = coachFilter(prevCountQuery)
        const { count: prevBookings } = await prevCountQuery
        const bookingsGrowth = prevBookings && prevBookings > 0
          ? ((totalBookings - prevBookings) / prevBookings) * 100
          : 0

        // --- Active athletes ---
        const uniqueAthletes = new Set((currentBookingsData || []).map(b => b.athlete_id)).size

        let prevAthletesQuery = supabase
          .from('bookings')
          .select('athlete_id')
          .gte('booking_date', prevStartDate)
          .lt('booking_date', startDate)

        prevAthletesQuery = coachFilter(prevAthletesQuery)
        const { data: prevAthletesData } = await prevAthletesQuery
        const prevUniqueAthletes = new Set((prevAthletesData || []).map(b => b.athlete_id)).size
        const athletesGrowth = prevUniqueAthletes > 0 ? ((uniqueAthletes - prevUniqueAthletes) / prevUniqueAthletes) * 100 : 0

        // --- Avg sessions per athlete ---
        const avgSessionsPerAthlete = uniqueAthletes > 0 ? totalBookings / uniqueAthletes : 0

        // --- Completion rate ---
        const completedCount = (currentBookingsData || []).filter(b => b.status === 'completed').length
        const completionRate = totalBookings > 0 ? (completedCount / totalBookings) * 100 : 0

        // --- Monthly revenue (last 6 months) ---
        const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        let monthlyQuery = supabase
          .from('bookings')
          .select('amount_cents, payment_status, booking_date')
          .gte('booking_date', sixMonthsAgo)

        monthlyQuery = coachFilter(monthlyQuery)
        const { data: monthlyData } = await monthlyQuery

        const monthlyMap: Record<string, number> = {}
        for (const b of (monthlyData || []).filter(b => b.payment_status === 'paid')) {
          const month = new Date(b.booking_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
          monthlyMap[month] = (monthlyMap[month] || 0) + (b.amount_cents || 0) / 100
        }

        // Ensure all 6 months are represented
        const monthlyRevenue: Array<{ month: string; revenue: number }> = []
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
          monthlyRevenue.push({ month: key, revenue: monthlyMap[key] || 0 })
        }

        // --- Service breakdown ---
        const serviceIds = [...new Set((currentBookingsData || []).filter(b => b.service_id).map(b => b.service_id))]
        let serviceBreakdown: Array<{ name: string; revenue: number; count: number }> = []

        if (serviceIds.length > 0) {
          const { data: servicesData } = await supabase
            .from('services')
            .select('id, name')
            .in('id', serviceIds)

          const serviceMap = new Map((servicesData || []).map(s => [s.id, s.name]))
          const breakdown: Record<string, { revenue: number; count: number }> = {}

          for (const b of paidBookings) {
            const name = serviceMap.get(b.service_id) || 'Other'
            if (!breakdown[name]) breakdown[name] = { revenue: 0, count: 0 }
            breakdown[name].revenue += (b.amount_cents || 0) / 100
            breakdown[name].count += 1
          }

          serviceBreakdown = Object.entries(breakdown)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
        }

        // --- Status breakdown (for pie chart) ---
        const statusCounts: Record<string, number> = {}
        for (const b of (currentBookingsData || [])) {
          const status = b.status || 'pending'
          statusCounts[status] = (statusCounts[status] || 0) + 1
        }
        const statusBreakdown = Object.entries(statusCounts).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
        }))

        // --- Top athletes ---
        const athleteRevMap: Record<string, { revenue: number; sessions: number }> = {}
        for (const b of paidBookings) {
          if (!b.athlete_id) continue
          if (!athleteRevMap[b.athlete_id]) athleteRevMap[b.athlete_id] = { revenue: 0, sessions: 0 }
          athleteRevMap[b.athlete_id].revenue += (b.amount_cents || 0) / 100
          athleteRevMap[b.athlete_id].sessions += 1
        }

        const topAthleteIds = Object.entries(athleteRevMap)
          .sort((a, b) => b[1].revenue - a[1].revenue)
          .slice(0, 10)
          .map(([id]) => id)

        let topAthletes: Array<{ name: string; revenue: number; sessions: number }> = []
        if (topAthleteIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', topAthleteIds)

          const nameMap = new Map((profiles || []).map(p => [p.id, p.full_name]))
          topAthletes = topAthleteIds.map(id => ({
            name: nameMap.get(id) || 'Unknown Athlete',
            revenue: athleteRevMap[id].revenue,
            sessions: athleteRevMap[id].sessions,
          }))
        }

        // --- Recent bookings ---
        let recentQuery = supabase
          .from('bookings')
          .select(`
            id, booking_date, amount_cents, payment_status, status,
            athlete:profiles!bookings_athlete_id_fkey(full_name),
            coach:profiles!bookings_coach_id_fkey(full_name),
            service:services(name)
          `)
          .order('created_at', { ascending: false })
          .limit(5)

        recentQuery = coachFilter(recentQuery)
        const { data: recentBookings } = await recentQuery

        setAnalytics({
          totalRevenue,
          revenueGrowth,
          totalBookings,
          bookingsGrowth,
          activeAthletes: uniqueAthletes,
          athletesGrowth,
          avgSessionsPerAthlete,
          completionRate,
          recentBookings: recentBookings || [],
          monthlyRevenue,
          serviceBreakdown,
          statusBreakdown,
          topAthletes,
        })
      } catch (error) {
        console.error('Error loading analytics:', error)
      } finally {
        setLoadingData(false)
      }
    }

    setLoadingData(true)
    loadAnalytics()
  }, [profile, isCoach, isAdmin, isCoachOnly, timeRange])

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
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
        {prefix}
        {typeof value === 'number' ? value.toLocaleString() : value}
        {suffix}
      </h3>
      <p className="text-sm text-cyan-800 dark:text-white">{title}</p>
    </div>
  )

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-white/10 rounded-lg p-3 shadow-lg">
          <p className="text-white text-sm font-semibold mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="px-3 py-4 md:p-6 max-w-7xl mx-auto pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
          {isCoachOnly ? 'My Earnings' : 'Platform Analytics'}
        </h1>
        <p className="text-cyan-800 dark:text-white">
          {isCoachOnly ? 'Track your personal revenue and session performance' : 'Platform-wide performance and revenue insights'}
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
          value={analytics.totalRevenue.toFixed(2)}
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Revenue Chart */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-5 h-5 text-orange" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Monthly Revenue</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenue" fill="#FF4B2B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Status Pie Chart */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <PieChartIcon className="w-5 h-5 text-orange" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Booking Status</h3>
          </div>
          <div className="h-64">
            {analytics.statusBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {analytics.statusBreakdown.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-cyan-800 dark:text-white">No booking data</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Revenue by Service + Revenue Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue by Service */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5 text-orange" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Revenue by Service</h3>
          </div>
          {analytics.serviceBreakdown.length > 0 ? (
            <div className="space-y-3">
              {analytics.serviceBreakdown.map((service, i) => (
                <div key={service.name} className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{service.name}</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">${service.revenue.toFixed(0)}</p>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${(service.revenue / (analytics.serviceBreakdown[0]?.revenue || 1)) * 100}%`,
                          backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                    </div>
                    <p className="text-xs text-cyan-800 dark:text-white mt-1">{service.count} sessions</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-cyan-800 dark:text-white text-center py-8">No service data</p>
          )}
        </div>

        {/* Revenue Trend Line */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5 text-orange" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Revenue Trend</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#FF4B2B" strokeWidth={3} dot={{ fill: '#FF4B2B', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Athletes + Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Athletes by Revenue */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-5 h-5 text-orange" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Top Athletes by Revenue</h3>
          </div>
          {analytics.topAthletes.length > 0 ? (
            <div className="space-y-3">
              {analytics.topAthletes.map((athlete, index) => (
                <div
                  key={athlete.name}
                  className="flex items-center gap-4 p-3 rounded-xl bg-cyan-50/50 border border-cyan-200/40 hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange to-cyan flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{athlete.name}</p>
                    <p className="text-xs text-cyan-800 dark:text-white">{athlete.sessions} sessions</p>
                  </div>
                  <p className="text-sm font-bold text-orange">${athlete.revenue.toFixed(0)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-cyan-800 dark:text-white text-center py-8">No athlete data</p>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5 text-orange" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Bookings</h3>
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
                      <p className="text-slate-900 dark:text-white font-medium mb-1">
                        {booking.athlete?.full_name || 'Unknown Athlete'}
                      </p>
                      <p className="text-sm text-cyan-800 dark:text-white">
                        {booking.service?.name || 'Training Session'} &bull;{' '}
                        {new Date(booking.booking_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-900 dark:text-white font-semibold mb-1">
                        ${((booking.amount_cents || 0) / 100).toFixed(0)}
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
    </div>
  )
}
