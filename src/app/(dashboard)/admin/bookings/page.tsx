'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Clock, User, DollarSign, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function AdminBookingsPage() {
  const supabase = createClient()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all')

  useEffect(() => {
    fetchBookings()
  }, [filter])

  const fetchBookings = async () => {
    setLoading(true)

    let query = supabase
      .from('bookings')
      .select(`
        *,
        athlete:athlete_id (full_name),
        coach:coach_id (full_name),
        service:service_id (name)
      `)
      .order('booking_date', { ascending: false })
      .order('start_time', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query

    if (data) {
      setBookings(data)
    }

    setLoading(false)
  }

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({
        status: newStatus,
        ...(newStatus === 'cancelled' && { cancelled_at: new Date().toISOString() })
      })
      .eq('id', bookingId)

    if (!error) {
      fetchBookings()
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const formattedHour = hour % 12 || 12
    return `${formattedHour}:${minutes} ${ampm}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'pending':
        return 'bg-orange/10 text-orange border-orange/20'
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'completed':
        return 'bg-cyan/10 text-cyan border-cyan/20'
      case 'no-show':
        return 'bg-cyan-600/10 text-cyan-600 border-cyan-600/20'
      default:
        return 'bg-cyan-600/10 text-cyan-600 border-cyan-600/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-400'
      case 'pending':
        return 'text-orange'
      case 'failed':
      case 'refunded':
        return 'text-red-400'
      default:
        return 'text-cyan-600'
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
          Booking Management
        </h1>
        <p className="text-cyan-800 dark:text-white text-lg">
          View and manage all training session bookings
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        {[
          { value: 'all', label: 'All Bookings' },
          { value: 'pending', label: 'Pending' },
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'cancelled', label: 'Cancelled' },
        ].map(option => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value as any)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              filter === option.value
                ? 'bg-orange text-white shadow-lg shadow-orange/30'
                : 'glass-card-hover text-slate-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4">
          <p className="text-sm text-cyan-800 dark:text-white mb-1">Total Bookings</p>
          <p className="text-2xl font-bold text-white">{bookings.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-cyan-800 dark:text-white mb-1">Confirmed</p>
          <p className="text-2xl font-bold text-green-400">
            {bookings.filter(b => b.status === 'confirmed').length}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-cyan-800 dark:text-white mb-1">Pending</p>
          <p className="text-2xl font-bold text-orange">
            {bookings.filter(b => b.status === 'pending').length}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-cyan-800 dark:text-white mb-1">Revenue</p>
          <p className="text-2xl font-bold text-cyan">
            ${(bookings
              .filter(b => b.payment_status === 'paid')
              .reduce((sum, b) => sum + b.amount_cents, 0) / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="command-panel overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-orange/30 border-t-orange rounded-full animate-spin mb-4" />
            <p className="text-cyan-800 dark:text-white">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-cyan-700 dark:text-white mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Bookings Found</h3>
            <p className="text-cyan-800 dark:text-white">No bookings match your current filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-200/40">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-cyan-800 dark:text-white">Athlete</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-cyan-800 dark:text-white">Service</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-cyan-800 dark:text-white">Date & Time</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-cyan-800 dark:text-white">Coach</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-cyan-800 dark:text-white">Location</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-cyan-800 dark:text-white">Amount</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-cyan-800 dark:text-white">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-cyan-800 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id} className="border-b border-white/5 hover:bg-cyan-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-semibold text-white">{booking.athlete?.full_name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-white">{booking.service?.name}</p>
                      <p className="text-xs text-cyan-800 dark:text-white">{booking.duration_minutes} min</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-cyan-800 dark:text-white mt-0.5" />
                        <div>
                          <p className="text-sm text-white">{formatDate(booking.booking_date)}</p>
                          <p className="text-xs text-cyan-800 dark:text-white">
                            {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-cyan-800 dark:text-white" />
                        <p className="text-sm text-white">{booking.coach?.full_name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-cyan-800 dark:text-white" />
                        <p className="text-sm text-white">{booking.location || 'TBD'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className={`text-sm font-semibold ${getPaymentStatusColor(booking.payment_status)}`}>
                        ${(booking.amount_cents / 100).toFixed(2)}
                      </p>
                      <p className="text-xs text-cyan-800 dark:text-white capitalize">{booking.payment_status}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {getStatusIcon(booking.status)}
                        <span className="capitalize">{booking.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {booking.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'completed')}
                          className="px-3 py-1.5 bg-cyan/20 hover:bg-cyan/30 text-cyan rounded-lg text-xs font-semibold transition-colors"
                        >
                          Mark Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
