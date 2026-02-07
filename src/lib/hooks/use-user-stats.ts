'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface UserStats {
  totalSessions: number
  avgVelocity: number | null
  totalDrills: number
  currentStreak: number
  nextSession: Date | null
  recentVelocities: Array<{ date: Date; value: number }>
}

export function useUserStats(userId: string | undefined) {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    async function loadStats() {
      try {
        // Fetch total sessions
        const { count: sessionsCount } = await supabase
          .from('sessions')
          .select('*', { count: 'exact', head: true })
          .eq('athlete_id', userId)
          .eq('status', 'completed')

        // Fetch next upcoming session
        const { data: upcomingSession } = await supabase
          .from('bookings')
          .select('booking_date, start_time')
          .eq('athlete_id', userId)
          .in('status', ['confirmed', 'pending'])
          .gte('booking_date', new Date().toISOString().split('T')[0])
          .order('booking_date', { ascending: true })
          .order('start_time', { ascending: true })
          .limit(1)
          .single()

        // Fetch drill completions
        const { count: drillsCount } = await supabase
          .from('drill_completions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)

        // Fetch recent velocity data (last 10 sessions)
        const { data: velocityData } = await supabase
          .from('sessions')
          .select('completed_at, peak_velocity')
          .eq('athlete_id', userId)
          .eq('status', 'completed')
          .not('peak_velocity', 'is', null)
          .order('completed_at', { ascending: false })
          .limit(10)

        // Calculate average velocity
        const velocities = velocityData?.map(v => v.peak_velocity).filter(Boolean) as number[] || []
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
            recentCompletions.map(c =>
              new Date(c.completed_at).toISOString().split('T')[0]
            )
          )

          let checkDate = new Date(today)
          while (dates.has(checkDate.toISOString().split('T')[0])) {
            currentStreak++
            checkDate.setDate(checkDate.getDate() - 1)
          }
        }

        // Format next session date
        let nextSessionDate: Date | null = null
        if (upcomingSession) {
          const [hours, minutes] = upcomingSession.start_time.split(':')
          nextSessionDate = new Date(upcomingSession.booking_date)
          nextSessionDate.setHours(parseInt(hours), parseInt(minutes))
        }

        // Format velocity history
        const recentVelocities = (velocityData || [])
          .filter(v => v.peak_velocity !== null)
          .map(v => ({
            date: new Date(v.completed_at),
            value: v.peak_velocity as number,
          }))
          .reverse() // Oldest to newest for chart

        setStats({
          totalSessions: sessionsCount || 0,
          avgVelocity,
          totalDrills: drillsCount || 0,
          currentStreak,
          nextSession: nextSessionDate,
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
  }, [userId, supabase])

  return { stats, loading }
}
