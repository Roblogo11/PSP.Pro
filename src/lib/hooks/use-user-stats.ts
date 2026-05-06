'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getLocalDateString } from '@/lib/utils/local-date'

export interface UserStats {
  totalSessions: number
  avgVelocity: number | null
  totalDrills: number
  totalQuizzes: number
  currentStreak: number
  nextSession: Date | null
  nextSessionId: string | null
  nextSessionLocation: string | null
  nextSessionService: string | null
  recentVelocities: Array<{ date: Date; value: number }>
}

export function useUserStats(userId: string | undefined) {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  // createClient() returns a stable instance — do NOT put it in the dep array
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const supabase = createClient()

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    async function loadStats() {
      try {
        // Total completed sessions = completed bookings (the 'sessions' table doesn't exist;
        // bookings IS the source of truth).
        const { count: sessionsCount } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('athlete_id', userId)
          .eq('status', 'completed')

        // Fetch next upcoming session
        const { data: upcomingSession } = await supabase
          .from('bookings')
          .select('id, booking_date, start_time, location, service:service_id(name)')
          .eq('athlete_id', userId)
          .in('status', ['confirmed', 'pending'])
          .gte('booking_date', getLocalDateString())
          .order('booking_date', { ascending: true })
          .order('start_time', { ascending: true })
          .limit(1)
          .maybeSingle()

        // Fetch drill completions
        const { count: drillsCount } = await supabase
          .from('drill_completions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)

        // Fetch completed quiz count
        const { count: quizzesCount } = await supabase
          .from('assigned_questionnaires')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('completed', true)

        // Recent velocity history — pulled from athlete_performance_metrics
        // (legacy code queried `sessions.peak_velocity`, but that table/column never existed).
        const { data: velocityData } = await supabase
          .from('athlete_performance_metrics')
          .select('test_date, throwing_velocity_mph, exit_velocity_mph')
          .eq('athlete_id', userId)
          .order('test_date', { ascending: false })
          .limit(10)

        // Pick the most-populated velocity field for this athlete (throwing or exit).
        const velocities = (velocityData || [])
          .map((v: any) => v.throwing_velocity_mph ?? v.exit_velocity_mph)
          .filter((v: any) => typeof v === 'number') as number[]
        const avgVelocity = velocities.length > 0
          ? Math.round(velocities.reduce((a, b) => a + b, 0) / velocities.length)
          : null

        // Calculate current streak (simplified - consecutive days with drill completions)
        const { data: recentCompletions } = await supabase
          .from('drill_completions')
          .select('completed_at')
          .eq('user_id', userId)
          .order('completed_at', { ascending: false })
          .limit(30)

        let currentStreak = 0
        if (recentCompletions && recentCompletions.length > 0) {
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          const dates = new Set(
            recentCompletions.map((c: any) =>
              getLocalDateString(new Date(c.completed_at))
            )
          )

          let checkDate = new Date(today)
          while (dates.has(getLocalDateString(checkDate))) {
            currentStreak++
            checkDate.setDate(checkDate.getDate() - 1)
          }
        }

        // Format next session date
        let nextSessionDate: Date | null = null
        if (upcomingSession) {
          const [hours, minutes] = upcomingSession.start_time.split(':')
          nextSessionDate = new Date(upcomingSession.booking_date + 'T00:00:00')
          nextSessionDate.setHours(parseInt(hours), parseInt(minutes))
        }

        // Format velocity history (oldest → newest for chart)
        const recentVelocities = (velocityData || [])
          .map((v: any) => ({
            date: new Date(v.test_date),
            value: (v.throwing_velocity_mph ?? v.exit_velocity_mph) as number | null,
          }))
          .filter((v: { date: Date; value: number | null }) => typeof v.value === 'number')
          .reverse() as Array<{ date: Date; value: number }>

        setStats({
          totalSessions: sessionsCount || 0,
          avgVelocity,
          totalDrills: drillsCount || 0,
          totalQuizzes: quizzesCount || 0,
          currentStreak,
          nextSession: nextSessionDate,
          nextSessionId: upcomingSession?.id ?? null,
          nextSessionLocation: upcomingSession?.location ?? null,
          nextSessionService: (upcomingSession?.service as any)?.name ?? null,
          recentVelocities,
        })
      } catch (error) {
        console.error('Error loading user stats:', error)
        setStats(null)
      } finally {
        setLoading(false)
      }
    }

    loadStats()

    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return { stats, loading }
}
