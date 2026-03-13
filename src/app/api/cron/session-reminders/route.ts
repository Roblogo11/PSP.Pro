import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/send'
import { getSessionReminderEmail } from '@/lib/email/templates'

export async function GET(request: NextRequest) {
  // Verify cron secret — always required
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const adminClient = createAdminClient()

    // Get tomorrow's date in YYYY-MM-DD format
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    // Fetch all confirmed bookings for tomorrow
    const { data: bookings, error } = await adminClient
      .from('bookings')
      .select(`
        id,
        start_time,
        end_time,
        athlete_id,
        coach_id,
        booking_date,
        athlete:athlete_id (full_name, email),
        coach:coach_id (full_name),
        service:service_id (name),
        slot:slot_id (location)
      `)
      .eq('booking_date', tomorrowStr)
      .in('status', ['confirmed'])
      .in('payment_status', ['paid', 'pending'])

    if (error) throw error

    let sent = 0
    const errors: string[] = []

    for (const booking of (bookings || [])) {
      const athlete = booking.athlete as any
      const coach = booking.coach as any
      const service = booking.service as any
      const slot = booking.slot as any

      if (!athlete?.email) continue

      const dateFormatted = new Date(booking.booking_date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      })

      const { subject, html, text } = getSessionReminderEmail({
        athleteName: athlete.full_name || 'Athlete',
        serviceName: service?.name || 'Training Session',
        date: dateFormatted,
        startTime: booking.start_time,
        endTime: booking.end_time,
        coachName: coach?.full_name || 'Your Coach',
        location: slot?.location || 'TBD',
        dashboardUrl: 'https://propersports.pro/sessions',
      })

      const result = await sendEmail({ to: athlete.email, subject, html, text })
      if (result.success) {
        sent++
      } else {
        errors.push(`Failed for booking ${booking.id}`)
      }
    }

    return NextResponse.json({ sent, errors, total: bookings?.length || 0 })
  } catch (error: any) {
    console.error('Cron session reminders error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
