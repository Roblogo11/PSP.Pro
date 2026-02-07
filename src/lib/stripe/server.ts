import Stripe from 'stripe'
import { cookies } from 'next/headers'

// Live Stripe instance
const liveKey = process.env.STRIPE_SECRET_KEY
if (!liveKey) {
  console.warn('STRIPE_SECRET_KEY is not set - Stripe live API calls will fail')
}

const stripeLive = new Stripe(liveKey || '', {
  apiVersion: '2026-01-28.clover',
  typescript: true,
})

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
  return stripeLive
}

// Default export for backward compatibility (always live)
export const stripe = stripeLive

// Utility function to create a checkout session for booking payment
export async function createBookingCheckoutSession({
  serviceId,
  serviceName,
  priceInCents,
  athleteId,
  athleteEmail,
  bookingData,
  successUrl,
  cancelUrl,
}: {
  serviceId: string
  serviceName: string
  priceInCents: number
  athleteId: string
  athleteEmail: string
  bookingData: any
  successUrl: string
  cancelUrl: string
}) {
  const stripeInstance = await getStripe()

  const session = await stripeInstance.checkout.sessions.create({
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
    },
  })

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
    return stripeLive.webhooks.constructEvent(payload, signature, liveWebhookSecret)
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
