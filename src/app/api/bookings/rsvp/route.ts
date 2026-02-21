import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/bookings/rsvp — update RSVP status for a booking
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookingId, rsvpStatus } = await request.json()

    if (!bookingId || !['confirmed', 'maybe', 'declined'].includes(rsvpStatus)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Verify the booking belongs to this user
    const { data: booking } = await supabase
      .from('bookings')
      .select('id, athlete_id')
      .eq('id', bookingId)
      .eq('athlete_id', user.id)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('bookings')
      .update({ rsvp_status: rsvpStatus })
      .eq('id', bookingId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
