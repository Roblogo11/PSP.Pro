import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createBookingFromSession } from '@/lib/bookings/create-booking-from-session'
import Stripe from 'stripe'

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ verified: false, error: 'Missing session_id' }, { status: 400 })
  }

  // Verify user is authenticated
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ verified: false, error: 'Unauthorized' }, { status: 401 })
    }
  } catch {
    return NextResponse.json({ verified: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Determine Stripe instance — test session IDs start with cs_test_
    // After Stripe redirect, the test_mode cookie may be lost, so detect from the ID
    let stripeInstance: Stripe
    const isTestSession = sessionId.startsWith('cs_test_')

    if (isTestSession) {
      // Force test instance for test session IDs
      const testKey = process.env.STRIPE_SECRET_KEY_TEST
      if (!testKey || testKey.includes('PASTE_YOUR')) {
        return NextResponse.json(
          { verified: false, error: 'Stripe test keys not configured' },
          { status: 500 }
        )
      }
      stripeInstance = new Stripe(testKey, { apiVersion: '2026-01-28.clover', typescript: true })
    } else {
      stripeInstance = await getStripe()
    }

    const session = await stripeInstance.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json({
        verified: false,
        error: 'Payment not completed',
        status: session.payment_status,
      })
    }

    // Payment confirmed — ensure booking exists (fallback for webhook)
    let bookingStatus: 'exists' | 'created' | 'failed' | 'not_booking' = 'not_booking'

    if (session.metadata?.booking_data) {
      const adminSupabase = createAdminClient()
      const result = await createBookingFromSession(adminSupabase, stripeInstance, session)

      if (result.created) {
        bookingStatus = 'created'
        console.log('Verify endpoint created fallback booking:', result.bookingId)
      } else if (result.reason === 'already_exists') {
        bookingStatus = 'exists'
      } else {
        bookingStatus = 'failed'
        console.error('Verify endpoint booking creation failed:', result.error)
      }
    }

    return NextResponse.json({
      verified: true,
      status: session.payment_status,
      booking: bookingStatus,
    })
  } catch (error: any) {
    console.error('Stripe verify error:', error?.message || error)
    return NextResponse.json(
      { verified: false, error: 'Could not verify session' },
      { status: 500 }
    )
  }
}
