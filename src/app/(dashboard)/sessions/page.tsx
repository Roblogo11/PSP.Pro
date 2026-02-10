'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, MapPin, Video, CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { PLACEHOLDER_IMAGES } from '@/lib/placeholder-images'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { useUserSessions } from '@/lib/hooks/use-user-sessions'

export default function SessionsPage() {
  const router = useRouter()
  const { profile, isImpersonating, impersonatedUserId, loading: profileLoading } = useUserRole()
  const effectiveUserId = impersonatedUserId || profile?.id
  const { sessions, upcomingSessions, pastSessions, loading: sessionsLoading } = useUserSessions(effectiveUserId)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Loading state
  if (profileLoading || sessionsLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cyan-700 dark:text-white">Loading your sessions...</p>
        </div>
      </div>
    )
  }

  // Filter sessions based on selected filter - NOW WITH REAL DATA
  const filteredSessions = filter === 'all'
    ? sessions
    : filter === 'upcoming'
    ? upcomingSessions
    : pastSessions

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <AlertCircle className="w-5 h-5 text-orange" />
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-400" />
      default:
        return null
    }
  }

  const handleCancelSession = async () => {
    if (!selectedSession || isImpersonating) return
    setIsProcessing(true)

    try {
      const supabase = createClient()

      // Update booking status to cancelled
      // Only cancel sessions belonging to the current user
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedSession)
        .eq('athlete_id', profile?.id)

      if (error) throw error

      // Close modal and refresh
      setCancelModalOpen(false)
      setSelectedSession(null)

      // Page will auto-refresh via the hook
      alert('Session cancelled successfully. Refund will be processed within 3-5 business days.')

      // Force page reload to show updated data
      window.location.reload()
    } catch (error: any) {
      console.error('Error cancelling session:', error)
      alert('Failed to cancel session. Please contact support.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRescheduleSession = () => {
    if (!selectedSession || isImpersonating) return

    // Close modal and redirect to booking page with session ID
    setRescheduleModalOpen(false)
    router.push(`/booking?reschedule=${selectedSession}`)
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24 lg:pb-8 relative">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-2">
          Training <span className="text-gradient-orange">Sessions</span>
        </h1>
        <p className="text-cyan-700 dark:text-white text-lg">
          View and manage your training schedule
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['all', 'upcoming', 'past'].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType as typeof filter)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
              filter === filterType
                ? 'bg-orange text-white shadow-glow-orange'
                : 'bg-cyan-900/30 text-cyan-700 dark:text-white hover:bg-cyan-900 hover:text-white'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className="command-panel hover:border-orange/30 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                {/* Coach Photo */}
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-orange/30 bg-gradient-to-br from-cyan to-orange">
                  {session.coachPhoto ? (
                    <Image
                      src={session.coachPhoto}
                      alt={session.coach}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                      {session.coach.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-orange transition-colors">
                      {session.type}
                    </h3>
                    {getStatusIcon(session.status)}
                  </div>
                  <p className="text-sm text-cyan-700 dark:text-white">{session.coach}</p>
                </div>
              </div>
              {session.hasVideo && (
                <div className="px-3 py-1 bg-cyan/20 border border-cyan/30 rounded-full flex items-center gap-2">
                  <Video className="w-4 h-4 text-cyan" />
                  <span className="text-xs font-semibold text-cyan">Video Available</span>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-3 text-cyan-700 dark:text-white">
                <Calendar className="w-5 h-5 text-orange" />
                <span>{format(session.date, 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-3 text-cyan-700 dark:text-white">
                <Clock className="w-5 h-5 text-orange" />
                <span>{session.time}</span>
              </div>
              <div className="flex items-center gap-3 text-cyan-700 dark:text-white">
                <MapPin className="w-5 h-5 text-orange" />
                <span>{session.location}</span>
              </div>
            </div>

            {session.notes && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-sm text-cyan-700 dark:text-white">
                  <span className="font-semibold text-slate-900 dark:text-white">Notes:</span> {session.notes}
                </p>
              </div>
            )}

            {session.peakVelocity && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-sm text-cyan-700 dark:text-white">
                  <span className="font-semibold text-slate-900 dark:text-white">Peak Velocity:</span>{' '}
                  <span className="text-gradient-orange font-bold">{session.peakVelocity} mph</span>
                </p>
              </div>
            )}

            {session.status === 'upcoming' && !isImpersonating && (
              <div className="mt-4 pt-4 border-t border-white/5 flex gap-3">
                <button
                  onClick={() => {
                    setSelectedSession(session.id)
                    setCancelModalOpen(true)
                  }}
                  className="btn-ghost text-sm py-2 border-red-500/30 hover:border-red-500/50 hover:text-red-400"
                >
                  Cancel Session
                </button>
                <button
                  onClick={() => {
                    setSelectedSession(session.id)
                    setRescheduleModalOpen(true)
                  }}
                  className="btn-ghost text-sm py-2 border-cyan/30 hover:border-cyan/50 hover:text-cyan"
                >
                  Reschedule
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <div className="command-panel text-center py-12">
          <p className="text-cyan-700 dark:text-white text-lg mb-4">No sessions found</p>
          <Link href="/booking">
            <button className="btn-primary">Book a Session</button>
          </Link>
        </div>
      )}

      {/* Cancel Session Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Cancel Session</h2>
              <button
                onClick={() => {
                  setCancelModalOpen(false)
                  setSelectedSession(null)
                }}
                className="text-cyan-700 dark:text-white hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
                <p className="text-red-400 text-sm font-semibold mb-2">⚠️ Cancellation Policy</p>
                <ul className="text-sm text-cyan-700 dark:text-white space-y-1">
                  <li>• Cancellations made 24+ hours in advance: Full refund</li>
                  <li>• Cancellations within 24 hours: No refund</li>
                  <li>• Refunds processed within 3-5 business days</li>
                </ul>
              </div>

              <p className="text-cyan-700 dark:text-white text-sm">
                Are you sure you want to cancel this session? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCancelModalOpen(false)
                  setSelectedSession(null)
                }}
                className="btn-ghost flex-1"
                disabled={isProcessing}
              >
                Keep Session
              </button>
              <button
                onClick={handleCancelSession}
                className="flex-1 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isProcessing}
              >
                {isProcessing ? 'Cancelling...' : 'Cancel Session'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Session Modal */}
      {rescheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reschedule Session</h2>
              <button
                onClick={() => {
                  setRescheduleModalOpen(false)
                  setSelectedSession(null)
                }}
                className="text-cyan-700 dark:text-white hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="p-4 bg-cyan/10 border border-cyan/20 rounded-xl mb-4">
                <p className="text-cyan text-sm font-semibold mb-2">ℹ️ Rescheduling Info</p>
                <ul className="text-sm text-cyan-700 dark:text-white space-y-1">
                  <li>• Free rescheduling up to 24 hours before session</li>
                  <li>• Choose any available slot in the booking calendar</li>
                  <li>• Your session credit will automatically transfer</li>
                </ul>
              </div>

              <p className="text-cyan-700 dark:text-white text-sm">
                You'll be redirected to the booking calendar to select a new time slot.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRescheduleModalOpen(false)
                  setSelectedSession(null)
                }}
                className="btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleSession}
                className="btn-primary flex-1"
              >
                Choose New Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
