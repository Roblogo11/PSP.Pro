'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, MapPin, Users, Loader2 } from 'lucide-react'
import { formatEventRange, formatEventDuration, eventDayCount } from '@/lib/events/format'

interface EventDay {
  id: string
  slot_date: string
  start_time: string
  end_time: string
  max_bookings: number
  current_bookings: number
}

interface EventRow {
  id: string
  name: string
  description: string | null
  start_date: string
  end_date: string
  location: string | null
  max_participants: number
  price_cents: number | null
  days: EventDay[]
}

/** Strips seconds: "09:00:00" -> "9:00 AM" */
const prettyTime = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

/**
 * Multi-day events (camps) shown as ONE card with the full date range —
 * not as N separate daily slots, which is how they'd otherwise appear.
 */
export function UpcomingEvents() {
  const [events, setEvents] = useState<EventRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/events')
      .then(r => r.json())
      .then(d => setEvents(d.events || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading camps &amp; events…
      </div>
    )
  }

  if (events.length === 0) return null

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-orange" />
        Camps &amp; Multi-Day Events
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {events.map(evt => {
          const spotsLeft = evt.days.length
            ? Math.max(0, evt.days[0].max_bookings - evt.days[0].current_bookings)
            : evt.max_participants
          const dayCount = eventDayCount(evt.start_date, evt.end_date)

          return (
            <div key={evt.id} className="glass-card p-5 rounded-2xl border border-cyan-200/40 dark:border-white/10">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-bold text-slate-900 dark:text-white">{evt.name}</h3>
                {dayCount > 1 && (
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-orange/15 text-orange">
                    {formatEventDuration(evt.start_date, evt.end_date)}
                  </span>
                )}
              </div>

              {/* The headline Rachel asked for: the range, stated plainly. */}
              <p className="text-sm font-semibold text-orange mb-3">
                {formatEventRange(evt.start_date, evt.end_date)}
              </p>

              {evt.description && (
                <p className="text-sm text-slate-600 dark:text-white/70 mb-3 line-clamp-2">{evt.description}</p>
              )}

              <div className="space-y-1.5 text-sm text-slate-600 dark:text-white/60">
                {evt.days.length > 0 && (
                  <p className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 shrink-0" />
                    {prettyTime(evt.days[0].start_time)} – {prettyTime(evt.days[0].end_time)} daily
                  </p>
                )}
                {evt.location && (
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 shrink-0" />{evt.location}
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <Users className="w-4 h-4 shrink-0" />
                  {spotsLeft > 0 ? `${spotsLeft} of ${evt.max_participants} spots open` : 'Full'}
                </p>
              </div>

              {evt.price_cents != null && (
                <p className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                  ${(evt.price_cents / 100).toFixed(2)}
                  <span className="text-xs font-normal text-slate-500 ml-1">for all {dayCount} days</span>
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
