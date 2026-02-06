'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarProps {
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
  availableDates?: Date[]
  minDate?: Date
}

export function Calendar({ selectedDate, onSelectDate, availableDates = [], minDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date())

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const isDateAvailable = (date: Date) => {
    if (minDate && date < minDate) return false
    if (availableDates.length === 0) return true

    return availableDates.some(
      availableDate =>
        availableDate.getDate() === date.getDate() &&
        availableDate.getMonth() === date.getMonth() &&
        availableDate.getFullYear() === date.getFullYear()
    )
  }

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const renderDays = () => {
    const days = []
    const totalDays = daysInMonth(currentMonth)
    const firstDay = firstDayOfMonth(currentMonth)

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />)
    }

    // Actual days
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const available = isDateAvailable(date)
      const selected = isDateSelected(date)
      const today = isToday(date)

      days.push(
        <button
          key={day}
          onClick={() => available && onSelectDate(date)}
          disabled={!available}
          className={`
            aspect-square rounded-xl flex items-center justify-center text-base font-bold
            transition-all duration-300 relative group
            ${available ? 'cursor-pointer hover:scale-110 hover:-translate-y-1' : 'cursor-not-allowed opacity-20'}
            ${
              selected
                ? 'bg-gradient-to-br from-orange via-orange-500 to-orange-600 text-white shadow-2xl shadow-orange/50 scale-110 ring-2 ring-orange/30'
                : available
                ? 'bg-white/5 border border-white/10 text-white hover:bg-gradient-to-br hover:from-orange/20 hover:to-cyan/10 hover:border-cyan/30 hover:shadow-lg'
                : 'text-slate-700 bg-white/[0.02]'
            }
            ${today && !selected ? 'ring-2 ring-cyan shadow-lg shadow-cyan/30' : ''}
          `}
        >
          {day}
          {/* Available indicator - pulsing dot */}
          {available && !selected && (
            <div className="absolute -bottom-1 flex gap-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan group-hover:bg-orange transition-colors" />
              <div className="w-1 h-1 rounded-full bg-cyan/50 group-hover:bg-orange/50 transition-colors" />
            </div>
          )}
          {/* Today badge */}
          {today && !selected && (
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan animate-pulse" />
          )}
        </button>
      )
    }

    return days
  }

  return (
    <div className="glass-card p-6 border-2 border-white/10">
      {/* Header with gradient */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gradient-to-r hover:from-orange/20 hover:to-orange/10 rounded-xl transition-all hover:scale-110"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-6 h-6 text-orange" />
        </button>

        <h3 className="text-xl font-display font-bold bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>

        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gradient-to-r hover:from-orange/20 hover:to-orange/10 rounded-xl transition-all hover:scale-110"
          aria-label="Next month"
        >
          <ChevronRight className="w-6 h-6 text-orange" />
        </button>
      </div>

      {/* Day headers with better styling */}
      <div className="grid grid-cols-7 gap-3 mb-3">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-bold text-cyan uppercase tracking-wider py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days with better spacing */}
      <div className="grid grid-cols-7 gap-3">{renderDays()}</div>

      {/* Legend with icons */}
      <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
          <span className="text-slate-300 font-medium">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-orange to-orange-600 shadow-glow-orange" />
          <span className="text-slate-300 font-medium">Selected</span>
        </div>
      </div>
    </div>
  )
}
