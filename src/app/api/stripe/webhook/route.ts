import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, getStripe } from '@/lib/stripe/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createBookingFromSession } from '@/lib/bookings/create-booking-from-session'
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
        console.log('Payment succeeded for intent:', (event.data.object as Stripe.PaymentIntent).id)
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
    // Always return 200 to prevent Stripe from retrying the webhook
    // Signature verification failures still return 400 above
    return NextResponse.json({ error: error.message }, { status: 200 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const supabase = createAdminClient()
  const stripeInstance = await getStripe()

  console.log('Checkout session completed:', session.id)

  const metadata = session.metadata

  if (!metadata) {
    console.error('No metadata in checkout session')
    return
  }

  // Handle booking payment
  if (metadata.booking_data) {
    const result = await createBookingFromSession(supabase, stripeInstance, session)

    if (result.created) {
      console.log('Webhook created booking:', result.bookingId)
    } else if (result.reason === 'already_exists') {
      console.log('Booking already exists for session:', session.id)
    } else {
      console.error('Webhook booking creation failed:', result.error)
    }
  }

  // Handle package purchase
  if (metadata.package_id) {
    try {
      // IDEMPOTENCY CHECK - prevent duplicate packages if webhook fires twice
      const { data: existingPackage } = await supabase
        .from('athlete_packages')
        .select('id')
        .eq('stripe_payment_intent_id', session.payment_intent as string)
        .single()

      if (existingPackage) {
        console.log('Package already exists for payment:', session.payment_intent)
        return
      }

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
  const supabase = createAdminClient()

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
