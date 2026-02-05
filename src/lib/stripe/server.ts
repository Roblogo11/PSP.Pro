import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

// Initialize Stripe with your secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

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
  const session = await stripe.checkout.sessions.create({
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
  const session = await stripe.checkout.sessions.create({
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
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable')
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (err: any) {
    throw new Error(`Webhook signature verification failed: ${err.message}`)
  }
}

// Utility to create a refund
export async function createRefund(paymentIntentId: string) {
  return await stripe.refunds.create({
    payment_intent: paymentIntentId,
  })
}
