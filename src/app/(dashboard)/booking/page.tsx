'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Calendar } from '@/components/booking/calendar'
import { ServiceSelector } from '@/components/booking/service-selector'
import { TimeSlotPicker } from '@/components/booking/time-slot-picker'
import { CheckCircle2, ArrowRight, ArrowLeft, Loader2, CalendarDays } from 'lucide-react'
import { useUserRole } from '@/lib/hooks/use-user-role'

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

  // Check for canceled parameter
  const canceled = searchParams.get('canceled')

  // Fetch services on mount
  useEffect(() => {
    fetchServices()
  }, [])

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
    const dateString = selectedDate.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('available_slots')
      .select(`
        *,
        coach:coach_id (full_name)
      `)
      .eq('slot_date', dateString)
      .eq('is_available', true)
      .order('start_time', { ascending: true })

    if (data) {
      const slotsWithCoachNames = data.map(slot => ({
        ...slot,
        coach_name: slot.coach?.full_name || 'Coach',
      }))
      setTimeSlots(slotsWithCoachNames)
    }

    setLoading(false)
  }

  const fetchUserBookings = async () => {
    if (!selectedDate) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const dateString = selectedDate.toISOString().split('T')[0]
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

      // Create checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          bookingData: {
            coachId: slot.coach_id,
            slotId: slot.id,
            date: selectedDate.toISOString().split('T')[0],
            startTime: slot.start_time,
            endTime: slot.end_time,
            durationMinutes: service.duration_minutes,
            location: slot.location,
          },
        }),
      })

      const { url, error } = await response.json()

      if (error) throw new Error(error)

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url
      }
    } catch (error: any) {
      console.error('Booking error:', error)
      alert(error.message || 'Failed to create booking. Please try again.')
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
                ) : (
                  <>
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-xs text-cyan-800 dark:text-white text-center mt-4">
                You'll be redirected to Stripe to complete your payment securely
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
