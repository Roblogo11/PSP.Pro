'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getLocalDateString } from '@/lib/utils/local-date'
import { Calendar } from '@/components/booking/calendar'
import { ServiceSelector } from '@/components/booking/service-selector'
import { TimeSlotPicker } from '@/components/booking/time-slot-picker'
import { CheckCircle2, ArrowRight, ArrowLeft, Loader2, CalendarDays, CreditCard, Wallet } from 'lucide-react'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { toastError } from '@/lib/toast'

type BookingStep = 'service' | 'date' | 'time' | 'confirm'

export default function BookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { isImpersonating } = useUserRole()

  // State
  const [currentStep, setCurrentStep] = useState<BookingStep>('service')
  const [services, setServices] = useState<any[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [timeSlots, setTimeSlots] = useState<any[]>([])
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [bookedSlotIds, setBookedSlotIds] = useState<string[]>([])
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'on_site'>('card')
  const [orgContext, setOrgContext] = useState<{ name: string; logo_url: string | null; primary_color: string; secondary_color: string; tagline: string | null; slug: string } | null>(null)

  // Check for URL params
  const canceled = searchParams.get('canceled')
  const preselectedServiceId = searchParams.get('service')
  const preselectedCoachId = searchParams.get('coach')
  const orgId = searchParams.get('org')

  // Fetch org context if ?org= param present
  useEffect(() => {
    if (!orgId) return
    fetch(`/api/org/${orgId}`)
      .then(r => r.json())
      .then(data => { if (data.org) setOrgContext(data.org) })
      .catch(() => {})
  }, [orgId])

  // Fetch services on mount
  useEffect(() => {
    fetchServices()
  }, [])

  // Auto-select service from URL param after services load
  useEffect(() => {
    if (preselectedServiceId && services.length > 0 && !selectedServiceId) {
      const match = services.find(s => s.id === preselectedServiceId)
      if (match) {
        setSelectedServiceId(match.id)
        setCurrentStep('date')
      }
    }
  }, [preselectedServiceId, services, selectedServiceId])

  // Fetch time slots when date is selected
  useEffect(() => {
    if (selectedDate && selectedServiceId) {
      fetchTimeSlots()
      fetchUserBookings()
    }
  }, [selectedDate, selectedServiceId])

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (data) {
      setServices(data)
    } else if (error) {
      console.error('Error fetching services:', error)
    }
  }

  const fetchTimeSlots = async () => {
    if (!selectedDate || !selectedServiceId) return

    setLoading(true)
    const dateString = getLocalDateString(selectedDate)

    let query = supabase
      .from('available_slots')
      .select(`
        id,
        coach_id,
        service_id,
        slot_date,
        start_time,
        end_time,
        location,
        max_bookings,
        current_bookings,
        is_available,
        coach:coach_id (full_name)
      `)
      .eq('slot_date', dateString)
      .eq('is_available', true)
      .order('start_time', { ascending: true })

    // Filter by coach if pre-selected via URL param
    if (preselectedCoachId) {
      query = query.eq('coach_id', preselectedCoachId)
    }

    const { data, error } = await query

    if (data) {
      const slotsWithCoachNames = data.map(slot => ({
        ...slot,
        coach_name: (slot.coach as any)?.full_name || 'Coach',
      }))
      setTimeSlots(slotsWithCoachNames)
    }

    setLoading(false)
  }

  const fetchUserBookings = async () => {
    if (!selectedDate) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const dateString = getLocalDateString(selectedDate)
    const { data } = await supabase
      .from('bookings')
      .select('slot_id')
      .eq('athlete_id', user.id)
      .eq('booking_date', dateString)
      .in('status', ['confirmed', 'pending'])

    if (data) {
      setBookedSlotIds(data.map(b => b.slot_id).filter(Boolean))
    }
  }

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId)
    setCurrentStep('date')
    setSelectedDate(null)
    setSelectedSlotId(null)
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setCurrentStep('time')
    setSelectedSlotId(null)
  }

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlotId(slotId)
    setCurrentStep('confirm')
  }

  const handleConfirmBooking = async () => {
    if (!selectedServiceId || !selectedDate || !selectedSlotId || isImpersonating) return

    setSubmitting(true)

    try {
      // Get user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirect=/booking')
        return
      }

      // Get service and slot details
      const service = services.find(s => s.id === selectedServiceId)
      const slot = timeSlots.find(s => s.id === selectedSlotId)

      if (!service || !slot) {
        throw new Error('Service or slot not found')
      }

      if (paymentMethod === 'on_site') {
        // Pay on site — create booking directly without Stripe
        const response = await fetch('/api/bookings/pay-on-site', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceId: service.id,
            slotId: slot.id,
            date: getLocalDateString(selectedDate),
            startTime: slot.start_time,
            endTime: slot.end_time,
            durationMinutes: service.duration_minutes,
            location: slot.location,
            coachId: slot.coach_id,
            ...(orgId && { orgId }),
          }),
        })

        const data = await response.json()

        if (!response.ok || data.error) {
          throw new Error(data.error || 'Failed to create booking')
        }

        router.push('/booking/success?method=on_site')
      } else {
        // Pay online — Stripe Checkout
        const response = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceId: service.id,
            bookingData: {
              coachId: slot.coach_id,
              slotId: slot.id,
              date: getLocalDateString(selectedDate),
              startTime: slot.start_time,
              endTime: slot.end_time,
              durationMinutes: service.duration_minutes,
              location: slot.location,
              ...(orgId && { orgId }),
            },
          }),
        })

        const { url, error } = await response.json()

        if (error) throw new Error(error)

        // Redirect to Stripe Checkout
        if (url) {
          window.location.href = url
        }
      }
    } catch (error: any) {
      console.error('Booking error:', error)
      toastError(error.message || 'Failed to create booking. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedService = services.find(s => s.id === selectedServiceId)
  const selectedSlot = timeSlots.find(s => s.id === selectedSlotId)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const formattedHour = hour % 12 || 12
    return `${formattedHour}:${minutes} ${ampm}`
  }

  return (
    <div className="min-h-screen px-3 py-4 md:p-8 pb-24 lg:pb-8">

      {/* Org Context Banner */}
      {orgContext && (
        <div
          className="mb-6 rounded-2xl p-4 flex items-center gap-4 border"
          style={{
            background: `linear-gradient(135deg, ${orgContext.primary_color}18, ${orgContext.secondary_color}10)`,
            borderColor: `${orgContext.primary_color}30`,
          }}
        >
          {/* Logo or letter avatar */}
          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-white flex items-center justify-center shadow-sm">
            {orgContext.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={orgContext.logo_url} alt={orgContext.name} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-black text-xl text-white" style={{ backgroundColor: orgContext.primary_color }}>
                {orgContext.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base truncate" style={{ color: orgContext.primary_color }}>
              {orgContext.name}
            </p>
            {orgContext.tagline && (
              <p className="text-sm truncate" style={{ color: orgContext.secondary_color }}>
                {orgContext.tagline}
              </p>
            )}
          </div>
          <a
            href={`/org/${orgContext.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium whitespace-nowrap flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: orgContext.primary_color }}
          >
            View page ↗
          </a>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <CalendarDays className="w-8 h-8 text-orange" />
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white">
            Book a Session
          </h1>
        </div>
        <p className="text-cyan-800 dark:text-white text-lg">
          Schedule your next training session in just a few clicks
        </p>
      </div>

      {/* Canceled Alert */}
      {canceled && (
        <div className="mb-6 p-4 rounded-xl bg-orange/10 border border-orange/20">
          <p className="text-sm text-orange">
            Payment was canceled. You can try booking again when ready.
          </p>
        </div>
      )}

      {/* Progress Steps */}
      <div className="mb-8 flex items-center gap-4 overflow-x-auto pb-2">
        {[
          { key: 'service', label: 'Service' },
          { key: 'date', label: 'Date' },
          { key: 'time', label: 'Time' },
          { key: 'confirm', label: 'Confirm' },
        ].map((step, index) => {
          const stepIndex = ['service', 'date', 'time', 'confirm'].indexOf(currentStep)
          const isActive = step.key === currentStep
          const isCompleted = index < stepIndex

          return (
            <div key={step.key} className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all
                    ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-orange text-white'
                        : 'bg-white/10 text-cyan-700'
                    }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                </div>
                <span
                  className={`font-semibold whitespace-nowrap ${
                    isActive ? 'text-slate-900 dark:text-white' : isCompleted ? 'text-green-400' : 'text-cyan-700'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < 3 && (
                <div
                  className={`h-0.5 w-12 ${
                    isCompleted ? 'bg-green-500' : 'bg-white/10'
                  } transition-all`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStep === 'service' && (
            <ServiceSelector
              services={services}
              selectedServiceId={selectedServiceId}
              onSelectService={handleServiceSelect}
            />
          )}

          {currentStep === 'date' && (
            <Calendar
              selectedDate={selectedDate}
              onSelectDate={handleDateSelect}
              minDate={new Date()}
            />
          )}

          {currentStep === 'time' && (
            <TimeSlotPicker
              timeSlots={timeSlots}
              selectedSlotId={selectedSlotId}
              onSelectSlot={handleSlotSelect}
              loading={loading}
              bookedSlotIds={bookedSlotIds}
            />
          )}

          {currentStep === 'confirm' && selectedService && selectedSlot && selectedDate && (
            <div className="glass-card p-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Confirm Your Booking</h3>

              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-lg bg-cyan-50/50 border border-cyan-200/40">
                  <p className="text-sm text-cyan-800 dark:text-white mb-1">Service</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedService.name}</p>
                  <p className="text-sm text-cyan-700 dark:text-white">{selectedService.duration_minutes} minutes</p>
                </div>

                <div className="p-4 rounded-lg bg-cyan-50/50 border border-cyan-200/40">
                  <p className="text-sm text-cyan-800 dark:text-white mb-1">Date & Time</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{formatDate(selectedDate)}</p>
                  <p className="text-sm text-cyan-700 dark:text-white">
                    {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-cyan-50/50 border border-cyan-200/40">
                  <p className="text-sm text-cyan-800 dark:text-white mb-1">Coach</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedSlot.coach_name}</p>
                </div>

                <div className="p-4 rounded-lg bg-cyan-50/50 border border-cyan-200/40">
                  <p className="text-sm text-cyan-800 dark:text-white mb-1">Location</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedSlot.location}</p>
                </div>

                <div className="p-4 rounded-lg bg-orange/10 border border-orange/20">
                  <p className="text-sm text-orange mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    ${(selectedService.price_cents / 100).toFixed(2)}
                  </p>
                </div>

                {/* Payment Method Toggle */}
                <div className="p-4 rounded-lg bg-cyan-50/50 border border-cyan-200/40">
                  <p className="text-sm text-cyan-800 dark:text-white mb-3 font-semibold">Payment Method</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left ${
                        paymentMethod === 'card'
                          ? 'border-orange bg-orange/10 text-slate-900 dark:text-white'
                          : 'border-white/10 bg-white/5 text-cyan-700 dark:text-cyan-300 hover:border-white/20'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">Pay Online</p>
                        <p className="text-xs opacity-70">Card via Stripe</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('on_site')}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left ${
                        paymentMethod === 'on_site'
                          ? 'border-orange bg-orange/10 text-slate-900 dark:text-white'
                          : 'border-white/10 bg-white/5 text-cyan-700 dark:text-cyan-300 hover:border-white/20'
                      }`}
                    >
                      <Wallet className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">Pay at Location</p>
                        <p className="text-xs opacity-70">Cash or card on site</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleConfirmBooking}
                disabled={submitting || isImpersonating}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isImpersonating ? (
                  <span>Read-only mode — booking disabled</span>
                ) : submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : paymentMethod === 'on_site' ? (
                  <>
                    <span>Confirm Booking</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-xs text-cyan-800 dark:text-white text-center mt-4">
                {paymentMethod === 'on_site'
                  ? 'Your booking will be pending until confirmed. Please bring payment to your session.'
                  : "You'll be redirected to Stripe to complete your payment securely"}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Booking Summary</h3>

            <div className="space-y-4">
              {selectedService ? (
                <div>
                  <p className="text-xs text-cyan-800 dark:text-white mb-1">Service</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedService.name}</p>
                  <p className="text-xs text-cyan-700 dark:text-white mt-1">
                    ${(selectedService.price_cents / 100).toFixed(2)} • {selectedService.duration_minutes} min
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-cyan-50/50 border border-dashed border-white/20">
                  <p className="text-xs text-cyan-800 dark:text-white">No service selected</p>
                </div>
              )}

              {selectedDate ? (
                <div>
                  <p className="text-xs text-cyan-800 dark:text-white mb-1">Date</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatDate(selectedDate)}</p>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-cyan-50/50 border border-dashed border-white/20">
                  <p className="text-xs text-cyan-800 dark:text-white">No date selected</p>
                </div>
              )}

              {selectedSlot ? (
                <div>
                  <p className="text-xs text-cyan-800 dark:text-white mb-1">Time</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
                  </p>
                  <p className="text-xs text-cyan-700 dark:text-white mt-1">{selectedSlot.coach_name}</p>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-cyan-50/50 border border-dashed border-white/20">
                  <p className="text-xs text-cyan-800 dark:text-white">No time selected</p>
                </div>
              )}
            </div>

            {currentStep !== 'service' && (
              <button
                onClick={() => {
                  if (currentStep === 'confirm') setCurrentStep('time')
                  else if (currentStep === 'time') setCurrentStep('date')
                  else if (currentStep === 'date') setCurrentStep('service')
                }}
                className="w-full mt-6 btn-ghost flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
