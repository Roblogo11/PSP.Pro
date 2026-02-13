'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getLocalDateString } from '@/lib/utils/local-date'
import { Plus, Calendar, MapPin, Trash2, Loader2, Repeat, Edit2, X, AlertTriangle, UserPlus, CheckSquare, Square } from 'lucide-react'
import Link from 'next/link'

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

  // Edit modal state
  const [editSlot, setEditSlot] = useState<any>(null)
  const [editData, setEditData] = useState({
    serviceId: '',
    startTime: '',
    endTime: '',
    location: '',
    maxBookings: 1,
  })
  const [editSubmitting, setEditSubmitting] = useState(false)

  // Bulk edit state
  const [bulkMode, setBulkMode] = useState(false)
  const [selectedSlotIds, setSelectedSlotIds] = useState<Set<string>>(new Set())
  const [showBulkEditModal, setShowBulkEditModal] = useState(false)
  const [bulkAction, setBulkAction] = useState<'edit' | 'delete'>('edit')
  const [bulkEditData, setBulkEditData] = useState({
    serviceId: '',
    startTime: '',
    endTime: '',
    location: '',
    maxBookings: '',
  })
  const [bulkSubmitting, setBulkSubmitting] = useState(false)

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
      .gte('slot_date', getLocalDateString())
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
    // Parse date parts directly to avoid timezone shift (toISOString converts to UTC)
    const [baseYear, baseMonth, baseDay] = formData.slotDate.split('-').map(Number)
    const totalSlots = formData.repeat ? formData.repeatCount : 1
    const intervalDays = formData.repeatFrequency === 'weekly' ? 7 : 30

    for (let i = 0; i < totalSlots; i++) {
      const slotDate = new Date(baseYear, baseMonth - 1, baseDay + i * intervalDays)
      // Format as YYYY-MM-DD without timezone conversion
      const yyyy = slotDate.getFullYear()
      const mm = String(slotDate.getMonth() + 1).padStart(2, '0')
      const dd = String(slotDate.getDate()).padStart(2, '0')

      slotsToInsert.push({
        coach_id: user.id,
        service_id: formData.serviceId || null,
        slot_date: `${yyyy}-${mm}-${dd}`,
        start_time: formData.startTime,
        end_time: formData.endTime,
        location: formData.location,
        max_bookings: formData.maxBookings,
        current_bookings: 0,
        is_available: true,
      })
    }

    // Use upsert to skip duplicates instead of failing on unique constraint
    const { data: insertedData, error: insertError } = await supabase
      .from('available_slots')
      .upsert(slotsToInsert, { onConflict: 'coach_id,slot_date,start_time', ignoreDuplicates: true })
      .select('id')

    setSubmitting(false)

    if (insertError) {
      console.error('Failed to create slot:', insertError)
      setError(`Failed to create time slot: ${insertError.message}`)
      return
    }

    const created = insertedData?.length ?? slotsToInsert.length
    const skipped = slotsToInsert.length - created
    setSuccess(
      skipped > 0
        ? `Created ${created} slot${created !== 1 ? 's' : ''} (${skipped} already existed)`
        : created === 1
          ? 'Time slot created!'
          : `${created} ${formData.repeatFrequency} time slots created!`
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

  // Week filter
  const [weekFilter, setWeekFilter] = useState<'all' | '1' | '2' | '3' | '4'>('all')

  const getFilteredSlots = () => {
    if (weekFilter === 'all') return slots
    const weeksAhead = parseInt(weekFilter)
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const end = new Date(start)
    end.setDate(end.getDate() + weeksAhead * 7)
    return slots.filter(s => {
      const d = new Date(s.slot_date + 'T12:00:00')
      return d >= start && d < end
    })
  }

  const filteredSlots = getFilteredSlots()

  // Bulk edit helpers
  const toggleSlotSelection = (slotId: string) => {
    setSelectedSlotIds(prev => {
      const next = new Set(prev)
      if (next.has(slotId)) next.delete(slotId)
      else next.add(slotId)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedSlotIds.size === filteredSlots.length) {
      setSelectedSlotIds(new Set())
    } else {
      setSelectedSlotIds(new Set(filteredSlots.map(s => s.id)))
    }
  }

  const exitBulkMode = () => {
    setBulkMode(false)
    setSelectedSlotIds(new Set())
    setShowBulkEditModal(false)
  }

  const openBulkAction = (action: 'edit' | 'delete') => {
    setBulkAction(action)
    setBulkEditData({ serviceId: '', startTime: '', endTime: '', location: '', maxBookings: '' })
    setShowBulkEditModal(true)
  }

  const handleBulkEdit = async () => {
    if (selectedSlotIds.size === 0) return
    setBulkSubmitting(true)
    setError(null)

    const updates: any = {}
    if (bulkEditData.serviceId) updates.service_id = bulkEditData.serviceId === '__none__' ? null : bulkEditData.serviceId
    if (bulkEditData.startTime) updates.start_time = bulkEditData.startTime
    if (bulkEditData.endTime) updates.end_time = bulkEditData.endTime
    if (bulkEditData.location) updates.location = bulkEditData.location
    if (bulkEditData.maxBookings) updates.max_bookings = parseInt(bulkEditData.maxBookings)

    if (Object.keys(updates).length === 0) {
      setBulkSubmitting(false)
      setError('Fill in at least one field to update.')
      return
    }

    const ids = Array.from(selectedSlotIds)
    const { error: updateError } = await supabase
      .from('available_slots')
      .update(updates)
      .in('id', ids)

    setBulkSubmitting(false)

    if (updateError) {
      console.error('Bulk update error:', updateError)
      setError(`Failed to update slots: ${updateError.message}`)
      return
    }

    setSuccess(`Updated ${ids.length} slot${ids.length !== 1 ? 's' : ''}!`)
    exitBulkMode()
    fetchSlots()
    setTimeout(() => setSuccess(null), 4000)
  }

  const handleBulkDelete = async () => {
    if (selectedSlotIds.size === 0) return

    const slotsWithBookings = slots.filter(s => selectedSlotIds.has(s.id) && s.current_bookings > 0)
    if (slotsWithBookings.length > 0) {
      const proceed = window.confirm(
        `${slotsWithBookings.length} of your selected slots have active bookings. Deleting will affect those athletes. Continue?`
      )
      if (!proceed) return
    }

    setBulkSubmitting(true)
    setError(null)

    const ids = Array.from(selectedSlotIds)
    const { error: deleteError } = await supabase
      .from('available_slots')
      .delete()
      .in('id', ids)

    setBulkSubmitting(false)

    if (deleteError) {
      console.error('Bulk delete error:', deleteError)
      setError(`Failed to delete slots: ${deleteError.message}`)
      return
    }

    setSuccess(`Deleted ${ids.length} slot${ids.length !== 1 ? 's' : ''}!`)
    exitBulkMode()
    fetchSlots()
    setTimeout(() => setSuccess(null), 4000)
  }

  const openEditModal = (slot: any) => {
    setEditSlot(slot)
    setEditData({
      serviceId: slot.service_id || '',
      startTime: slot.start_time?.substring(0, 5) || '',
      endTime: slot.end_time?.substring(0, 5) || '',
      location: slot.location || '',
      maxBookings: slot.max_bookings || 1,
    })
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editSlot) return

    setEditSubmitting(true)
    setError(null)

    const { error: updateError } = await supabase
      .from('available_slots')
      .update({
        service_id: editData.serviceId || null,
        start_time: editData.startTime,
        end_time: editData.endTime,
        location: editData.location,
        max_bookings: editData.maxBookings,
      })
      .eq('id', editSlot.id)

    setEditSubmitting(false)

    if (updateError) {
      console.error('Failed to update slot:', updateError)
      setError(`Failed to update time slot: ${updateError.message}`)
      return
    }

    setSuccess('Time slot updated!')
    setEditSlot(null)
    fetchSlots()
    setTimeout(() => setSuccess(null), 3000)
  }

  const formatDate = (date: string) => {
    // Append T12:00:00 to prevent UTC midnight from shifting to previous day in US timezones
    return new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
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

  const inputClasses = "w-full px-4 py-3 bg-cyan-50 dark:bg-slate-800 border border-cyan-200/40 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan/50"

  return (
    <div className="min-h-screen px-3 py-4 md:p-8 pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-2">
            Availability Management
          </h1>
          <p className="text-cyan-800 dark:text-white text-lg">Create and manage your available time slots</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-start">
          <button
            onClick={() => bulkMode ? exitBulkMode() : setBulkMode(true)}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border transition-all ${
              bulkMode
                ? 'border-orange/50 bg-orange/10 text-orange'
                : 'border-cyan-300/40 dark:border-white/10 bg-white/60 dark:bg-white/5 text-cyan-800 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-white/10'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            {bulkMode ? 'Cancel Bulk' : 'Bulk Edit'}
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            <span>Add Time Slot</span>
          </button>
        </div>
      </div>

      {/* Week Filter */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-cyan-700 dark:text-white/70 mr-1">Show:</span>
        {[
          { value: 'all', label: 'All Upcoming' },
          { value: '1', label: 'This Week' },
          { value: '2', label: '2 Weeks' },
          { value: '3', label: '3 Weeks' },
          { value: '4', label: '4 Weeks' },
        ].map(opt => (
          <button
            key={opt.value}
            onClick={() => { setWeekFilter(opt.value as any); setSelectedSlotIds(new Set()) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              weekFilter === opt.value
                ? 'bg-cyan text-white shadow-lg shadow-cyan/30'
                : 'bg-cyan/5 text-cyan-700 dark:text-cyan-300 hover:bg-cyan/10 border border-cyan/20'
            }`}
          >
            {opt.label}
          </button>
        ))}
        <span className="text-xs text-cyan-700 dark:text-white/50 ml-2">
          {filteredSlots.length} slot{filteredSlots.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Bulk Action Bar */}
      {bulkMode && (
        <div className="mb-4 p-3 rounded-xl bg-orange/5 border border-orange/20 flex flex-wrap items-center gap-3">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-white hover:text-orange transition-colors"
          >
            {selectedSlotIds.size === filteredSlots.length && filteredSlots.length > 0
              ? <CheckSquare className="w-4 h-4 text-orange" />
              : <Square className="w-4 h-4" />
            }
            {selectedSlotIds.size === filteredSlots.length && filteredSlots.length > 0 ? 'Deselect All' : 'Select All'}
          </button>
          <span className="text-xs text-cyan-700 dark:text-white/60">
            {selectedSlotIds.size} selected
          </span>
          <div className="flex-1" />
          <button
            onClick={() => openBulkAction('edit')}
            disabled={selectedSlotIds.size === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan/10 text-cyan hover:bg-cyan/20 border border-cyan/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Selected
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={selectedSlotIds.size === 0 || bulkSubmitting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {bulkSubmitting && bulkAction === 'delete' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Delete Selected
          </button>
        </div>
      )}

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

      {/* Tip: Book for Athlete */}
      <Link href="/admin/bookings?action=book">
        <div className="mb-6 p-4 rounded-xl bg-orange/10 border border-orange/30 flex items-center gap-3 hover:bg-orange/15 transition-all cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-orange/20 flex items-center justify-center flex-shrink-0">
            <UserPlus className="w-5 h-5 text-orange" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-orange transition-colors">
              Need to reserve a slot for an existing client?
            </p>
            <p className="text-xs text-cyan-700 dark:text-white/70">
              Use &quot;Book for Athlete&quot; to assign a time slot to a specific player and block it from public booking.
            </p>
          </div>
          <span className="text-orange text-sm font-semibold whitespace-nowrap">Book Now &rarr;</span>
        </div>
      </Link>

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
                min={getLocalDateString()}
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
                    className="px-3 py-2 bg-cyan-50 dark:bg-slate-800 border border-cyan-200/40 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan/50"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <label className="text-sm text-cyan-800 dark:text-white">for</label>
                  <select
                    value={formData.repeatCount}
                    onChange={e => setFormData({ ...formData, repeatCount: parseInt(e.target.value) })}
                    className="px-3 py-2 bg-cyan-50 dark:bg-slate-800 border border-cyan-200/40 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan/50"
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
        ) : filteredSlots.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-cyan-700 dark:text-white mx-auto mb-4" />
            {slots.length > 0 ? (
              <>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Slots in This Range</h3>
                <p className="text-cyan-800 dark:text-white mb-4">
                  No time slots found within the selected timeframe. Try a different filter.
                </p>
                <button onClick={() => setWeekFilter('all')} className="btn-primary inline-flex items-center gap-2">
                  Show All
                </button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Time Slots Yet</h3>
                <p className="text-cyan-800 dark:text-white mb-4">
                  Create your first time slot to start accepting bookings.
                </p>
                <button onClick={() => setShowForm(true)} className="btn-primary inline-flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  <span>Add Time Slot</span>
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredSlots.map(slot => (
              <div key={slot.id} className={`p-4 hover:bg-cyan-50/50 transition-colors ${bulkMode && selectedSlotIds.has(slot.id) ? 'bg-orange/5' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  {/* Bulk checkbox */}
                  {bulkMode && (
                    <button
                      onClick={() => toggleSlotSelection(slot.id)}
                      className="mt-1 flex-shrink-0"
                    >
                      {selectedSlotIds.has(slot.id)
                        ? <CheckSquare className="w-5 h-5 text-orange" />
                        : <Square className="w-5 h-5 text-cyan-700 dark:text-white/50" />
                      }
                    </button>
                  )}
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
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(slot)}
                      className="p-2 hover:bg-cyan/20 rounded-lg transition-colors group"
                      title="Edit slot"
                    >
                      <Edit2 className="w-5 h-5 text-cyan-800 dark:text-white group-hover:text-cyan" />
                    </button>
                    <button
                      onClick={() => deleteSlot(slot.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                      title="Delete slot"
                    >
                      <Trash2 className="w-5 h-5 text-cyan-800 dark:text-white group-hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Edit Modal */}
      {showBulkEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowBulkEditModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-cyan-200/40 shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Bulk Edit Slots</h3>
                <p className="text-sm text-cyan-800 dark:text-white/70">
                  Updating {selectedSlotIds.size} slot{selectedSlotIds.size !== 1 ? 's' : ''}. Only filled fields will be changed.
                </p>
              </div>
              <button onClick={() => setShowBulkEditModal(false)} className="p-2 hover:bg-cyan-50/50 rounded-lg transition-colors">
                <X className="w-5 h-5 text-cyan-800 dark:text-white" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Service */}
              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">Service <span className="text-xs text-white/50">(leave blank to skip)</span></label>
                <select
                  value={bulkEditData.serviceId}
                  onChange={e => setBulkEditData({ ...bulkEditData, serviceId: e.target.value })}
                  className={inputClasses}
                >
                  <option value="">— Don&apos;t change —</option>
                  <option value="__none__">Any Service (clear)</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
              </div>

              {/* Start / End Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">Start Time</label>
                  <input
                    type="time"
                    value={bulkEditData.startTime}
                    onChange={e => setBulkEditData({ ...bulkEditData, startTime: e.target.value })}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">End Time</label>
                  <input
                    type="time"
                    value={bulkEditData.endTime}
                    onChange={e => setBulkEditData({ ...bulkEditData, endTime: e.target.value })}
                    className={inputClasses}
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">Location</label>
                <input
                  type="text"
                  value={bulkEditData.location}
                  onChange={e => setBulkEditData({ ...bulkEditData, location: e.target.value })}
                  placeholder="Leave blank to keep current"
                  className={inputClasses + " placeholder-cyan-600 dark:placeholder-white/40"}
                />
              </div>

              {/* Max Bookings */}
              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">Max Bookings</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={bulkEditData.maxBookings}
                  onChange={e => setBulkEditData({ ...bulkEditData, maxBookings: e.target.value })}
                  placeholder="Leave blank to keep current"
                  className={inputClasses + " placeholder-cyan-600 dark:placeholder-white/40"}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowBulkEditModal(false)} className="btn-ghost">
                  Cancel
                </button>
                <button
                  onClick={handleBulkEdit}
                  disabled={bulkSubmitting}
                  className="btn-primary flex items-center gap-2"
                >
                  {bulkSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {bulkSubmitting ? 'Updating...' : `Update ${selectedSlotIds.size} Slots`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Slot Modal */}
      {editSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setEditSlot(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-cyan-200/40 shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Time Slot</h3>
                <p className="text-sm text-cyan-800 dark:text-white/70">{formatDate(editSlot.slot_date)}</p>
              </div>
              <button onClick={() => setEditSlot(null)} className="p-2 hover:bg-cyan-50/50 rounded-lg transition-colors">
                <X className="w-5 h-5 text-cyan-800 dark:text-white" />
              </button>
            </div>

            {editSlot.current_bookings > 0 && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-300">
                  This slot has {editSlot.current_bookings} active booking{editSlot.current_bookings > 1 ? 's' : ''}. Changes will affect those athletes.
                </p>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Service */}
              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">Service</label>
                <select
                  value={editData.serviceId}
                  onChange={e => setEditData({ ...editData, serviceId: e.target.value })}
                  className={inputClasses}
                >
                  <option value="">Any Service</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
              </div>

              {/* Start / End Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">Start Time</label>
                  <input
                    type="time"
                    required
                    value={editData.startTime}
                    onChange={e => setEditData({ ...editData, startTime: e.target.value })}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">End Time</label>
                  <input
                    type="time"
                    required
                    value={editData.endTime}
                    onChange={e => setEditData({ ...editData, endTime: e.target.value })}
                    className={inputClasses}
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">Location</label>
                <input
                  type="text"
                  required
                  value={editData.location}
                  onChange={e => setEditData({ ...editData, location: e.target.value })}
                  className={inputClasses + " placeholder-cyan-600"}
                />
              </div>

              {/* Max Bookings */}
              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">Max Bookings</label>
                <input
                  type="number"
                  required
                  min={editSlot.current_bookings || 1}
                  max={20}
                  value={editData.maxBookings}
                  onChange={e => setEditData({ ...editData, maxBookings: parseInt(e.target.value) })}
                  className={inputClasses}
                />
                {editSlot.current_bookings > 0 && (
                  <p className="text-xs text-cyan-700 dark:text-white/60 mt-1">
                    Minimum {editSlot.current_bookings} (current bookings)
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setEditSlot(null)} className="btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex items-center gap-2" disabled={editSubmitting}>
                  {editSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
