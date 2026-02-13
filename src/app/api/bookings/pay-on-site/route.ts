import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    // Auth check — must be logged in
    const supabase = await createServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Please log in to book a session' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    const body = await request.json()
    const { serviceId, slotId, date, startTime, endTime, durationMinutes, location, coachId } = body

    if (!serviceId || !slotId || !date || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 })
    }

    // Fetch slot and verify availability
    const { data: slot, error: slotError } = await adminClient
      .from('available_slots')
      .select('*')
      .eq('id', slotId)
      .single()

    if (slotError || !slot) {
      return NextResponse.json({ error: 'Time slot not found' }, { status: 404 })
    }

    if (!slot.is_available || slot.current_bookings >= slot.max_bookings) {
      return NextResponse.json({ error: 'This time slot is no longer available' }, { status: 400 })
    }

    // Check for duplicate booking
    const { data: existing } = await adminClient
      .from('bookings')
      .select('id')
      .eq('athlete_id', user.id)
      .eq('slot_id', slotId)
      .in('status', ['confirmed', 'pending'])
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'You already have a booking for this time slot' }, { status: 400 })
    }

    // Fetch service for price
    const { data: service, error: serviceError } = await adminClient
      .from('services')
      .select('id, name, price_cents, duration_minutes')
      .eq('id', serviceId)
      .single()

    if (serviceError || !service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Create booking with pending status
    const { data: booking, error: bookingError } = await adminClient
      .from('bookings')
      .insert({
        athlete_id: user.id,
        coach_id: coachId || slot.coach_id,
        service_id: serviceId,
        slot_id: slotId,
        booking_date: date,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: durationMinutes || service.duration_minutes,
        location: location || slot.location,
        status: 'pending',
        amount_cents: service.price_cents,
        payment_status: 'pending',
        notes: 'Pay on site',
        internal_notes: 'Athlete selected pay-on-site at booking',
      })
      .select('id')
      .single()

    if (bookingError) {
      console.error('Pay-on-site booking error:', bookingError)
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
    }

    // Increment slot bookings count
    await adminClient
      .from('available_slots')
      .update({
        current_bookings: slot.current_bookings + 1,
        is_available: slot.current_bookings + 1 < slot.max_bookings,
      })
      .eq('id', slotId)

    return NextResponse.json({
      success: true,
      booking_id: booking.id,
    })
  } catch (error) {
    console.error('Pay-on-site booking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
