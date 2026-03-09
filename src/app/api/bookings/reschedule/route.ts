import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Transfers an existing confirmed/pending booking to a new slot.
// The new slot must be available. The old booking is cancelled and
// a new booking is created preserving the original payment info.
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()
    const { originalBookingId, newSlotId, serviceId, date, startTime, endTime, durationMinutes, location, coachId } = await request.json()

    if (!originalBookingId || !newSlotId || !serviceId || !date || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify the original booking belongs to this user
    const { data: originalBooking, error: obError } = await adminClient
      .from('bookings')
      .select('*')
      .eq('id', originalBookingId)
      .eq('athlete_id', user.id)
      .in('status', ['confirmed', 'pending'])
      .single()

    if (obError || !originalBooking) {
      return NextResponse.json({ error: 'Original booking not found or already cancelled' }, { status: 404 })
    }

    // Verify new slot is available
    const { data: newSlot, error: slotError } = await adminClient
      .from('available_slots')
      .select('*')
      .eq('id', newSlotId)
      .single()

    if (slotError || !newSlot) {
      return NextResponse.json({ error: 'New time slot not found' }, { status: 404 })
    }

    if (!newSlot.is_available || newSlot.current_bookings >= newSlot.max_bookings) {
      return NextResponse.json({ error: 'The selected time slot is no longer available' }, { status: 400 })
    }

    // Verify new slot is in the future
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const slotDate = new Date(newSlot.slot_date + 'T12:00:00')
    slotDate.setHours(0, 0, 0, 0)
    if (slotDate < today) {
      return NextResponse.json({ error: 'Cannot reschedule to a past date' }, { status: 400 })
    }

    // Cancel the original booking
    const { error: cancelError } = await adminClient
      .from('bookings')
      .update({ status: 'cancelled', internal_notes: `Rescheduled to new booking on ${date}` })
      .eq('id', originalBookingId)

    if (cancelError) {
      return NextResponse.json({ error: 'Failed to cancel original booking' }, { status: 500 })
    }

    // Create the new booking preserving payment info from original
    const { data: newBooking, error: newBookingError } = await adminClient
      .from('bookings')
      .insert({
        athlete_id: user.id,
        coach_id: coachId || newSlot.coach_id,
        service_id: serviceId,
        slot_id: newSlotId,
        booking_date: date,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: durationMinutes || originalBooking.duration_minutes,
        location: location || newSlot.location,
        status: originalBooking.status, // preserve confirmed/pending
        amount_cents: originalBooking.amount_cents,
        payment_status: originalBooking.payment_status,
        payment_method: originalBooking.payment_method,
        service_name: originalBooking.service_name,
        notes: originalBooking.notes,
        internal_notes: `Rescheduled from booking ${originalBookingId}`,
      })
      .select('id')
      .single()

    if (newBookingError) {
      // If new booking fails, try to restore the original (best effort)
      await adminClient
        .from('bookings')
        .update({ status: originalBooking.status, internal_notes: originalBooking.internal_notes })
        .eq('id', originalBookingId)

      console.error('Reschedule new booking error:', newBookingError)
      return NextResponse.json({ error: 'Failed to create rescheduled booking' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, booking_id: newBooking.id })
  } catch (err: any) {
    console.error('Reschedule error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
