import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/send'
import { getBookingConfirmationEmail, getPayOnSiteBookingEmail } from '@/lib/email/templates'

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['coach', 'admin', 'master_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { athlete_id, slot_id, service_id, payment_method, notes } = body as {
      athlete_id: string
      slot_id: string
      service_id: string
      payment_method: 'on_site' | 'comp' | 'package'
      notes?: string
    }

    if (!athlete_id || !slot_id || !service_id) {
      return NextResponse.json({ error: 'athlete_id, slot_id, and service_id are required' }, { status: 400 })
    }

    // Fetch slot details
    const { data: slot, error: slotError } = await adminClient
      .from('available_slots')
      .select('*')
      .eq('id', slot_id)
      .single()

    if (slotError || !slot) {
      return NextResponse.json({ error: 'Time slot not found' }, { status: 404 })
    }

    if (!slot.is_available || slot.current_bookings >= slot.max_bookings) {
      return NextResponse.json({ error: 'This time slot is full' }, { status: 400 })
    }

    // Fetch service details
    const { data: service, error: serviceError } = await adminClient
      .from('services')
      .select('id, name, price_cents, duration_minutes, is_active')
      .eq('id', service_id)
      .single()

    if (serviceError || !service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (!service.is_active) {
      return NextResponse.json({ error: 'This service is inactive' }, { status: 400 })
    }

    // Determine amount and payment status
    let amountCents = service.price_cents
    let paymentStatus = 'pending'

    if (payment_method === 'comp') {
      amountCents = 0
      paymentStatus = 'paid' // comp = no charge, mark as settled
    } else if (payment_method === 'on_site') {
      paymentStatus = 'pending' // will be collected in person
    } else if (payment_method === 'package') {
      paymentStatus = 'paid' // deducted from package

      // Find active package and deduct session
      const { data: activePkg } = await adminClient
        .from('athlete_packages')
        .select('id, sessions_used, sessions_total')
        .eq('athlete_id', athlete_id)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: true })
        .limit(1)
        .single()

      if (!activePkg) {
        return NextResponse.json({ error: 'Athlete has no active package' }, { status: 400 })
      }

      if (activePkg.sessions_used >= activePkg.sessions_total) {
        return NextResponse.json({ error: 'Athlete has no remaining sessions in their package' }, { status: 400 })
      }

      // Increment sessions_used
      await adminClient
        .from('athlete_packages')
        .update({ sessions_used: activePkg.sessions_used + 1 })
        .eq('id', activePkg.id)

      amountCents = 0 // covered by package
    }

    // Create the booking
    const { data: booking, error: bookingError } = await adminClient
      .from('bookings')
      .insert({
        athlete_id,
        coach_id: slot.coach_id,
        service_id,
        slot_id,
        booking_date: slot.slot_date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        duration_minutes: service.duration_minutes,
        location: slot.location,
        status: 'confirmed', // admin-created bookings are auto-confirmed
        amount_cents: amountCents,
        payment_status: paymentStatus,
        notes: notes || `Booked by staff (${payment_method})`,
        internal_notes: `Created by ${profile.role} via admin panel. Payment: ${payment_method}`,
      })
      .select('id')
      .single()

    if (bookingError) {
      console.error('Booking creation error:', bookingError)
      return NextResponse.json({ error: `Failed to create booking: ${bookingError.message}` }, { status: 500 })
    }

    // Increment slot bookings count
    await adminClient
      .from('available_slots')
      .update({
        current_bookings: slot.current_bookings + 1,
        is_available: slot.current_bookings + 1 < slot.max_bookings,
      })
      .eq('id', slot_id)

    // Send confirmation email to athlete (non-blocking)
    try {
      const { data: athlete } = await adminClient
        .from('profiles')
        .select('email, full_name')
        .eq('id', athlete_id)
        .single()

      const { data: coach } = await adminClient
        .from('profiles')
        .select('full_name')
        .eq('id', slot.coach_id)
        .single()

      if (athlete?.email) {
        const emailData = payment_method === 'on_site'
          ? getPayOnSiteBookingEmail({
              athleteName: athlete.full_name || 'Athlete',
              athleteEmail: athlete.email,
              serviceName: service.name,
              date: slot.slot_date,
              startTime: slot.start_time,
              endTime: slot.end_time,
              coachName: coach?.full_name || 'Your Coach',
              location: slot.location || 'PSP.Pro Facility',
              amount: (amountCents / 100).toFixed(2),
              confirmationId: booking.id,
            })
          : getBookingConfirmationEmail({
              athleteName: athlete.full_name || 'Athlete',
              athleteEmail: athlete.email,
              serviceName: service.name,
              date: slot.slot_date,
              startTime: slot.start_time,
              endTime: slot.end_time,
              coachName: coach?.full_name || 'Your Coach',
              location: slot.location || 'PSP.Pro Facility',
              amount: (amountCents / 100).toFixed(2),
              confirmationId: booking.id,
            })

        await sendEmail({ to: athlete.email, ...emailData })
      }
    } catch (emailErr) {
      console.error('Failed to send booking email:', emailErr)
    }

    return NextResponse.json({
      success: true,
      booking_id: booking.id,
      payment_method,
    })
  } catch (error) {
    console.error('Create booking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
