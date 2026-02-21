import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/calendar/export?token={calendar_token}
 * Returns iCal (.ics) feed for user's upcoming bookings.
 * Can be subscribed to by Google Calendar, Apple Calendar, Outlook.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return new NextResponse('Missing token', { status: 400 })
  }

  const supabase = createAdminClient()

  // Look up user by calendar token
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('calendar_token', token)
    .single()

  if (!profile) {
    return new NextResponse('Invalid token', { status: 401 })
  }

  // Fetch upcoming confirmed bookings
  const today = new Date().toISOString().split('T')[0]
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id, booking_date, start_time, end_time, location, status,
      service:service_id(name),
      coach:coach_id(full_name)
    `)
    .eq('athlete_id', profile.id)
    .in('status', ['confirmed', 'pending'])
    .gte('booking_date', today)
    .order('booking_date', { ascending: true })

  // Build ICS content
  const events = (bookings || []).map((b: any) => {
    const serviceName = (b.service as any)?.name || 'Training Session'
    const coachName = (b.coach as any)?.full_name || 'Coach'
    const dtStart = formatIcsDateTime(b.booking_date, b.start_time)
    const dtEnd = formatIcsDateTime(b.booking_date, b.end_time)

    return `BEGIN:VEVENT
UID:booking-${b.id}@psp.pro
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${escapeIcs(serviceName)} with ${escapeIcs(coachName)}
LOCATION:${escapeIcs(b.location || 'PSP.Pro Facility')}
DESCRIPTION:${escapeIcs(`${serviceName} - ${b.status}\\nCoach: ${coachName}`)}
STATUS:CONFIRMED
END:VEVENT`
  })

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PSP.Pro//Bookings//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:PSP.Pro Training Sessions
X-WR-TIMEZONE:America/New_York
${events.join('\n')}
END:VCALENDAR`

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="psp-pro-sessions.ics"',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}

function formatIcsDateTime(date: string, time: string): string {
  // date: YYYY-MM-DD, time: HH:MM or HH:MM:SS
  const [y, m, d] = date.split('-')
  const [h, min] = time.split(':')
  return `${y}${m}${d}T${h}${min}00`
}

function escapeIcs(text: string): string {
  return text.replace(/[,;\\]/g, (c) => `\\${c}`).replace(/\n/g, '\\n')
}
