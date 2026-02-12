'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Calendar,
  Clock,
  User,
  DollarSign,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  List,
  Grid3X3,
  Edit2,
  X,
  Plus,
  Loader2,
  FileText,
} from 'lucide-react'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function AdminBookingsPage() {
  const supabase = createClient()
  const { isCoach, isAdmin, profile, loading: roleLoading } = useUserRole()
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all')
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('calendar')
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  // Edit booking modal
  const [editBooking, setEditBooking] = useState<any>(null)
  const [editNotes, setEditNotes] = useState({ coach_notes: '', internal_notes: '' })
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editSuccess, setEditSuccess] = useState<string | null>(null)

  // Book for athlete modal
  const [showBookForAthlete, setShowBookForAthlete] = useState(false)
  const [athletes, setAthletes] = useState<any[]>([])
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [bookFormData, setBookFormData] = useState({
    athleteId: '',
    slotId: '',
    serviceId: '',
    paymentMethod: 'on_site' as 'on_site' | 'comp' | 'package',
    notes: '',
  })
  const [bookSubmitting, setBookSubmitting] = useState(false)

  // Auth gate - redirect non-admin/coach users
  useEffect(() => {
    if (!roleLoading && profile && !isCoach && !isAdmin) {
      router.push('/locker')
    }
  }, [roleLoading, profile, isCoach, isAdmin, router])

  // Auto-open "Book for Athlete" modal via ?action=book
  const searchParams = useSearchParams()
  useEffect(() => {
    if (searchParams.get('action') === 'book' && !roleLoading && (isCoach || isAdmin)) {
      setShowBookForAthlete(true)
      // Clean URL without reload
      window.history.replaceState(null, '', '/admin/bookings')
    }
  }, [searchParams, roleLoading, isCoach, isAdmin])

  useEffect(() => {
    if (!roleLoading && (isCoach || isAdmin)) {
      fetchBookings()
    }
  }, [filter, roleLoading, isCoach, isAdmin])

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

  // Open edit modal
  const openEditBooking = (booking: any) => {
    setEditBooking(booking)
    setEditNotes({
      coach_notes: booking.coach_notes || '',
      internal_notes: booking.internal_notes || '',
    })
    setEditSuccess(null)
  }

  // Save booking edits (notes + status)
  const handleEditSave = async () => {
    if (!editBooking) return
    setEditSubmitting(true)

    const { error } = await supabase
      .from('bookings')
      .update({
        coach_notes: editNotes.coach_notes || null,
        internal_notes: editNotes.internal_notes || null,
      })
      .eq('id', editBooking.id)

    setEditSubmitting(false)

    if (error) {
      console.error('Failed to update booking:', error)
      return
    }

    setEditSuccess('Booking updated!')
    fetchBookings()
    setTimeout(() => { setEditBooking(null); setEditSuccess(null) }, 1500)
  }

  // Fetch data for book-for-athlete modal
  const openBookForAthlete = async () => {
    setShowBookForAthlete(true)
    setBookFormData({ athleteId: '', slotId: '', serviceId: '', paymentMethod: 'on_site', notes: '' })

    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    const [athleteRes, slotRes, serviceRes] = await Promise.all([
      supabase.from('profiles').select('id, full_name').eq('role', 'athlete').order('full_name'),
      supabase.from('available_slots').select('id, slot_date, start_time, end_time, location, service:service_id(name), current_bookings, max_bookings').eq('is_available', true).gte('slot_date', todayStr).order('slot_date').order('start_time'),
      supabase.from('services').select('id, name, price_cents, duration_minutes').eq('is_active', true).order('name'),
    ])

    if (athleteRes.data) setAthletes(athleteRes.data)
    if (slotRes.data) setAvailableSlots(slotRes.data)
    if (serviceRes.data) setServices(serviceRes.data)
  }

  // Submit book-for-athlete
  const handleBookForAthlete = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookFormData.athleteId || !bookFormData.slotId || !bookFormData.serviceId) return

    setBookSubmitting(true)

    try {
      const response = await fetch('/api/admin/create-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          athlete_id: bookFormData.athleteId,
          slot_id: bookFormData.slotId,
          service_id: bookFormData.serviceId,
          payment_method: bookFormData.paymentMethod,
          notes: bookFormData.notes,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to create booking')

      setShowBookForAthlete(false)
      fetchBookings()
    } catch (err: any) {
      console.error('Book for athlete error:', err)
      alert(`Error: ${err.message}`)
    } finally {
      setBookSubmitting(false)
    }
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

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-400'
      case 'pending':
        return 'bg-orange'
      case 'cancelled':
        return 'bg-red-400'
      case 'completed':
        return 'bg-cyan'
      default:
        return 'bg-cyan-600'
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

  // --- Calendar helpers ---
  const calendarYear = calendarDate.getFullYear()
  const calendarMonth = calendarDate.getMonth()

  const monthLabel = calendarDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay()

  // Group bookings by date string (YYYY-MM-DD)
  const bookingsByDate = useMemo(() => {
    const map: Record<string, any[]> = {}
    for (const b of bookings) {
      const dateKey = b.booking_date // already YYYY-MM-DD from Supabase
      if (!map[dateKey]) map[dateKey] = []
      map[dateKey].push(b)
    }
    return map
  }, [bookings])

  const prevMonth = () => {
    setCalendarDate(new Date(calendarYear, calendarMonth - 1, 1))
    setSelectedDay(null)
  }

  const nextMonth = () => {
    setCalendarDate(new Date(calendarYear, calendarMonth + 1, 1))
    setSelectedDay(null)
  }

  const goToToday = () => {
    const now = new Date()
    setCalendarDate(new Date(now.getFullYear(), now.getMonth(), 1))
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    setSelectedDay(todayKey)
  }

  const makeDateKey = (day: number) => {
    return `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const todayKey = (() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  })()

  const selectedDayBookings = selectedDay ? (bookingsByDate[selectedDay] || []) : []

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="min-h-screen px-3 py-4 md:p-8 pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-2">
            Confirm <span className="text-gradient-orange">Lessons</span>
          </h1>
          <p className="text-cyan-800 dark:text-white text-lg">
            Review and confirm lessons booked by athletes
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 self-start">
          <button
            onClick={openBookForAthlete}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Book for Athlete
          </button>

          {/* View Toggle */}
          <div className="flex items-center gap-2 glass-card p-1 rounded-xl">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              viewMode === 'calendar'
                ? 'bg-orange text-white shadow-lg shadow-orange/30'
                : 'text-slate-600 dark:text-slate-300 hover:bg-cyan-50/50'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            Calendar
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              viewMode === 'table'
                ? 'bg-orange text-white shadow-lg shadow-orange/30'
                : 'text-slate-600 dark:text-slate-300 hover:bg-cyan-50/50'
            }`}
          >
            <List className="w-4 h-4" />
            Table
          </button>
          </div>
        </div>
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
                : 'glass-card-hover text-slate-600 dark:text-slate-300'
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
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{bookings.length}</p>
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

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="mb-6">
          {/* Calendar Header */}
          <div className="command-panel p-6 mb-4">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg hover:bg-cyan-50/50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-white" />
              </button>
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{monthLabel}</h2>
                <button
                  onClick={goToToday}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-cyan/10 text-cyan hover:bg-cyan/20 border border-cyan/20 transition-colors"
                >
                  Today
                </button>
              </div>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-cyan-50/50 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-600 dark:text-white" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-semibold text-cyan-700 dark:text-cyan-300 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square p-1" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dateKey = makeDateKey(day)
                const dayBookings = bookingsByDate[dateKey] || []
                const isToday = dateKey === todayKey
                const isSelected = dateKey === selectedDay
                const hasBookings = dayBookings.length > 0

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(isSelected ? null : dateKey)}
                    className={`
                      aspect-square p-1 rounded-xl transition-all relative flex flex-col items-center overflow-hidden
                      ${isSelected
                        ? 'bg-orange/20 border-2 border-orange ring-2 ring-orange/30'
                        : isToday
                          ? 'bg-cyan/10 border border-cyan/30'
                          : hasBookings
                            ? 'hover:bg-cyan-50/50 border border-transparent hover:border-cyan-200/40'
                            : 'hover:bg-cyan-50/30 border border-transparent'
                      }
                    `}
                  >
                    {/* PSP Logo watermark */}
                    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
                      hasBookings ? 'opacity-[0.08]' : 'opacity-[0.03]'
                    }`}>
                      <Image
                        src="/images/PSP-black-300x99-1.png"
                        alt=""
                        width={40}
                        height={13}
                        className="dark:invert"
                      />
                    </div>

                    <span
                      className={`
                        text-sm font-medium mt-1 relative z-10
                        ${isSelected
                          ? 'text-orange font-bold'
                          : isToday
                            ? 'text-cyan font-bold'
                            : 'text-slate-700 dark:text-slate-300'
                        }
                      `}
                    >
                      {day}
                    </span>

                    {/* Booking dots */}
                    {hasBookings && (
                      <div className="flex flex-wrap justify-center gap-0.5 mt-auto mb-1 max-w-full px-0.5 relative z-10">
                        {dayBookings.slice(0, 4).map((b: any, idx: number) => (
                          <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full ${getStatusDot(b.status)}`}
                          />
                        ))}
                        {dayBookings.length > 4 && (
                          <span className="text-[8px] text-slate-500 dark:text-slate-400 font-bold leading-none">
                            +{dayBookings.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-cyan-200/40">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Status:</span>
              {[
                { label: 'Confirmed', color: 'bg-green-400' },
                { label: 'Pending', color: 'bg-orange' },
                { label: 'Cancelled', color: 'bg-red-400' },
                { label: 'Completed', color: 'bg-cyan' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-xs text-slate-600 dark:text-slate-400">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Day Detail Panel */}
          {selectedDay && (
            <div className="command-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </h3>
                <span className="text-sm text-cyan-700 dark:text-cyan-300 font-medium">
                  {selectedDayBookings.length} booking{selectedDayBookings.length !== 1 ? 's' : ''}
                </span>
              </div>

              {selectedDayBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-10 h-10 text-cyan-700 dark:text-cyan-500 mx-auto mb-2" />
                  <p className="text-slate-600 dark:text-slate-400">No bookings on this day</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayBookings
                    .sort((a: any, b: any) => (a.start_time || '').localeCompare(b.start_time || ''))
                    .map((booking: any) => (
                      <div
                        key={booking.id}
                        className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 p-4 rounded-xl bg-cyan-50/30 dark:bg-white/5 border border-cyan-200/30 dark:border-white/10"
                      >
                        {/* Time */}
                        <div className="flex items-center gap-2 min-w-[140px]">
                          <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
                          </span>
                        </div>

                        {/* Athlete */}
                        <div className="flex items-center gap-2 min-w-[140px]">
                          <User className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                          <span className="text-sm text-slate-800 dark:text-slate-200">
                            {booking.athlete?.full_name || booking.athlete_name || 'Unknown'}
                          </span>
                        </div>

                        {/* Service */}
                        <div className="flex-1">
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {booking.service?.name || booking.service_name || '—'}
                          </span>
                        </div>

                        {/* Amount */}
                        <div className="min-w-[80px]">
                          <span className={`text-sm font-semibold ${getPaymentStatusColor(booking.payment_status)}`}>
                            ${((booking.amount_cents || 0) / 100).toFixed(2)}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border self-start ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {getStatusIcon(booking.status)}
                          <span className="capitalize">{booking.status}</span>
                        </span>

                        {/* Quick Actions */}
                        <div className="flex gap-2 self-start">
                          <button
                            onClick={() => openEditBooking(booking)}
                            className="px-3 py-1.5 bg-cyan/10 hover:bg-cyan/20 text-cyan rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            Edit
                          </button>
                          {booking.status === 'pending' && (
                            <>
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
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <>
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'completed')}
                                className="px-3 py-1.5 bg-cyan/20 hover:bg-cyan/30 text-cyan rounded-lg text-xs font-semibold transition-colors"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'no-show')}
                                className="px-3 py-1.5 bg-slate-500/20 hover:bg-slate-500/30 text-slate-400 rounded-lg text-xs font-semibold transition-colors"
                              >
                                No-Show
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="command-panel overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-orange/30 border-t-orange rounded-full animate-spin mb-4" />
              <p className="text-cyan-800 dark:text-white">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-cyan-700 dark:text-white mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Bookings Found</h3>
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
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{booking.athlete?.full_name}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-slate-900 dark:text-white">{booking.service?.name}</p>
                        <p className="text-xs text-cyan-800 dark:text-white">{booking.duration_minutes} min</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 text-cyan-800 dark:text-white mt-0.5" />
                          <div>
                            <p className="text-sm text-slate-900 dark:text-white">{formatDate(booking.booking_date)}</p>
                            <p className="text-xs text-cyan-800 dark:text-white">
                              {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-cyan-800 dark:text-white" />
                          <p className="text-sm text-slate-900 dark:text-white">{booking.coach?.full_name}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-cyan-800 dark:text-white" />
                          <p className="text-sm text-slate-900 dark:text-white">{booking.location || 'TBD'}</p>
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
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => openEditBooking(booking)}
                            className="px-3 py-1.5 bg-cyan/10 hover:bg-cyan/20 text-cyan rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            Edit
                          </button>
                          {booking.status === 'pending' && (
                            <>
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
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <>
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'completed')}
                                className="px-3 py-1.5 bg-cyan/20 hover:bg-cyan/30 text-cyan rounded-lg text-xs font-semibold transition-colors"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'no-show')}
                                className="px-3 py-1.5 bg-slate-500/20 hover:bg-slate-500/30 text-slate-400 rounded-lg text-xs font-semibold transition-colors"
                              >
                                No-Show
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Booking Modal */}
      {editBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setEditBooking(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-cyan-200/40 shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Booking</h3>
                <p className="text-sm text-cyan-800 dark:text-white/70">
                  {editBooking.athlete?.full_name} &bull; {formatDate(editBooking.booking_date)}
                </p>
              </div>
              <button onClick={() => setEditBooking(null)} className="p-2 hover:bg-cyan-50/50 rounded-lg">
                <X className="w-5 h-5 text-cyan-800 dark:text-white" />
              </button>
            </div>

            {/* Booking Details (read-only summary) */}
            <div className="grid grid-cols-2 gap-3 mb-6 p-4 rounded-xl bg-cyan-50/30 dark:bg-white/5 border border-cyan-200/20">
              <div>
                <p className="text-xs text-cyan-700 dark:text-white/60">Lesson Type</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{editBooking.service?.name || '—'}</p>
                <Link
                  href="/admin/services"
                  className="text-[10px] text-cyan hover:text-orange transition-colors underline underline-offset-2"
                  onClick={() => setEditBooking(null)}
                >
                  Rename in Lesson Builder
                </Link>
              </div>
              <div>
                <p className="text-xs text-cyan-700 dark:text-white/60">Time</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatTime(editBooking.start_time)} – {formatTime(editBooking.end_time)}</p>
              </div>
              <div>
                <p className="text-xs text-cyan-700 dark:text-white/60">Status</p>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold border ${getStatusColor(editBooking.status)}`}>
                  {getStatusIcon(editBooking.status)}
                  <span className="capitalize">{editBooking.status}</span>
                </span>
              </div>
              <div>
                <p className="text-xs text-cyan-700 dark:text-white/60">Payment</p>
                <p className={`text-sm font-semibold capitalize ${getPaymentStatusColor(editBooking.payment_status)}`}>
                  {editBooking.payment_status} &bull; ${((editBooking.amount_cents || 0) / 100).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Editable Notes */}
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-cyan-700 dark:text-white mb-2">
                  <FileText className="w-4 h-4" />
                  Coach Notes
                </label>
                <textarea
                  value={editNotes.coach_notes}
                  onChange={e => setEditNotes({ ...editNotes, coach_notes: e.target.value })}
                  placeholder="Add notes about this session..."
                  rows={3}
                  className="w-full px-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-slate-900 dark:text-white placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan/50 resize-none"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-cyan-700 dark:text-white mb-2">
                  <FileText className="w-4 h-4" />
                  Internal Notes <span className="text-xs text-cyan-600 dark:text-white/50">(admin only)</span>
                </label>
                <textarea
                  value={editNotes.internal_notes}
                  onChange={e => setEditNotes({ ...editNotes, internal_notes: e.target.value })}
                  placeholder="Internal notes (not visible to athletes)..."
                  rows={2}
                  className="w-full px-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-slate-900 dark:text-white placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan/50 resize-none"
                />
              </div>
            </div>

            {/* Quick Status Actions */}
            <div className="mt-6 pt-4 border-t border-cyan-200/20">
              <p className="text-xs font-semibold text-cyan-700 dark:text-white/60 mb-2">Quick Status Change</p>
              <div className="flex flex-wrap gap-2">
                {editBooking.status !== 'confirmed' && (
                  <button onClick={() => { updateBookingStatus(editBooking.id, 'confirmed'); setEditBooking(null) }} className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-xs font-semibold transition-colors">Confirm</button>
                )}
                {editBooking.status !== 'completed' && editBooking.status !== 'cancelled' && (
                  <button onClick={() => { updateBookingStatus(editBooking.id, 'completed'); setEditBooking(null) }} className="px-3 py-1.5 bg-cyan/20 hover:bg-cyan/30 text-cyan rounded-lg text-xs font-semibold transition-colors">Complete</button>
                )}
                {editBooking.status !== 'no-show' && editBooking.status !== 'cancelled' && (
                  <button onClick={() => { updateBookingStatus(editBooking.id, 'no-show'); setEditBooking(null) }} className="px-3 py-1.5 bg-slate-500/20 hover:bg-slate-500/30 text-slate-400 rounded-lg text-xs font-semibold transition-colors">No-Show</button>
                )}
                {editBooking.status !== 'cancelled' && (
                  <button onClick={() => { updateBookingStatus(editBooking.id, 'cancelled'); setEditBooking(null) }} className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-semibold transition-colors">Cancel</button>
                )}
              </div>
            </div>

            {editSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm text-center">
                {editSuccess}
              </div>
            )}

            {/* Save / Close */}
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setEditBooking(null)} className="btn-ghost">Close</button>
              <button onClick={handleEditSave} disabled={editSubmitting} className="btn-primary flex items-center gap-2">
                {editSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editSubmitting ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Book for Athlete Modal */}
      {showBookForAthlete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowBookForAthlete(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-cyan-200/40 shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Book for Athlete</h3>
                <p className="text-sm text-cyan-800 dark:text-white/70">Schedule a lesson on behalf of an athlete</p>
              </div>
              <button onClick={() => setShowBookForAthlete(false)} className="p-2 hover:bg-cyan-50/50 rounded-lg">
                <X className="w-5 h-5 text-cyan-800 dark:text-white" />
              </button>
            </div>

            <form onSubmit={handleBookForAthlete} className="space-y-4">
              {/* Athlete */}
              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">Athlete *</label>
                <select
                  required
                  value={bookFormData.athleteId}
                  onChange={e => setBookFormData({ ...bookFormData, athleteId: e.target.value })}
                  className="w-full px-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan/50"
                >
                  <option value="">Select athlete...</option>
                  {athletes.map(a => (
                    <option key={a.id} value={a.id}>{a.full_name}</option>
                  ))}
                </select>
              </div>

              {/* Service */}
              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">Service *</label>
                <select
                  required
                  value={bookFormData.serviceId}
                  onChange={e => setBookFormData({ ...bookFormData, serviceId: e.target.value })}
                  className="w-full px-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan/50"
                >
                  <option value="">Select service...</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} — ${(s.price_cents / 100).toFixed(2)}</option>
                  ))}
                </select>
              </div>

              {/* Available Slot */}
              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">Time Slot *</label>
                <select
                  required
                  value={bookFormData.slotId}
                  onChange={e => setBookFormData({ ...bookFormData, slotId: e.target.value })}
                  className="w-full px-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan/50"
                >
                  <option value="">Select time slot...</option>
                  {availableSlots.map(slot => (
                    <option key={slot.id} value={slot.id}>
                      {new Date(slot.slot_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      {' '}
                      {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                      {slot.location ? ` @ ${slot.location}` : ''}
                      {' '}({slot.current_bookings}/{slot.max_bookings} booked)
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">Payment Method *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'on_site', label: 'Pay On-Site', desc: 'Collect payment in person' },
                    { value: 'package', label: 'Use Package', desc: 'Deduct from athlete\'s pack' },
                    { value: 'comp', label: 'Complimentary', desc: 'Free session' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setBookFormData({ ...bookFormData, paymentMethod: opt.value as any })}
                      className={`p-3 rounded-xl text-center border transition-all ${
                        bookFormData.paymentMethod === opt.value
                          ? 'bg-orange/10 border-orange/50 text-orange'
                          : 'bg-cyan-50/30 border-cyan-200/40 text-slate-700 dark:text-white hover:border-cyan/40'
                      }`}
                    >
                      <p className="text-sm font-semibold">{opt.label}</p>
                      <p className="text-[10px] mt-0.5 opacity-70">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">Notes (optional)</label>
                <textarea
                  value={bookFormData.notes}
                  onChange={e => setBookFormData({ ...bookFormData, notes: e.target.value })}
                  placeholder="Any notes about this booking..."
                  rows={2}
                  className="w-full px-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-slate-900 dark:text-white placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan/50 resize-none"
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowBookForAthlete(false)} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={bookSubmitting} className="btn-primary flex items-center gap-2">
                  {bookSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {bookSubmitting ? 'Creating...' : 'Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
