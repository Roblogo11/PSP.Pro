'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Calendar, MapPin, Trash2, Loader2, Repeat } from 'lucide-react'

export default function AvailabilityManagementPage() {
  const supabase = createClient()
  const [slots, setSlots] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state — one form, with optional repeat
  const [formData, setFormData] = useState({
    serviceId: '',
    slotDate: '',
    startTime: '',
    endTime: '',
    location: '',
    maxBookings: 1,
    repeat: false,
    repeatFrequency: 'weekly' as 'weekly' | 'monthly',
    repeatCount: 4,
  })

  useEffect(() => {
    const init = async () => {
      await fetchUser()
      await fetchServices()
    }
    init()
  }, [])

  useEffect(() => {
    if (user) {
      fetchSlots()
    }
  }, [user])

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchServices = async () => {
    const { data, error: fetchError } = await supabase
      .from('services')
      .select('id, name')
      .eq('is_active', true)
      .order('name')

    if (fetchError) {
      console.error('Failed to fetch services:', fetchError)
    }
    if (data) setServices(data)
  }

  const fetchSlots = async () => {
    setLoading(true)

    if (!user) {
      setLoading(false)
      return
    }

    const { data, error: fetchError } = await supabase
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
        service:service_id (name),
        coach:coach_id (full_name)
      `)
      .eq('coach_id', user.id)
      .gte('slot_date', new Date().toISOString().split('T')[0])
      .order('slot_date', { ascending: true })
      .order('start_time', { ascending: true })

    if (fetchError) {
      console.error('Failed to fetch slots:', fetchError)
      setError(`Failed to load time slots: ${fetchError.message}`)
    }
    if (data) setSlots(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!user) {
      setError('You must be logged in to create time slots.')
      return
    }

    setSubmitting(true)

    // Build slot(s) to insert
    const slotsToInsert: any[] = []
    const baseDate = new Date(formData.slotDate + 'T00:00:00')
    const totalSlots = formData.repeat ? formData.repeatCount : 1
    const intervalDays = formData.repeatFrequency === 'weekly' ? 7 : 30

    for (let i = 0; i < totalSlots; i++) {
      const slotDate = new Date(baseDate)
      slotDate.setDate(slotDate.getDate() + i * intervalDays)

      slotsToInsert.push({
        coach_id: user.id,
        service_id: formData.serviceId || null,
        slot_date: slotDate.toISOString().split('T')[0],
        start_time: formData.startTime,
        end_time: formData.endTime,
        location: formData.location,
        max_bookings: formData.maxBookings,
        current_bookings: 0,
        is_available: true,
      })
    }

    const { error: insertError } = await supabase
      .from('available_slots')
      .insert(slotsToInsert)

    setSubmitting(false)

    if (insertError) {
      console.error('Failed to create slot:', insertError)
      setError(`Failed to create time slot: ${insertError.message}`)
      return
    }

    const count = slotsToInsert.length
    setSuccess(
      count === 1
        ? 'Time slot created!'
        : `${count} ${formData.repeatFrequency} time slots created!`
    )
    setFormData({
      serviceId: '',
      slotDate: '',
      startTime: '',
      endTime: '',
      location: '',
      maxBookings: 1,
      repeat: false,
      repeatFrequency: 'weekly',
      repeatCount: 4,
    })
    setShowForm(false)
    fetchSlots()
    setTimeout(() => setSuccess(null), 4000)
  }

  const deleteSlot = async (slotId: string) => {
    if (!user) return
    setError(null)

    const { error: deleteError } = await supabase
      .from('available_slots')
      .delete()
      .eq('id', slotId)

    if (deleteError) {
      console.error('Failed to delete slot:', deleteError)
      setError(`Failed to delete time slot: ${deleteError.message}`)
      return
    }

    setSuccess('Time slot deleted.')
    fetchSlots()
    setTimeout(() => setSuccess(null), 3000)
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

  const inputClasses = "w-full px-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan/50"

  return (
    <div className="min-h-screen px-3 py-4 md:p-8 pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-2">
            Availability Management
          </h1>
          <p className="text-cyan-800 dark:text-white text-lg">Create and manage your available time slots</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span>Add Time Slot</span>
        </button>
      </div>

      {/* Feedback Messages */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          {success}
        </div>
      )}

      {/* Add Slot Form */}
      {showForm && (
        <div className="command-panel p-6 mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Create Time Slot</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Service */}
            <div>
              <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">
                Service (Optional)
              </label>
              <select
                value={formData.serviceId}
                onChange={e => setFormData({ ...formData, serviceId: e.target.value })}
                className={inputClasses}
              >
                <option value="">Any Service</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">Date *</label>
              <input
                type="date"
                required
                value={formData.slotDate}
                onChange={e => setFormData({ ...formData, slotDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className={inputClasses}
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">Start Time *</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                className={inputClasses}
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">End Time *</label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                className={inputClasses}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">Location *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., PSP Training Facility"
                className={inputClasses + " placeholder-cyan-600"}
              />
            </div>

            {/* Max Bookings */}
            <div>
              <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">Max Bookings *</label>
              <input
                type="number"
                required
                min="1"
                max="20"
                value={formData.maxBookings}
                onChange={e => setFormData({ ...formData, maxBookings: parseInt(e.target.value) })}
                className={inputClasses}
              />
            </div>

            {/* Repeat Toggle */}
            <div className="md:col-span-2 p-4 rounded-xl bg-cyan-50/30 border border-cyan-200/20">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.repeat}
                  onChange={e => setFormData({ ...formData, repeat: e.target.checked })}
                  className="w-5 h-5 rounded border-cyan-300 text-cyan focus:ring-cyan/50"
                />
                <Repeat className="w-4 h-4 text-cyan" />
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  Repeat this slot
                </span>
              </label>

              {formData.repeat && (
                <div className="mt-3 flex flex-wrap items-center gap-3 ml-8">
                  <select
                    value={formData.repeatFrequency}
                    onChange={e => setFormData({ ...formData, repeatFrequency: e.target.value as 'weekly' | 'monthly' })}
                    className="px-3 py-2 bg-cyan-50/50 border border-cyan-200/40 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan/50"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <label className="text-sm text-cyan-800 dark:text-white">for</label>
                  <select
                    value={formData.repeatCount}
                    onChange={e => setFormData({ ...formData, repeatCount: parseInt(e.target.value) })}
                    className="px-3 py-2 bg-cyan-50/50 border border-cyan-200/40 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan/50"
                  >
                    {[2, 3, 4, 6, 8, 10, 12].map(n => (
                      <option key={n} value={n}>{n} {formData.repeatFrequency === 'weekly' ? 'weeks' : 'months'}</option>
                    ))}
                  </select>
                  {formData.slotDate && (
                    <span className="text-xs text-cyan-800 dark:text-white/70">
                      ({formData.repeatCount} slots total)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="md:col-span-2 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary flex items-center gap-2" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting
                  ? 'Creating...'
                  : formData.repeat
                    ? `Create ${formData.repeatCount} Slots`
                    : 'Create Slot'
                }
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Slots List */}
      <div className="command-panel">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-orange mx-auto mb-4 animate-spin" />
            <p className="text-cyan-800 dark:text-white">Loading time slots...</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-cyan-700 dark:text-white mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Time Slots Yet</h3>
            <p className="text-cyan-800 dark:text-white mb-4">
              Create your first time slot to start accepting bookings.
            </p>
            <button onClick={() => setShowForm(true)} className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>Add Time Slot</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {slots.map(slot => (
              <div key={slot.id} className="p-4 hover:bg-cyan-50/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Date */}
                    <div className="flex items-start gap-2">
                      <Calendar className="w-5 h-5 text-cyan mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatDate(slot.slot_date)}</p>
                        <p className="text-xs text-cyan-800 dark:text-white">
                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                        </p>
                      </div>
                    </div>

                    {/* Service */}
                    <div>
                      <p className="text-xs text-cyan-800 dark:text-white mb-1">Service</p>
                      <p className="text-sm text-slate-900 dark:text-white">{slot.service?.name || 'Any Service'}</p>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-cyan-800 dark:text-white mt-0.5" />
                      <div>
                        <p className="text-xs text-cyan-800 dark:text-white mb-1">Location</p>
                        <p className="text-sm text-slate-900 dark:text-white">{slot.location}</p>
                      </div>
                    </div>

                    {/* Bookings */}
                    <div>
                      <p className="text-xs text-cyan-800 dark:text-white mb-1">Bookings</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {slot.current_bookings} / {slot.max_bookings}
                      </p>
                      <p
                        className={`text-xs font-semibold ${
                          slot.is_available ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {slot.is_available ? 'Available' : 'Full'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => deleteSlot(slot.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                    title="Delete slot"
                  >
                    <Trash2 className="w-5 h-5 text-cyan-800 dark:text-white group-hover:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
