'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface UserSession {
  id: string
  type: string
  date: Date
  time: string
  coach: string
  coachPhoto: string | null
  location: string
  status: 'upcoming' | 'completed' | 'cancelled'
  hasVideo: boolean
  notes: string | null
  peakVelocity: number | null
}

export function useUserSessions(userId: string | undefined) {
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    async function loadSessions() {
      try {
        // Fetch user's bookings with session and coach info
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select(`
            id,
            booking_date,
            start_time,
            status,
            coach_notes,
            location,
            service:service_id(name),
            coach:coach_id(full_name, avatar_url)
          `)
          .eq('athlete_id', userId)
          .order('booking_date', { ascending: false })

        if (error) throw error

        // Also fetch completed sessions with notes
        const { data: completedSessions } = await supabase
          .from('sessions')
          .select(`
            id,
            session_date,
            session_time,
            status,
            notes,
            peak_velocity,
            video_url,
            coach:coach_id(full_name, avatar_url),
            service:service_id(name)
          `)
          .eq('athlete_id', userId)
          .eq('status', 'completed')

        // Transform bookings to UserSession format
        const transformedBookings: UserSession[] = (bookings || []).map(booking => {
          const sessionDate = new Date(booking.booking_date)
          const isUpcoming = sessionDate >= new Date()

          return {
            id: booking.id,
            type: (booking.service as any as { name: string } | null)?.name || 'Training Session',
            date: sessionDate,
            time: booking.start_time,
            coach: (booking.coach as any as { full_name: string; avatar_url: string } | null)?.full_name || 'Coach',
            coachPhoto: (booking.coach as any as { full_name: string; avatar_url: string } | null)?.avatar_url || null,
            location: (booking as any).location || 'PSP Training Center',
            status: booking.status === 'cancelled' ? 'cancelled' : (isUpcoming ? 'upcoming' : 'completed'),
            hasVideo: false,
            notes: (booking as any).coach_notes || null,
            peakVelocity: null,
          }
        })

        // Add completed sessions with notes
        const transformedCompleted: UserSession[] = (completedSessions || []).map(session => ({
          id: session.id,
          type: (session.service as any as { name: string } | null)?.name || 'Training Session',
          date: new Date(session.session_date),
          time: session.session_time,
          coach: (session.coach as any as { full_name: string; avatar_url: string } | null)?.full_name || 'Coach',
          coachPhoto: (session.coach as any as { full_name: string; avatar_url: string } | null)?.avatar_url || null,
          location: 'PSP Training Center',
          status: 'completed' as const,
          hasVideo: !!session.video_url,
          notes: session.notes,
          peakVelocity: session.peak_velocity,
        }))

        // Merge and dedupe
        const allSessions = [...transformedBookings, ...transformedCompleted]
        const uniqueSessions = Array.from(
          new Map(allSessions.map(s => [s.id, s])).values()
        )

        // Sort by date (newest first)
        uniqueSessions.sort((a, b) => b.date.getTime() - a.date.getTime())

        setSessions(uniqueSessions)
      } catch (error) {
        console.error('Error loading sessions:', error)
        setSessions([])
      } finally {
        setLoading(false)
      }
    }

    loadSessions()

    // Refresh every minute
    const interval = setInterval(loadSessions, 60000)
    return () => clearInterval(interval)
  }, [userId, supabase])

  const upcomingSessions = sessions.filter(s => s.status === 'upcoming')
  const pastSessions = sessions.filter(s => s.status === 'completed' || s.status === 'cancelled')

  return {
    sessions,
    upcomingSessions,
    pastSessions,
    loading,
    refetch: () => {
      setLoading(true)
      // Trigger re-fetch by changing a dependency
    },
  }
}
