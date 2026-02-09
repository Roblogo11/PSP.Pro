import { SupabaseClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { sendEmail } from '@/lib/email/send'
import { getBookingConfirmationEmail } from '@/lib/email/templates'

export type BookingResult =
  | { created: true; bookingId: string }
  | { created: false; reason: 'already_exists'; bookingId: string }
  | { created: false; reason: 'slot_unavailable' | 'slot_not_found' | 'insert_failed' | 'no_metadata'; error: string }

/**
 * Creates a booking from a Stripe checkout session.
 * Used by both the webhook and the verify endpoint (as fallback).
 * Idempotent — safe to call multiple times for the same session.
 */
export async function createBookingFromSession(
  supabase: SupabaseClient,
  stripeInstance: Stripe,
  session: Stripe.Checkout.Session
): Promise<BookingResult> {
  const metadata = session.metadata
  if (!metadata?.booking_data) {
    return { created: false, reason: 'no_metadata', error: 'No booking data in session metadata' }
  }

  const bookingData = JSON.parse(metadata.booking_data)

  // 1. IDEMPOTENCY CHECK — skip if booking already exists for this checkout session
  const { data: existingBooking } = await supabase
    .from('bookings')
    .select('id')
    .eq('stripe_checkout_session_id', session.id)
    .single()

  if (existingBooking) {
    return { created: false, reason: 'already_exists', bookingId: existingBooking.id }
  }

  // 2. AVAILABILITY CHECK — verify slot still exists and has capacity
  const { data: slot, error: slotError } = await supabase
    .from('available_slots')
    .select('current_bookings, max_bookings, is_available')
    .eq('id', bookingData.slotId)
    .single()

  if (slotError || !slot) {
    console.error('Slot not found:', bookingData.slotId)
    try {
      await stripeInstance.refunds.create({
        payment_intent: session.payment_intent as string,
        reason: 'requested_by_customer',
        metadata: { reason: 'Slot no longer exists' },
      })
    } catch (refundErr) {
      console.error('Refund failed for missing slot:', refundErr)
    }
    return { created: false, reason: 'slot_not_found', error: 'Slot not found' }
  }

  if (!slot.is_available || slot.current_bookings >= slot.max_bookings) {
    console.error('Slot is full:', bookingData.slotId)
    try {
      await stripeInstance.refunds.create({
        payment_intent: session.payment_intent as string,
        reason: 'requested_by_customer',
        metadata: { reason: 'Slot is no longer available' },
      })
    } catch (refundErr) {
      console.error('Refund failed for full slot:', refundErr)
    }
    return { created: false, reason: 'slot_unavailable', error: 'Slot is no longer available' }
  }

  // 3. CREATE BOOKING — the DB trigger handles slot count increment
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      athlete_id: metadata.athlete_id,
      coach_id: bookingData.coachId,
      service_id: metadata.service_id,
      slot_id: bookingData.slotId,
      booking_date: bookingData.date,
      start_time: bookingData.startTime,
      end_time: bookingData.endTime,
      duration_minutes: bookingData.durationMinutes,
      location: bookingData.location,
      status: 'confirmed',
      amount_cents: session.amount_total || 0,
      payment_status: 'paid',
      stripe_payment_intent_id: session.payment_intent as string,
      stripe_checkout_session_id: session.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating booking:', error)

    // Handle unique constraint violation (race between webhook and verify)
    if (error.code === '23505' && error.message.includes('stripe_checkout_session_id')) {
      const { data: raceBooking } = await supabase
        .from('bookings')
        .select('id')
        .eq('stripe_checkout_session_id', session.id)
        .single()
      return { created: false, reason: 'already_exists', bookingId: raceBooking?.id || 'unknown' }
    }

    // Handle slot-full race condition — refund
    if (error.message.includes('Cannot book slot')) {
      try {
        await stripeInstance.refunds.create({
          payment_intent: session.payment_intent as string,
          reason: 'requested_by_customer',
          metadata: { reason: 'Slot booking failed - likely full' },
        })
      } catch (refundErr) {
        console.error('Refund failed for booking error:', refundErr)
      }
    }

    return { created: false, reason: 'insert_failed', error: error.message }
  }

  // TRACK FOR SIMULATION CLEANUP if in simulation mode
  if (metadata.simulation_id) {
    try {
      await supabase.from('simulation_data_log').insert({
        simulation_id: metadata.simulation_id,
        table_name: 'bookings',
        record_id: booking.id,
      })
    } catch {
      // Non-critical — don't fail the booking
    }
  }

  // 4. SEND CONFIRMATION EMAIL (non-blocking — don't fail the booking if email fails)
  try {
    // Look up athlete email from profiles
    const { data: athlete } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', metadata.athlete_id)
      .single()

    if (athlete?.email) {
      const emailData = getBookingConfirmationEmail({
        athleteName: athlete.full_name || 'Athlete',
        athleteEmail: athlete.email,
        serviceName: bookingData.serviceName || 'Training Session',
        date: bookingData.date,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        coachName: bookingData.coachName || 'Your Coach',
        location: bookingData.location || 'PSP.Pro Facility',
        amount: ((session.amount_total || 0) / 100).toFixed(2),
        confirmationId: booking.id,
      })

      await sendEmail({
        to: athlete.email,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      })
    }
  } catch (emailErr) {
    // Don't fail the booking — just log
    console.error('Failed to send booking confirmation email:', emailErr)
  }

  return { created: true, bookingId: booking.id }
}
