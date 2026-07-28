import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Multi-day events (camps, clinics spanning several days).
 *
 * ⚠ An event GROUPS per-day `available_slots` rows; it never replaces them.
 * The slot-count triggers and the hourly pg_cron heal both assume one slot row
 * per date. Creating an event therefore also creates one slot per day in the
 * range, all pointing back at the event.
 */

// GET /api/events — list active events (optionally including past ones)
export async function GET(request: NextRequest) {
  const admin = createAdminClient()
  const includePast = request.nextUrl.searchParams.get('includePast') === 'true'

  let query = admin
    .from('events')
    .select('*, services(name, category), profiles:coach_id(full_name)')
    .eq('is_active', true)
    .order('start_date', { ascending: true })

  if (!includePast) {
    query = query.gte('end_date', new Date().toISOString().slice(0, 10))
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Attach per-day slots so the UI can show the daily schedule.
  const ids = (data || []).map((e: any) => e.id)
  const { data: slots } = ids.length
    ? await admin
        .from('available_slots')
        .select('id, event_id, slot_date, start_time, end_time, max_bookings, current_bookings')
        .in('event_id', ids)
        .order('slot_date', { ascending: true })
    : { data: [] as any[] }

  const events = (data || []).map((e: any) => ({
    ...e,
    days: (slots || []).filter((s: any) => s.event_id === e.id),
  }))

  return NextResponse.json({ events })
}

// POST /api/events — staff create a multi-day event
export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles').select('role').eq('id', user.id).single()

  if (!['coach', 'admin', 'master_admin'].includes(profile?.role)) {
    return NextResponse.json({ error: 'Staff only' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const {
    name, description, startDate, endDate, startTime, endTime,
    location, maxParticipants, priceCents, serviceId, coachId,
  } = body

  if (!name || !startDate || !endDate || !startTime || !endTime) {
    return NextResponse.json(
      { error: 'name, startDate, endDate, startTime and endTime are required' },
      { status: 400 }
    )
  }

  if (endDate < startDate) {
    return NextResponse.json({ error: 'End date must be on or after the start date' }, { status: 400 })
  }

  const { data: event, error: eventError } = await admin
    .from('events')
    .insert({
      name,
      description: description || null,
      coach_id: coachId || user.id,
      service_id: serviceId || null,
      start_date: startDate,
      end_date: endDate,
      location: location || null,
      max_participants: maxParticipants ?? 1,
      price_cents: priceCents ?? null,
    })
    .select('*')
    .single()

  if (eventError) {
    console.error('Event create failed:', eventError.message)
    return NextResponse.json({ error: 'Could not create event' }, { status: 500 })
  }

  // One slot per day in the range — keeps the existing calendar + slot triggers working.
  const days: any[] = []
  for (let d = new Date(startDate + 'T12:00:00'); d <= new Date(endDate + 'T12:00:00'); d.setDate(d.getDate() + 1)) {
    days.push({
      coach_id: event.coach_id,
      service_id: event.service_id,
      event_id: event.id,
      slot_date: d.toISOString().slice(0, 10),
      start_time: startTime,
      end_time: endTime,
      location: event.location,
      max_bookings: event.max_participants,
    })
  }

  const { error: slotError } = await admin.from('available_slots').insert(days)
  if (slotError) {
    // Don't leave a half-built event behind.
    await admin.from('events').delete().eq('id', event.id)
    console.error('Event slot creation failed, rolled back:', slotError.message)
    return NextResponse.json({ error: 'Could not create event days' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, event, dayCount: days.length })
}
