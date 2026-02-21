import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/send'
import { getPayOnSiteBookingEmail, getCoachNewBookingEmail } from '@/lib/email/templates'

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

    // Verify slot is in the future
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const slotDate = new Date(slot.slot_date + 'T12:00:00')
    slotDate.setHours(0, 0, 0, 0)
    if (slotDate < today) {
      return NextResponse.json({ error: 'Cannot book a session in the past' }, { status: 400 })
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
      .select('id, name, price_cents, duration_minutes, is_active')
      .eq('id', serviceId)
      .single()

    if (serviceError || !service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (!service.is_active) {
      return NextResponse.json({ error: 'This service is no longer available' }, { status: 400 })
    }

    // Check Elite membership for 10% discount
    const { data: userProfile } = await adminClient
      .from('profiles')
      .select('membership_tier')
      .eq('id', user.id)
      .single()

    let amountCents = service.price_cents
    const isElite = userProfile?.membership_tier === 'elite'
    if (isElite) {
      amountCents = Math.round(amountCents * 0.9)
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
        amount_cents: amountCents,
        payment_status: 'pending',
        notes: 'Pay on site',
        internal_notes: isElite
          ? `Pay-on-site booking. Elite 10% discount applied (original: $${(service.price_cents / 100).toFixed(2)})`
          : 'Athlete selected pay-on-site at booking',
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

    // Send emails (non-blocking — don't fail the booking)
    try {
      // Get athlete profile
      const { data: athlete } = await adminClient
        .from('profiles')
        .select('email, full_name')
        .eq('id', user.id)
        .single()

      // Get coach profile
      const { data: coach } = await adminClient
        .from('profiles')
        .select('email, full_name')
        .eq('id', coachId || slot.coach_id)
        .single()

      // Email to athlete
      if (athlete?.email) {
        const athleteEmail = getPayOnSiteBookingEmail({
          athleteName: athlete.full_name || 'Athlete',
          athleteEmail: athlete.email,
          serviceName: service.name,
          date,
          startTime,
          endTime,
          coachName: coach?.full_name || 'Your Coach',
          location: location || slot.location || 'PSP.Pro Facility',
          amount: (amountCents / 100).toFixed(2),
          confirmationId: booking.id,
        })
        await sendEmail({ to: athlete.email, ...athleteEmail })
      }

      // Email to coach
      if (coach?.email) {
        const coachEmail = getCoachNewBookingEmail({
          coachName: coach.full_name || 'Coach',
          athleteName: athlete?.full_name || 'An athlete',
          serviceName: service.name,
          date,
          startTime,
          endTime,
          location: location || slot.location || 'PSP.Pro Facility',
          paymentMethod: 'on_site',
        })
        await sendEmail({ to: coach.email, ...coachEmail })
      }
    } catch (emailErr) {
      console.error('Failed to send booking emails:', emailErr)
    }

    return NextResponse.json({
      success: true,
      booking_id: booking.id,
    })
  } catch (error) {
    console.error('Pay-on-site booking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
