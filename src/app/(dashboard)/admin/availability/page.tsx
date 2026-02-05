'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Calendar, Clock, MapPin, Trash2, Loader2 } from 'lucide-react'

export default function AvailabilityManagementPage() {
  const supabase = createClient()
  const [slots, setSlots] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Form state
  const [formData, setFormData] = useState({
    serviceId: '',
    slotDate: '',
    startTime: '',
    endTime: '',
    location: '',
    maxBookings: 1,
  })

  useEffect(() => {
    fetchUser()
    fetchServices()
    fetchSlots()
  }, [])

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchServices = async () => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (data) setServices(data)
  }

  const fetchSlots = async () => {
    setLoading(true)

    const { data } = await supabase
      .from('available_slots')
      .select(`
        *,
        service:service_id (name),
        coach:coach_id (full_name)
      `)
      .gte('slot_date', new Date().toISOString().split('T')[0])
      .order('slot_date', { ascending: true })
      .order('start_time', { ascending: true })

    if (data) setSlots(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    const { error } = await supabase.from('available_slots').insert({
      coach_id: user.id,
      service_id: formData.serviceId || null,
      slot_date: formData.slotDate,
      start_time: formData.startTime,
      end_time: formData.endTime,
      location: formData.location,
      max_bookings: formData.maxBookings,
      current_bookings: 0,
      is_available: true,
    })

    if (!error) {
      setFormData({
        serviceId: '',
        slotDate: '',
        startTime: '',
        endTime: '',
        location: '',
        maxBookings: 1,
      })
      setShowForm(false)
      fetchSlots()
    }
  }

  const deleteSlot = async (slotId: string) => {
    const { error } = await supabase.from('available_slots').delete().eq('id', slotId)

    if (!error) {
      fetchSlots()
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

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
            Availability Management
          </h1>
          <p className="text-slate-400 text-lg">Create and manage your available time slots</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span>Add Time Slot</span>
        </button>
      </div>

      {/* Add Slot Form */}
      {showForm && (
        <div className="command-panel p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-6">Create New Time Slot</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Service */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Service (Optional)
              </label>
              <select
                value={formData.serviceId}
                onChange={e => setFormData({ ...formData, serviceId: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange/50"
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
              <label className="block text-sm font-medium text-slate-300 mb-2">Date *</label>
              <input
                type="date"
                required
                value={formData.slotDate}
                onChange={e => setFormData({ ...formData, slotDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange/50"
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Start Time *</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange/50"
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">End Time *</label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange/50"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Location *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., PSP Training Facility"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange/50"
              />
            </div>

            {/* Max Bookings */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Max Bookings *</label>
              <input
                type="number"
                required
                min="1"
                max="20"
                value={formData.maxBookings}
                onChange={e => setFormData({ ...formData, maxBookings: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange/50"
              />
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
              <button type="submit" className="btn-primary">
                Create Slot
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
            <p className="text-slate-400">Loading time slots...</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Time Slots Yet</h3>
            <p className="text-slate-400 mb-4">
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
              <div key={slot.id} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Date */}
                    <div className="flex items-start gap-2">
                      <Calendar className="w-5 h-5 text-cyan mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-white">{formatDate(slot.slot_date)}</p>
                        <p className="text-xs text-slate-400">
                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                        </p>
                      </div>
                    </div>

                    {/* Service */}
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Service</p>
                      <p className="text-sm text-white">{slot.service?.name || 'Any Service'}</p>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Location</p>
                        <p className="text-sm text-white">{slot.location}</p>
                      </div>
                    </div>

                    {/* Bookings */}
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Bookings</p>
                      <p className="text-sm font-semibold text-white">
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
                    <Trash2 className="w-5 h-5 text-slate-400 group-hover:text-red-400" />
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
