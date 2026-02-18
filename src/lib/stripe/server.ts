import Stripe from 'stripe'
import { cookies } from 'next/headers'

// Live Stripe instance (lazy-initialized to avoid build-time errors)
let stripeLive: Stripe | null = null

function getStripeLive(): Stripe {
  if (!stripeLive) {
    const liveKey = process.env.STRIPE_SECRET_KEY
    if (!liveKey) {
      throw new Error('STRIPE_SECRET_KEY is not set - configure it in your environment variables')
    }
    stripeLive = new Stripe(liveKey, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    })
  }
  return stripeLive
}

// Test Stripe instance (lazy-initialized)
let stripeTest: Stripe | null = null

function getStripeTest(): Stripe {
  if (!stripeTest) {
    const testKey = process.env.STRIPE_SECRET_KEY_TEST
    if (!testKey || testKey.includes('PASTE_YOUR')) {
      throw new Error('Stripe test keys not configured. Add STRIPE_SECRET_KEY_TEST to .env.local')
    }
    stripeTest = new Stripe(testKey, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    })
  }
  return stripeTest
}

// Check if test mode is active (reads cookie set by master admin)
export async function isTestMode(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    return cookieStore.get('stripe_test_mode')?.value === 'true'
  } catch {
    return false
  }
}

// Get the appropriate Stripe instance based on test mode
export async function getStripe(): Promise<Stripe> {
  const testMode = await isTestMode()
  if (testMode) {
    return getStripeTest()
  }
  return getStripeLive()
}

// Default export for backward compatibility (always live, lazy getter)
export function getStripeLiveInstance(): Stripe {
  return getStripeLive()
}

// Utility function to create a checkout session for booking payment
// Supports Stripe Connect split payments when stripeConnectAccountId is provided
export async function createBookingCheckoutSession({
  serviceId,
  serviceName,
  priceInCents,
  athleteId,
  athleteEmail,
  bookingData,
  successUrl,
  cancelUrl,
  stripeConnectAccountId,
  coachRevenuePercent,
}: {
  serviceId: string
  serviceName: string
  priceInCents: number
  athleteId: string
  athleteEmail: string
  bookingData: any
  successUrl: string
  cancelUrl: string
  stripeConnectAccountId?: string
  coachRevenuePercent?: number
}) {
  const stripeInstance = await getStripe()

  // Check for simulation mode to pass tracking ID
  const cookieStore = await cookies()
  const simulationId = cookieStore.get('simulation_id')?.value

  // Calculate platform fee for Connect split (if applicable)
  // Platform keeps (100 - coachRevenuePercent)% — transferred to coach's account
  const platformFeePercent = coachRevenuePercent !== undefined ? (100 - coachRevenuePercent) : null
  const applicationFeeAmount = platformFeePercent !== null
    ? Math.round(priceInCents * (platformFeePercent / 100))
    : undefined

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: serviceName,
            description: `Training session: ${serviceName}`,
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: athleteEmail,
    client_reference_id: athleteId,
    metadata: {
      service_id: serviceId,
      athlete_id: athleteId,
      booking_data: JSON.stringify(bookingData),
      ...(stripeConnectAccountId && { connect_account_id: stripeConnectAccountId }),
      ...(applicationFeeAmount !== undefined && { platform_fee_cents: applicationFeeAmount.toString() }),
      ...(simulationId && { simulation_id: simulationId }),
    },
  }

  // Add Stripe Connect split payment if coach has connected account
  if (stripeConnectAccountId && applicationFeeAmount !== undefined) {
    sessionParams.payment_intent_data = {
      application_fee_amount: applicationFeeAmount,
      transfer_data: {
        destination: stripeConnectAccountId,
      },
    }
  }

  const session = await stripeInstance.checkout.sessions.create(sessionParams)
  return session
}

// Utility function to create checkout session for training packages
export async function createPackageCheckoutSession({
  packageId,
  packageName,
  priceInCents,
  sessionsIncluded,
  athleteId,
  athleteEmail,
  successUrl,
  cancelUrl,
}: {
  packageId: string
  packageName: string
  priceInCents: number
  sessionsIncluded: number
  athleteId: string
  athleteEmail: string
  successUrl: string
  cancelUrl: string
}) {
  const stripeInstance = await getStripe()

  // Check for simulation mode to pass tracking ID
  const cookieStore = await cookies()
  const simulationId = cookieStore.get('simulation_id')?.value

  const session = await stripeInstance.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: packageName,
            description: `Training package with ${sessionsIncluded} sessions`,
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: athleteEmail,
    client_reference_id: athleteId,
    metadata: {
      package_id: packageId,
      athlete_id: athleteId,
      sessions_included: sessionsIncluded.toString(),
      ...(simulationId && { simulation_id: simulationId }),
    },
  })

  return session
}

// Utility to verify webhook signature
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  // Webhook always uses the key matching the event's mode
  // Stripe sends test events with test webhook secret, live events with live webhook secret
  // Try live first, then test
  const liveWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const testWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET_TEST

  if (!liveWebhookSecret) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable')
  }

  try {
    return getStripeLive().webhooks.constructEvent(payload, signature, liveWebhookSecret)
  } catch (liveErr: any) {
    // If live verification fails and we have test secret, try test
    if (testWebhookSecret && !testWebhookSecret.includes('PASTE_YOUR')) {
      try {
        const testInstance = getStripeTest()
        return testInstance.webhooks.constructEvent(payload, signature, testWebhookSecret)
      } catch (testErr: any) {
        throw new Error(`Webhook signature verification failed: ${liveErr.message}`)
      }
    }
    throw new Error(`Webhook signature verification failed: ${liveErr.message}`)
  }
}

// Utility to create a refund
export async function createRefund(paymentIntentId: string) {
  const stripeInstance = await getStripe()
  return await stripeInstance.refunds.create({
    payment_intent: paymentIntentId,
  })
}
