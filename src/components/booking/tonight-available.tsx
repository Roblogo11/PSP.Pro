'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getLocalDateString } from '@/lib/utils/local-date'
import { Sparkles, Users, Clock, ChevronRight } from 'lucide-react'

interface TonightSlot {
  id: string
  service_id: string | null
  start_time: string
  end_time: string | null
  max_bookings: number
  current_bookings: number
  service: { id: string; name: string; category: string; max_participants: number | null } | null
  coach: { full_name: string | null } | null
}

interface Props {
  orgId: string | null
  preselectedCoachId: string | null
  onPick: (serviceId: string, dateStr: string, slotId: string) => void
}

// Surfaces today's available sessions across ALL services, so athletes don't
// have to guess which specific service to pick first. Particularly important
// for group sessions, which are otherwise invisible until the right service
// is selected in the catalog.
export function TonightAvailable({ orgId, preselectedCoachId, onPick }: Props) {
  const [slots, setSlots] = useState<TonightSlot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    const today = getLocalDateString(new Date())

    async function load() {
      let q = supabase
        .from('available_slots')
        .select(`
          id, service_id, start_time, end_time, max_bookings, current_bookings,
          service:service_id (id, name, category, max_participants),
          coach:coach_id (full_name)
        `)
        .eq('slot_date', today)
        .eq('is_available', true)
        .order('start_time', { ascending: true })

      if (preselectedCoachId) q = q.eq('coach_id', preselectedCoachId)
      if (orgId) q = q.or(`org_id.eq.${orgId},org_id.is.null`)

      const { data } = await q
      // Only show slots tied to a real service — "Any Service" slots can't be
      // booked without the athlete picking one, so they belong in the catalog flow.
      const usable = ((data as any[]) || []).filter(s => s.service && s.service.id)
      // Hide slots whose start time already passed
      const now = new Date()
      const cutoff = now.toTimeString().slice(0, 5)
      const todayKey = getLocalDateString(now)
      const future = usable.filter(s => todayKey !== today || s.start_time.slice(0, 5) >= cutoff)
      setSlots(future)
      setLoading(false)
    }
    load()
  }, [orgId, preselectedCoachId])

  if (loading || slots.length === 0) return null

  const today = getLocalDateString(new Date())
  const groups = slots.filter(s => (s.service?.max_participants ?? 1) > 1)
  const individuals = slots.filter(s => (s.service?.max_participants ?? 1) <= 1)

  const fmtTime = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    const period = h >= 12 ? 'PM' : 'AM'
    const hour12 = h % 12 || 12
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`
  }

  const Row = ({ s, highlight }: { s: TonightSlot; highlight?: boolean }) => {
    const spotsLeft = s.max_bookings - s.current_bookings
    return (
      <button
        onClick={() => onPick(s.service!.id, today, s.id)}
        className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
          highlight
            ? 'border-orange/40 bg-orange/5 hover:border-orange hover:bg-orange/10'
            : 'border-cyan-200/40 bg-cyan-50/50 hover:border-cyan/60 hover:bg-cyan/5'
        }`}
      >
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center text-xs font-bold ${
          highlight ? 'bg-orange/15 text-orange' : 'bg-cyan/15 text-cyan-700 dark:text-cyan-300'
        }`}>
          <Clock className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] leading-none">{fmtTime(s.start_time).split(' ')[0]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{s.service?.name}</p>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-cyan-700 dark:text-white/70">
            <span>{fmtTime(s.start_time)}</span>
            {highlight && (
              <span className="flex items-center gap-1 font-semibold text-orange">
                <Users className="w-3 h-3" />
                {spotsLeft} of {s.max_bookings} spots
              </span>
            )}
            {s.coach?.full_name && <span className="truncate">w/ {s.coach.full_name}</span>}
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 ${highlight ? 'text-orange' : 'text-cyan/60'}`} />
      </button>
    )
  }

  return (
    <div className="mb-6 p-4 rounded-2xl border-2 border-orange/30 bg-gradient-to-br from-orange/5 to-cyan/5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-orange" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Available Tonight</h3>
        <span className="text-xs text-cyan-700 dark:text-white/60">
          {slots.length} {slots.length === 1 ? 'session' : 'sessions'} open
        </span>
      </div>

      {groups.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-orange uppercase tracking-wide mb-2">Group Sessions</p>
          <div className="space-y-2">
            {groups.map(s => <Row key={s.id} s={s} highlight />)}
          </div>
        </div>
      )}

      {individuals.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 uppercase tracking-wide mb-2">
            1-on-1 Sessions
          </p>
          <div className="space-y-2">
            {individuals.map(s => <Row key={s.id} s={s} />)}
          </div>
        </div>
      )}
    </div>
  )
}
