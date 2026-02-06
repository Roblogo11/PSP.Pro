import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

// Disable body parsing so we can verify the webhook signature
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  try {
    // Verify the webhook signature
    const event = verifyWebhookSignature(body, signature)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const supabase = await createClient()

  console.log('Checkout session completed:', session.id)

  // Check if this is a booking or package purchase
  const metadata = session.metadata

  if (!metadata) {
    console.error('No metadata in checkout session')
    return
  }

  // Handle booking payment
  if (metadata.booking_data) {
    const bookingData = JSON.parse(metadata.booking_data)

    try {
      // 1. IDEMPOTENCY CHECK - prevent duplicate bookings if webhook fires twice
      const { data: existingBooking } = await supabase
        .from('bookings')
        .select('id')
        .eq('stripe_checkout_session_id', session.id)
        .single()

      if (existingBooking) {
        console.log('Booking already exists for session:', session.id)
        return // Already processed, skip
      }

      // 2. AVAILABILITY CHECK - verify slot is still available
      const { data: slot, error: slotError } = await supabase
        .from('available_slots')
        .select('current_bookings, max_bookings, is_available')
        .eq('id', bookingData.slotId)
        .single()

      if (slotError || !slot) {
        console.error('Slot not found:', bookingData.slotId)
        // Refund the payment
        await stripe.refunds.create({
          payment_intent: session.payment_intent as string,
          reason: 'requested_by_customer',
          metadata: {
            reason: 'Slot no longer exists'
          }
        })
        return
      }

      if (!slot.is_available || slot.current_bookings >= slot.max_bookings) {
        console.error('Slot is full:', bookingData.slotId)
        // Refund the payment
        await stripe.refunds.create({
          payment_intent: session.payment_intent as string,
          reason: 'requested_by_customer',
          metadata: {
            reason: 'Slot is no longer available'
          }
        })
        return
      }

      // 3. CREATE BOOKING - the trigger will handle slot count increment
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
        // If booking creation failed (likely due to race condition), refund
        if (error.message.includes('Cannot book slot')) {
          await stripe.refunds.create({
            payment_intent: session.payment_intent as string,
            reason: 'requested_by_customer',
            metadata: {
              reason: 'Slot booking failed - likely full'
            }
          })
        }
      } else {
        console.log('Booking created successfully:', booking.id)
      }
    } catch (err) {
      console.error('Failed to create booking:', err)
    }
  }

  // Handle package purchase
  if (metadata.package_id) {
    try {
      const validityDays = 90 // Default to 90 days
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + validityDays)

      const { data: athletePackage, error } = await supabase
        .from('athlete_packages')
        .insert({
          athlete_id: metadata.athlete_id,
          package_id: metadata.package_id,
          sessions_total: parseInt(metadata.sessions_included),
          sessions_used: 0,
          payment_status: 'paid',
          stripe_payment_intent_id: session.payment_intent as string,
          amount_cents: session.amount_total || 0,
          expires_at: expiresAt.toISOString(),
          is_active: true,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating athlete package:', error)
      } else {
        console.log('Athlete package created successfully:', athletePackage.id)
      }
    } catch (err) {
      console.error('Failed to create athlete package:', err)
    }
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const supabase = await createClient()

  console.log('Payment failed:', paymentIntent.id)

  // Update booking status if exists
  const { error } = await supabase
    .from('bookings')
    .update({ payment_status: 'failed' })
    .eq('stripe_payment_intent_id', paymentIntent.id)

  if (error) {
    console.error('Error updating booking payment status:', error)
  }
}
