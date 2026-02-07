import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null> | null = null
let lastTestMode: boolean | null = null

// Get Stripe instance, dynamically switching between live/test keys
export const getStripe = (testMode = false) => {
  // If test mode changed, reset the cached promise
  if (lastTestMode !== null && lastTestMode !== testMode) {
    stripePromise = null
  }
  lastTestMode = testMode

  if (!stripePromise) {
    const key = testMode
      ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST
      : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

    if (!key || key.includes('PASTE_YOUR')) {
      throw new Error(
        testMode
          ? 'Stripe test publishable key not configured. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST to .env.local'
          : 'Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable'
      )
    }

    stripePromise = loadStripe(key)
  }

  return stripePromise
}
