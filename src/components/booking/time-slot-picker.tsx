'use client'

import { Clock, MapPin, User } from 'lucide-react'

interface TimeSlot {
  id: string
  start_time: string
  end_time: string
  location: string
  coach_name: string
  is_available: boolean
  current_bookings: number
  max_bookings: number
}

interface TimeSlotPickerProps {
  timeSlots: TimeSlot[]
  selectedSlotId: string | null
  onSelectSlot: (slotId: string) => void
  loading?: boolean
}

export function TimeSlotPicker({ timeSlots, selectedSlotId, onSelectSlot, loading }: TimeSlotPickerProps) {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const formattedHour = hour % 12 || 12
    return `${formattedHour}:${minutes} ${ampm}`
  }

  const getSlotsRemaining = (slot: TimeSlot) => {
    return slot.max_bookings - slot.current_bookings
  }

  if (loading) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="inline-block w-8 h-8 border-4 border-orange/30 border-t-orange rounded-full animate-spin mb-4" />
        <p className="text-slate-400">Loading available time slots...</p>
      </div>
    )
  }

  if (timeSlots.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h4 className="text-lg font-bold text-white mb-2">No Available Slots</h4>
        <p className="text-slate-400">
          No time slots available for this date. Please select a different date.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Select a Time</h3>
        <p className="text-sm text-slate-400">Choose an available time slot for your session</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {timeSlots.map(slot => {
          const isSelected = selectedSlotId === slot.id
          const spotsRemaining = getSlotsRemaining(slot)
          const isLimited = spotsRemaining <= 2

          return (
            <button
              key={slot.id}
              onClick={() => slot.is_available && onSelectSlot(slot.id)}
              disabled={!slot.is_available}
              className={`
                text-left p-4 rounded-xl border-2 transition-all duration-200
                ${
                  !slot.is_available
                    ? 'opacity-40 cursor-not-allowed border-white/10 bg-white/5'
                    : isSelected
                    ? 'border-orange bg-orange/5 shadow-lg shadow-orange/20 scale-[1.02]'
                    : 'border-white/10 bg-white/5 hover:border-cyan/50 hover:bg-cyan/5'
                }
              `}
            >
              {/* Time */}
              <div className="flex items-center gap-2 mb-3">
                <Clock className={`w-4 h-4 ${isSelected ? 'text-orange' : 'text-cyan'}`} />
                <span className="font-bold text-white">
                  {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                </span>
              </div>

              {/* Coach */}
              <div className="flex items-center gap-2 mb-2 text-sm text-slate-300">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{slot.coach_name}</span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 mb-3 text-sm text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="line-clamp-1">{slot.location}</span>
              </div>

              {/* Spots Remaining */}
              {slot.max_bookings > 1 && slot.is_available && (
                <div className="pt-2 border-t border-white/10">
                  <span
                    className={`text-xs font-semibold ${
                      isLimited ? 'text-orange' : 'text-slate-400'
                    }`}
                  >
                    {spotsRemaining} {spotsRemaining === 1 ? 'spot' : 'spots'} left
                  </span>
                </div>
              )}

              {/* Selected Indicator */}
              {isSelected && (
                <div className="mt-2 pt-2 border-t border-orange/20">
                  <div className="flex items-center gap-2 text-orange text-sm font-semibold">
                    <div className="w-2 h-2 rounded-full bg-orange animate-pulse" />
                    <span>Selected</span>
                  </div>
                </div>
              )}

              {/* Unavailable Label */}
              {!slot.is_available && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <span className="text-xs text-slate-500 font-semibold">Fully Booked</span>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
