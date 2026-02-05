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
            aspect-square rounded-xl flex items-center justify-center text-sm font-medium
            transition-all duration-200 relative
            ${available ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-30'}
            ${
              selected
                ? 'bg-orange text-white shadow-lg shadow-orange/30 scale-105'
                : available
                ? 'glass-card-hover text-white hover:border-orange/50'
                : 'text-slate-600'
            }
            ${today && !selected ? 'ring-2 ring-cyan/50' : ''}
          `}
        >
          {day}
          {available && !selected && (
            <div className="absolute bottom-1 w-1 h-1 rounded-full bg-cyan" />
          )}
        </button>
      )
    }

    return days
  }

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        <h3 className="text-lg font-bold text-white">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>

        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-slate-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-2">{renderDays()}</div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange" />
          <span>Selected</span>
        </div>
      </div>
    </div>
  )
}
